try { if (process.loadEnvFile) process.loadEnvFile(); } catch (e) {}
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');
const radBot = require('./radbot');
const seed = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'radmed_secret_jwt_key_2026';

// Run DB seed on startup if fresh
seed();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// API: First Aid Flashcards & AnKing Questions
app.get('/api/fa/cards', (req, res) => {
  const cardsFile = path.join(__dirname, '..', 'data', 'zetchy_cards.json');
  if (fs.existsSync(cardsFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(cardsFile, 'utf8'));
      return res.json({ success: true, cards: data });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to read zetchy_cards.json' });
    }
  }
  res.json({ success: true, cards: {} });
});

// Static frontend serving
app.use(express.static(path.join(__dirname, '..', 'public')));

// Helper: extract client IP and user agent
function getClientMeta(req) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Device';
  return { ip, userAgent };
}

// Middleware: Authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      req.user = db.getUserById(decoded.id);
    }
    next();
  });
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  if (req.user.status === 'suspended') {
    return res.status(403).json({ error: 'Your account has been suspended by an administrator.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

app.use(authenticateToken);

// ==========================================
// 1. AUTHENTICATION & PROFILE ROUTES
// ==========================================

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, specialty, institution } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const { ip, userAgent } = getClientMeta(req);
  const passwordHash = bcrypt.hashSync(password, 10);
  const user = db.createUser({
    name,
    email,
    passwordHash,
    specialty: specialty || 'Medical Student',
    institution: institution || 'Medical School',
    role: 'user',
    tier: 'free',
    lastIp: ip,
    userAgent
  });

  db.logActivity(user.id, user.name, 'user_registered', { email, institution }, ip, userAgent);

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { passwordHash: _, ...safeUser } = user;
  res.status(201).json({ user: safeUser, token });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
  }

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const { ip, userAgent } = getClientMeta(req);
  db.updateUser(user.id, {
    lastLoginAt: new Date().toISOString(),
    lastIp: ip,
    userAgent
  });

  db.logActivity(user.id, user.name, 'user_login', { tier: user.tier, role: user.role }, ip, userAgent);

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser, token });
});

// Current user
app.get('/api/auth/me', requireAuth, (req, res) => {
  const { passwordHash: _, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// Upgrade to Premium
app.post('/api/auth/upgrade', requireAuth, (req, res) => {
  const { ip, userAgent } = getClientMeta(req);
  const updated = db.updateUser(req.user.id, { tier: 'premium' });
  db.logActivity(req.user.id, req.user.name, 'subscription_upgraded', { tier: 'premium' }, ip, userAgent);
  const { passwordHash: _, ...safeUser } = updated;
  res.json({ user: safeUser, message: 'Successfully upgraded to Premium VIP Tier!' });
});

// Complete Tour
app.post('/api/auth/complete-tour', requireAuth, (req, res) => {
  const updated = db.updateUser(req.user.id, { hasCompletedTour: true });
  const { passwordHash: _, ...safeUser } = updated;
  res.json({ user: safeUser });
});

// ==========================================
// 1.5 ZETCHY SECTIONS (FA, SKETCHY, DDX, CARDS)
// ==========================================

app.get('/api/mehlman/systems', (req, res) => {
  res.json({ systems: db.data.mehlmanSystems || [] });
});

app.get('/api/mehlman/:id', (req, res) => {
  const sys = (db.data.mehlmanSystems || []).find(s => s.id === req.params.id);
  res.json({ system: sys || null });
});

app.get('/api/fa/systems', (req, res) => {
  res.json({ systems: db.getFirstAidSystems() });
});

app.get('/api/sketchy/decks', (req, res) => {
  res.json({ decks: db.getSketchyDecks() });
});

app.get('/api/sketchy/path', (req, res) => {
  const pathData = db.getSketchyPathData() || {};
  res.json({ ...pathData, pathData });
});

app.get('/api/ddx/categories', (req, res) => {
  res.json({ categories: db.getDDxCategories() });
});

app.get('/api/review/stats', (req, res) => {
  const userId = req.user ? req.user.id : null;
  const cards = db.getFlashcards(userId);
  res.json({
    dueToday: 0,
    newCards: cards.filter(c => c.state === 'new').length,
    learning: cards.filter(c => c.state === 'learning').length,
    mature: cards.filter(c => c.state === 'mature').length,
    dayStreak: 0,
    settings: {
      newCardsPerDay: 20,
      maxReviewsPerDay: 200,
      targetRetention: 0.90
    }
  });
});


// ==========================================
// 2. QUESTION BANK (QBANK) ROUTES
// ==========================================

// Get list of questions
app.get('/api/questions', (req, res) => {
  const allQuestions = db.getQuestions();
  const isPremiumUser = req.user && (req.user.tier === 'premium' || req.user.role === 'admin');

  // Filter or mask premium questions for free users
  const questions = allQuestions.map(q => {
    if (q.isPremium && !isPremiumUser) {
      return {
        id: q.id,
        title: q.title,
        system: q.system,
        discipline: q.discipline,
        difficulty: q.difficulty,
        isPremium: true,
        locked: true,
        vignette: q.vignette.substring(0, 120) + '... [Premium Case Content Locked]'
      };
    }
    return { ...q, locked: false };
  });

  res.json({ questions, total: allQuestions.length, isPremiumUser });
});

// Get single question
app.get('/api/questions/:id', (req, res) => {
  const q = db.getQuestionById(req.params.id);
  if (!q) return res.status(404).json({ error: 'Question not found.' });

  const isPremiumUser = req.user && (req.user.tier === 'premium' || req.user.role === 'admin');
  if (q.isPremium && !isPremiumUser) {
    return res.status(403).json({
      error: 'This high-yield case requires a Premium Membership.',
      isPremium: true
    });
  }

  res.json({ question: q });
});

// Submit answer for single question
app.post('/api/questions/submit', requireAuth, (req, res) => {
  const { questionId, selectedIndex, timeSpentSeconds } = req.body;
  const q = db.getQuestionById(questionId);
  if (!q) return res.status(404).json({ error: 'Question not found.' });

  const isCorrect = selectedIndex === q.correctIndex;
  const { ip, userAgent } = getClientMeta(req);

  db.logActivity(req.user.id, req.user.name, 'question_answered', {
    questionId,
    questionTitle: q.title,
    selectedIndex,
    isCorrect,
    timeSpentSeconds
  }, ip, userAgent);

  res.json({
    isCorrect,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    highYieldPearl: q.highYieldPearl
  });
});

// ==========================================
// 3. AI RAD BOT ROUTES
// ==========================================

app.post('/api/radbot/chat', async (req, res) => {
  const { message, activeQuestionId } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  let activeQuestion = null;
  if (activeQuestionId) {
    activeQuestion = db.getQuestionById(activeQuestionId);
  }

  const userId = req.user ? req.user.id : 'guest';
  const userName = req.user ? req.user.name : 'Guest Visitor';
  const { ip, userAgent } = getClientMeta(req);

  try {
    const aiReply = await radBot.generateResponse(message, activeQuestion, userId);

    db.logRadBotChat(userId, userName, message, aiReply, { activeQuestionId });
    db.logActivity(userId, userName, 'radbot_query', { query: message }, ip, userAgent);

    res.json({
      reply: aiReply,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[RadBot Route] Unexpected error:', err.message);
    res.status(500).json({ error: 'AI assistant temporarily unavailable. Please try again.' });
  }
});

app.get('/api/radbot/history', requireAuth, (req, res) => {
  const allChats = db.getRadBotChats(100);
  const userChats = allChats.filter(c => c.userId === req.user.id);
  res.json({ chats: userChats });
});

// Clear RadBot conversation history (new chat)
app.post('/api/radbot/clear', (req, res) => {
  const userId = req.user ? req.user.id : 'guest';
  radBot.clearHistory(userId);
  res.json({ success: true, message: 'Conversation cleared.' });
});

// Chat Sessions API (list, save, delete)
app.get('/api/radbot/sessions', (req, res) => {
  const userId = req.user ? req.user.id : 'guest';
  const sessions = db.getRadBotSessions(userId);
  res.json({ sessions });
});

app.post('/api/radbot/sessions', (req, res) => {
  const userId = req.user ? req.user.id : 'guest';
  const session = req.body;
  if (!session || !session.id) {
    return res.status(400).json({ error: 'Session object with ID required.' });
  }
  const saved = db.saveRadBotSession(userId, session);
  res.json({ success: true, session: saved });
});

app.delete('/api/radbot/sessions/:id', (req, res) => {
  const userId = req.user ? req.user.id : 'guest';
  const sessionId = req.params.id;
  db.deleteRadBotSession(userId, sessionId);
  res.json({ success: true, message: 'Session deleted.' });
});

// ==========================================
// 4. TEST SESSIONS & MOCK EXAMS
// ==========================================

app.post('/api/tests/submit', requireAuth, (req, res) => {
  const { title, mode, questions, userAnswers, timeSpentSeconds } = req.body;
  const { ip, userAgent } = getClientMeta(req);

  let correctCount = 0;
  const questionsMap = db.getQuestions().reduce((acc, q) => { acc[q.id] = q; return acc; }, {});

  questions.forEach((qId, idx) => {
    const qObj = questionsMap[qId];
    if (qObj && userAnswers[idx] === qObj.correctIndex) {
      correctCount++;
    }
  });

  const scorePercentage = Math.round((correctCount / (questions.length || 1)) * 100);

  const testRecord = db.saveTestResult({
    userId: req.user.id,
    userName: req.user.name,
    title: title || 'Comprehensive USMLE Block',
    mode: mode || 'timed',
    totalQuestions: questions.length,
    correctCount,
    scorePercentage,
    timeSpentSeconds: timeSpentSeconds || 0,
    answers: userAnswers
  });

  db.logActivity(req.user.id, req.user.name, 'test_completed', {
    testId: testRecord.id,
    scorePercentage,
    correctCount,
    totalQuestions: questions.length
  }, ip, userAgent);

  res.json({ test: testRecord });
});

app.get('/api/tests/history', requireAuth, (req, res) => {
  const history = db.getUserTests(req.user.id);
  res.json({ tests: history });
});

// ==========================================
// 5. ADMIN DASHBOARD & AUDIT MONITORING
// ==========================================

// Real-time overview metrics
app.get('/api/admin/overview', requireAdmin, (req, res) => {
  const users = db.getUsers();
  const questions = db.getQuestions();
  const logs = db.getActivityLogs(500);
  const chats = db.getRadBotChats(500);

  const todayStr = new Date().toISOString().split('T')[0];
  const activeToday = users.filter(u => u.lastLoginAt && u.lastLoginAt.startsWith(todayStr)).length;
  const premiumCount = users.filter(u => u.tier === 'premium').length;

  res.json({
    metrics: {
      totalUsers: users.length,
      activeToday,
      premiumUsers: premiumCount,
      totalQuestions: questions.length,
      totalActivityLogs: logs.length,
      radBotInteractions: chats.length
    },
    recentLogs: logs.slice(0, 20)
  });
});

// Admin: User list & live status
app.get('/api/admin/users', requireAdmin, (req, res) => {
  const users = db.getUsers().map(u => {
    const { passwordHash: _, ...safe } = u;
    return safe;
  });
  res.json({ users });
});

// Admin: Update user (tier, role, status)
app.put('/api/admin/users/:id', requireAdmin, (req, res) => {
  const { role, tier, status } = req.body;
  const updated = db.updateUser(req.params.id, { role, tier, status });
  if (!updated) return res.status(404).json({ error: 'User not found.' });

  const { ip, userAgent } = getClientMeta(req);
  db.logActivity(req.user.id, req.user.name, 'admin_updated_user', {
    targetUserId: req.params.id,
    targetEmail: updated.email,
    updates: { role, tier, status }
  }, ip, userAgent);

  const { passwordHash: _, ...safe } = updated;
  res.json({ user: safe });
});

// Admin: Delete user
app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (user.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself.' });

  db.deleteUser(req.params.id);
  const { ip, userAgent } = getClientMeta(req);
  db.logActivity(req.user.id, req.user.name, 'admin_deleted_user', { targetEmail: user.email }, ip, userAgent);

  res.json({ success: true, message: `User ${user.email} deleted.` });
});

// Admin: Real-time Live Activity Audit Logs
app.get('/api/admin/activity', requireAdmin, (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const logs = db.getActivityLogs(limit);
  res.json({ logs });
});

// Admin: RadBot conversations audit
app.get('/api/admin/radbot-logs', requireAdmin, (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const chats = db.getRadBotChats(limit);
  res.json({ chats });
});

// Admin: Questions CMS (Create, Update, Delete)
app.post('/api/admin/questions', requireAdmin, (req, res) => {
  const { title, system, discipline, difficulty, isPremium, vignette, imageUrl, imageAnnotation, options, correctIndex, explanation, highYieldPearl } = req.body;
  if (!title || !vignette || !options || correctIndex === undefined) {
    return res.status(400).json({ error: 'Title, vignette, options, and correctIndex are required.' });
  }

  const newQ = db.createQuestion({
    title,
    system: system || 'General Medicine',
    discipline: discipline || 'Radiology',
    difficulty: difficulty || 'Medium',
    isPremium: Boolean(isPremium),
    vignette,
    imageUrl: imageUrl || '',
    imageAnnotation: imageAnnotation || '',
    options,
    correctIndex: parseInt(correctIndex),
    explanation: explanation || '',
    highYieldPearl: highYieldPearl || ''
  });

  const { ip, userAgent } = getClientMeta(req);
  db.logActivity(req.user.id, req.user.name, 'admin_created_question', { questionId: newQ.id, title }, ip, userAgent);

  res.status(201).json({ question: newQ });
});

app.put('/api/admin/questions/:id', requireAdmin, (req, res) => {
  const updated = db.updateQuestion(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Question not found.' });

  const { ip, userAgent } = getClientMeta(req);
  db.logActivity(req.user.id, req.user.name, 'admin_updated_question', { questionId: req.params.id }, ip, userAgent);

  res.json({ question: updated });
});

app.delete('/api/admin/questions/:id', requireAdmin, (req, res) => {
  const success = db.deleteQuestion(req.params.id);
  if (!success) return res.status(404).json({ error: 'Question not found.' });

  const { ip, userAgent } = getClientMeta(req);
  db.logActivity(req.user.id, req.user.name, 'admin_deleted_question', { questionId: req.params.id }, ip, userAgent);

  res.json({ success: true });
});

// Admin: Bulk Import Questions (JSON)
app.post('/api/admin/questions/import', requireAdmin, (req, res) => {
  const { questions } = req.body;
  if (!Array.isArray(questions)) {
    return res.status(400).json({ error: 'Invalid data format. Expected an array of questions.' });
  }

  let importedCount = 0;
  questions.forEach(q => {
    if (q.title && q.vignette && Array.isArray(q.options)) {
      db.createQuestion(q);
      importedCount++;
    }
  });

  const { ip, userAgent } = getClientMeta(req);
  db.logActivity(req.user.id, req.user.name, 'admin_bulk_imported_questions', { count: importedCount }, ip, userAgent);

  res.json({ success: true, importedCount });
});

// Admin: Settings
app.get('/api/admin/settings', (req, res) => {
  const settings = db.getSettings();
  res.json({ settings });
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const updated = db.updateSettings(req.body);
  const { ip, userAgent } = getClientMeta(req);
  db.logActivity(req.user.id, req.user.name, 'admin_updated_settings', {}, ip, userAgent);
  res.json({ settings: updated });
});

// Endpoint to receive extracted sketches from browser session
app.post('/api/save-sketch', express.json({ limit: '50mb' }), (req, res) => {
  const { slug, dataUrl, type } = req.body;
  if (!slug || !dataUrl) {
    return res.status(400).json({ error: 'Missing slug or dataUrl' });
  }

  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const ext = dataUrl.includes('image/webp') ? 'webp' : 'jpg';
  const prefix = type === 'scene' ? 'scene_' : 'thumb_';
  const filename = `${prefix}${slug}.${ext}`;
  const targetPath = path.join(__dirname, '..', 'public', 'assets', 'sketches', filename);

  const fs = require('fs');
  fs.writeFileSync(targetPath, buffer);
  
  // Also save standard thumb and canvas fallbacks
  if (type === 'scene') {
    fs.writeFileSync(path.join(__dirname, '..', 'public', 'assets', 'sketches', `canvas_${slug}.${ext}`), buffer);
  }

  console.log(`[Sketch Asset Saved] ${filename} (${buffer.length} bytes)`);
  res.json({ success: true, filename, size: buffer.length });
});

// ==========================================
// FA HEADINGS JSON — zetchy_headings_all.json
// ==========================================
app.get('/api/fa/headings', (req, res) => {
  const headingsFile = path.join(__dirname, '..', 'data', 'zetchy_headings_all.json');
  if (fs.existsSync(headingsFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(headingsFile, 'utf8'));
      return res.json({ success: true, headings: data });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to read zetchy_headings_all.json' });
    }
  }
  res.json({ success: true, headings: {} });
});

// ==========================================
// FA READER MARKERS API — zetchy_reader_markers.json
// ==========================================
app.get('/api/fa/markers', (req, res) => {
  const markersFile = path.join(__dirname, '..', 'data', 'zetchy_reader_markers.json');
  if (fs.existsSync(markersFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(markersFile, 'utf8'));
      return res.json({ success: true, markers: data });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to read zetchy_reader_markers.json' });
    }
  }
  res.json({ success: true, markers: [] });
});

// ==========================================
// MEHLMAN CARDS MAPPING API
// ==========================================
app.get('/api/mehlman/cards', (req, res) => {
  const cardsFile = path.join(__dirname, '..', 'data', 'mehlman_cards_mapped.json');
  if (fs.existsSync(cardsFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(cardsFile, 'utf8'));
      return res.json({ success: true, cards: data });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to read mehlman_cards_mapped.json' });
    }
  }
  res.json({ success: true, cards: {} });
});

// Sync Mehlman Progress (easy / forgetting)
app.post('/api/mehlman/progress', (req, res) => {
  const { progress } = req.body;
  if (!db.data.userProgress) db.data.userProgress = {};
  db.data.userProgress.mehlman = progress || {};
  db.save();
  res.json({ success: true });
});

// SPA fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Export for Vercel Serverless
module.exports = app;

// Start Server locally if not imported as a serverless function
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🩺 RadMed USMLE Platform running on http://localhost:${PORT}`);
    console.log('👑 Admin Portal: Login with admin@radmed.local / Admin123!');
    console.log('🤖 AI Rad Bot: Active and loaded with Radiology KB');
    console.log('====================================================');
  });
}