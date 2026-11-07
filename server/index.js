try { if (process.loadEnvFile) process.loadEnvFile(); } catch (e) {}
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const db = require('./db');
const radBot = require('./radbot');
const seed = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
let GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || '';

// ============================================================
// ADMIN EMAILS — MUST MATCH EXACTLY (lowercase)
// ============================================================
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);

const runtimeJwtSecret = JWT_SECRET || require('crypto').randomBytes(48).toString('hex');

// Load MongoDB state before seeding so seed changes are persisted to the active store.
const initializationReady = db.ready.then(() => seed()).then(() => db.flush());

// ============================================================
// SECURITY HEADERS
// ============================================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'",
        "https://accounts.google.com", "https://apis.google.com",
        "https://cdn.tailwindcss.com", "https://unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://lh3.googleusercontent.com", "https://googleusercontent.com"],
      connectSrc: ["'self'", "https://accounts.google.com", "https://oauth2.googleapis.com"],
      frameSrc: ["'self'", "https://accounts.google.com"],
      frameAncestors: ["'none'"],
    }
  },
  crossOriginEmbedderPolicy: false,
  xPoweredBy: false
}));

// Block DevTools / source map access
app.use((req, res, next) => {
  const url = req.url.toLowerCase();
  if (url.endsWith('.map') || url.includes('/__devtools') || url.includes('/webpack-internal')) {
    return res.status(404).end();
  }
  next();
});

// ============================================================
// CORS — PRODUCTION: only allow your own origin
// ============================================================
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(async (req, res, next) => {
  try {
    await initializationReady;
    next();
  } catch (err) {
    console.error('[Database] Startup initialization failed:', err.message);
    res.status(503).json({ error: 'Database is temporarily unavailable.' });
  }
});

// ============================================================
// RATE LIMITING
// ============================================================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { error: 'Rate limit exceeded.' }
});

// ============================================================
// SERVE STATIC FILES — with no-cache for HTML
// ============================================================
app.use(express.static(path.join(__dirname, '..', 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    // Disable source map downloads
    if (filePath.endsWith('.map')) {
      res.status(404).end();
    }
  }
}));

// ============================================================
// HELPER: IP + User Agent
// ============================================================
function getClientMeta(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
             req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Device';
  return { ip, userAgent };
}

// ============================================================
// AUTH MIDDLEWARE
// ============================================================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) { req.user = null; return next(); }
  jwt.verify(token, runtimeJwtSecret, (err, decoded) => {
    if (err) { req.user = null; }
    else {
      req.user = db.getUserById(decoded.id);
      if (!req.user && decoded.email) {
        req.user = db.getUserByEmail(decoded.email);
      }
      if (!req.user && decoded.email) {
        const email = decoded.email.toLowerCase();
        const isAdmin = ADMIN_EMAILS.includes(email);
        req.user = {
          id: decoded.id,
          email,
          name: decoded.name || email.split('@')[0],
          role: isAdmin ? 'admin' : 'user',
          tier: isAdmin ? 'admin' : (decoded.tier || 'trial'),
          status: decoded.status || 'active',
          trialEndsAt: decoded.trialEndsAt || null,
          picture: decoded.picture || null,
          authProvider: 'google'
        };
      }
    }
    next();
  });
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please log in to continue.' });
  if (req.user.status === 'suspended') return res.status(403).json({ error: 'Your account has been suspended.' });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  next();
}

app.use(authenticateToken);
app.use('/api/', apiLimiter);

app.put('/api/auth/profile', requireAuth, (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  if (name.length < 2 || name.length > 80) {
    return res.status(400).json({ error: 'Display name must be between 2 and 80 characters.' });
  }
  if (!/^[\p{L}\p{M}\p{N} .,'-]+$/u.test(name)) {
    return res.status(400).json({ error: 'Display name contains unsupported characters.' });
  }

  const updated = db.updateUser(req.user.id, { name });
  if (!updated) return res.status(404).json({ error: 'User profile not found.' });

  const { ip, userAgent } = getClientMeta(req);
  db.logActivity(updated.id, updated.name, 'profile_name_updated', { name }, ip, userAgent);
  const { passwordHash: _, ...safeUser } = updated;
  res.json({ user: safeUser });
});

// ============================================================
// GOOGLE OAUTH — VERIFY ID TOKEN
// ============================================================
let googleClient = (GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('__')) ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;
let googleOAuthClient = (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REDIRECT_URI)
  ? new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI)
  : null;

app.post('/api/auth/google/exchange', authLimiter, async (req, res) => {
  if (!JWT_SECRET || !googleOAuthClient) {
    return res.status(503).json({ error: 'Google redirect sign-in is not configured on the server.' });
  }
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Google authorization code required.' });

  try {
    const { tokens } = await googleOAuthClient.getToken(code);
    if (!tokens.id_token) return res.status(401).json({ error: 'Google did not return a verified identity token.' });
    res.json({ credential: tokens.id_token });
  } catch (err) {
    console.error('[Google OAuth Exchange Error]', err.message);
    res.status(401).json({ error: 'Google authorization could not be completed. Please try again.' });
  }
});

app.post('/api/auth/google', authLimiter, async (req, res) => {
  if (!JWT_SECRET) {
    return res.status(503).json({ error: 'Secure sign-in is not configured on the server. Deployment administrator must set JWT_SECRET.' });
  }
  const { idToken, credential } = req.body;
  const token = idToken || credential;
  if (!token) return res.status(400).json({ error: 'Google credential required.' });

  const { ip, userAgent } = getClientMeta(req);

  try {
    let googleUser;

    if (!googleClient || !GOOGLE_CLIENT_ID) {
      return res.status(503).json({ error: 'Google sign-in is not configured. Contact the administrator.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    googleUser = {
      sub: payload.sub,
      email: payload.email?.toLowerCase(),
      name: payload.name,
      picture: payload.picture,
      email_verified: payload.email_verified
    };

    if (!googleUser.email) {
      return res.status(400).json({ error: 'Could not get email from Google account.' });
    }
    if (!googleUser.email_verified) {
      return res.status(400).json({ error: 'Google email not verified. Please verify your Google account first.' });
    }

    const isAdmin = ADMIN_EMAILS.includes(googleUser.email);

    // Find or create user
    let user = db.getUserByEmail(googleUser.email);

    if (!user) {
      // New user — create with 1-month free trial
      const trialEndsAt = new Date();
      trialEndsAt.setMonth(trialEndsAt.getMonth() + 1);

      user = db.createUser({
        name: googleUser.name || googleUser.email.split('@')[0],
        email: googleUser.email,
        googleId: googleUser.sub,
        picture: googleUser.picture || null,
        role: isAdmin ? 'admin' : 'user',
        tier: isAdmin ? 'admin' : 'trial',
        trialEndsAt: trialEndsAt.toISOString(),
        authProvider: 'google',
        passwordHash: null,
        lastIp: ip,
        userAgent
      });
      db.logActivity(user.id, user.name, 'google_signup', { email: googleUser.email, ip }, ip, userAgent);
    } else {
      // Existing user — ensure admin status is always correct
      const updates = {
        lastLoginAt: new Date().toISOString(),
        lastIp: ip,
        userAgent,
        picture: googleUser.picture || user.picture,
        googleId: googleUser.sub
      };
      if (isAdmin) {
        updates.role = 'admin';
        updates.tier = 'admin';
      } else if (user.role === 'admin') {
        updates.role = 'user';
        updates.tier = user.tier === 'admin' ? 'trial' : user.tier;
      }
      user = db.updateUser(user.id, updates);
      db.logActivity(user.id, user.name, 'google_login', { email: googleUser.email, ip }, ip, userAgent);
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Contact support.' });
    }

    // Check trial status for non-admin users
    const accessStatus = getAccessStatus(user);

    const jwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      picture: user.picture || null,
      tier: user.tier,
      status: user.status || 'active',
      trialEndsAt: user.trialEndsAt || null
    };
    const authToken = jwt.sign(jwtPayload, runtimeJwtSecret, { expiresIn: '7d' });

    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser, token: authToken, accessStatus });

  } catch (err) {
    console.error('[Google Auth Error]', err.message);
    const message = String(err.message || '').toLowerCase();
    if (message.includes('audience') || message.includes('wrong recipient') || message.includes('issuer')) {
      return res.status(401).json({ error: 'Google rejected this sign-in configuration. Verify the OAuth Client ID and Google Cloud authorized origins.' });
    }
    return res.status(401).json({ error: 'Google blocked this account. If the OAuth app is in Testing mode, add the account as a test user or publish the app externally.' });
  }
});

// ============================================================
// ACCESS STATUS HELPER
// ============================================================
function getAccessStatus(user) {
  if (user.role === 'admin') return { type: 'admin', active: true, daysLeft: null };
  if (user.tier === 'premium') return { type: 'premium', active: true, daysLeft: null };

  if (user.tier === 'trial' && user.trialEndsAt) {
    const now = new Date();
    const end = new Date(user.trialEndsAt);
    const msLeft = end - now;
    if (msLeft > 0) {
      return { type: 'trial', active: true, daysLeft: Math.ceil(msLeft / (1000 * 60 * 60 * 24)) };
    } else {
      return { type: 'expired', active: false, daysLeft: 0 };
    }
  }

  return { type: 'free', active: false, daysLeft: 0 };
}

// ============================================================
// AUTH: ME ENDPOINT
// ============================================================
app.get('/api/auth/me', requireAuth, (req, res) => {
  const { passwordHash: _, ...safeUser } = req.user;
  const accessStatus = getAccessStatus(req.user);
  res.json({ user: safeUser, accessStatus });
});

// ============================================================
// PUBLIC AUTH CONFIG (Google Client ID & Contact URLs)
// ============================================================
app.get('/api/auth/config', (req, res) => {
  const isConfigured = Boolean(
    GOOGLE_CLIENT_ID &&
    !GOOGLE_CLIENT_ID.includes('__') &&
    GOOGLE_CLIENT_ID.endsWith('.apps.googleusercontent.com')
  );
  res.json({
    googleClientId: isConfigured ? GOOGLE_CLIENT_ID : '',
    isConfigured,
    oauthRedirectConfigured: Boolean(googleOAuthClient),
    oauthRedirectUri: googleOAuthClient ? GOOGLE_REDIRECT_URI : '',
    supportEmail: process.env.SUPPORT_EMAIL || '',
    whatsapp: '+92-3238057305',
    whatsappUrl: 'https://wa.me/923238057305?text=Hello%20Synapse%20Support',
    gmailUrl: process.env.SUPPORT_EMAIL
      ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(process.env.SUPPORT_EMAIL)}`
      : '/contact.html'
  });
});

// CONTACT FORM SUBMISSION
app.post('/api/contact', apiLimiter, (req, res) => {
  const { name, email, subject, category, message } = req.body;
  if (!email || !message) {
    return res.status(400).json({ error: 'Email and message are required.' });
  }
  const { ip, userAgent } = getClientMeta(req);
  db.logActivity(
    req.user ? req.user.id : 'anonymous',
    name || email,
    'contact_form_submitted',
    { email, category: category || 'General', subject: subject || 'No Subject', message: message.slice(0, 500) },
    ip,
    userAgent
  );
  res.json({
    success: true,
    message: 'Thank you! Your message has been received by the Synapse medical team. We will respond to ' + email + ' within 24 hours.'
  });
});

// ============================================================
// ACCESS CHECK MIDDLEWARE for protected content
// ============================================================
function requireAccess(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please log in to access this content.' });
  const status = getAccessStatus(req.user);
  if (!status.active) {
    return res.status(402).json({
      error: 'Your free trial has ended. Please subscribe to continue.',
      accessStatus: status,
      requiresUpgrade: true
    });
  }
  next();
}

// ============================================================
// STUDY DATA — Save & sync per user
// ============================================================
app.post('/api/study/progress', requireAuth, (req, res) => {
  const { data: progressData } = req.body;
  if (!progressData) return res.status(400).json({ error: 'Missing progress data.' });
  db.saveStudyProgress(req.user.id, progressData);
  res.json({ success: true });
});

app.get('/api/study/progress', requireAuth, (req, res) => {
  const data = db.getStudyProgress(req.user.id);
  res.json({ data });
});

// FA page access - require active access
app.get('/api/fa/page-token', requireAccess, (req, res) => {
  const token = jwt.sign({ type: 'page', uid: req.user.id }, runtimeJwtSecret, { expiresIn: '1h' });
  res.json({ token });
});

// ============================================================
// MEHLMAN + FA ROUTES (require active subscription)
// ============================================================
app.get('/api/fa/cards', requireAccess, (req, res) => {
  const cardsFile = path.join(__dirname, '..', 'data', 'zetchy_cards.json');
  if (fs.existsSync(cardsFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(cardsFile, 'utf8'));
      return res.json({ success: true, cards: data });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to read cards.' });
    }
  }
  res.json({ success: true, cards: {} });
});

app.get('/api/mehlman/systems', (req, res) => {
  res.json({ systems: db.data.mehlmanSystems || [] });
});

app.get('/api/mehlman/cards', requireAccess, (req, res) => {
  const cardsFile = path.join(__dirname, '..', 'data', 'mehlman_cards_mapped.json');
  if (fs.existsSync(cardsFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(cardsFile, 'utf8'));
      return res.json({ success: true, cards: data });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to read mehlman cards.' });
    }
  }
  res.json({ success: true, cards: {} });
});

app.post('/api/mehlman/progress', requireAuth, (req, res) => {
  const { progress } = req.body || {};
  if (!progress) return res.status(400).json({ error: 'Missing progress data.' });
  db.saveStudyProgress(req.user.id, { mehlmanProgress: progress });
  res.json({ success: true });
});

app.get('/api/mehlman/:id', (req, res) => {
  const sys = (db.data.mehlmanSystems || []).find(s => s.id === req.params.id);
  res.json({ system: sys || null });
});

app.get('/api/fa/systems', (req, res) => {
  res.json({ systems: db.getFirstAidSystems() });
});

app.get('/api/sketchy/decks', requireAccess, (req, res) => {
  res.json({ decks: db.getSketchyDecks() });
});

app.get('/api/sketchy/path', requireAccess, (req, res) => {
  const pathData = db.getSketchyPathData() || {};
  res.json({ ...pathData, pathData });
});

app.get('/api/ddx/categories', requireAccess, (req, res) => {
  res.json({ categories: db.getDDxCategories() });
});

app.get('/api/fa/headings', (req, res) => {
  const headingsFile = path.join(__dirname, '..', 'data', 'zetchy_headings_all.json');
  if (fs.existsSync(headingsFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(headingsFile, 'utf8'));
      return res.json({ success: true, headings: data });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to read headings.' });
    }
  }
  res.json({ success: true, headings: {} });
});

app.get('/api/fa/markers', (req, res) => {
  const markersFile = path.join(__dirname, '..', 'data', 'zetchy_reader_markers.json');
  if (fs.existsSync(markersFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(markersFile, 'utf8'));
      return res.json({ success: true, markers: data });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to read markers.' });
    }
  }
  res.json({ success: true, markers: [] });
});

// ============================================================
// REVIEW/STATS
// ============================================================
app.get('/api/review/stats', requireAuth, (req, res) => {
  const userId = req.user.id;
  const cards = db.getFlashcards(userId);
  res.json({
    dueToday: 0,
    newCards: cards.filter(c => c.state === 'new').length,
    learning: cards.filter(c => c.state === 'learning').length,
    mature: cards.filter(c => c.state === 'mature').length,
    dayStreak: 0,
    settings: { newCardsPerDay: 20, maxReviewsPerDay: 200, targetRetention: 0.90 }
  });
});

// ============================================================
// QUESTIONS ROUTES (require access)
// ============================================================
app.get('/api/questions', requireAccess, (req, res) => {
  const allQuestions = db.getQuestions();
  const isAdmin = req.user.role === 'admin';
  const isPremium = req.user.tier === 'premium' || isAdmin;
  const questions = allQuestions.map(q => {
    if (q.isPremium && !isPremium) {
      return {
        id: q.id, title: q.title, system: q.system,
        discipline: q.discipline, difficulty: q.difficulty,
        isPremium: true, locked: true,
        vignette: q.vignette.substring(0, 120) + '... [Premium Content]'
      };
    }
    return { ...q, locked: false };
  });
  res.json({ questions, total: allQuestions.length, isPremiumUser: isPremium });
});

app.get('/api/questions/:id', requireAccess, (req, res) => {
  const q = db.getQuestionById(req.params.id);
  if (!q) return res.status(404).json({ error: 'Question not found.' });
  const isPremium = req.user.tier === 'premium' || req.user.role === 'admin';
  if (q.isPremium && !isPremium) {
    return res.status(403).json({ error: 'Premium subscription required.', isPremium: true });
  }
  res.json({ question: q });
});

app.post('/api/questions/submit', requireAccess, (req, res) => {
  const { questionId, selectedIndex, timeSpentSeconds } = req.body;
  const q = db.getQuestionById(questionId);
  if (!q) return res.status(404).json({ error: 'Question not found.' });
  const isCorrect = selectedIndex === q.correctIndex;
  const { ip, userAgent } = getClientMeta(req);
  db.logActivity(req.user.id, req.user.name, 'question_answered', {
    questionId, questionTitle: q.title, selectedIndex, isCorrect, timeSpentSeconds
  }, ip, userAgent);
  res.json({ isCorrect, correctIndex: q.correctIndex, explanation: q.explanation, highYieldPearl: q.highYieldPearl });
});

// ============================================================
// RADBOT ROUTES
// ============================================================
app.post('/api/radbot/chat', requireAccess, async (req, res) => {
  const { message, activeQuestionId } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Message cannot be empty.' });
  let activeQuestion = activeQuestionId ? db.getQuestionById(activeQuestionId) : null;
  const { ip, userAgent } = getClientMeta(req);
  try {
    const aiReply = await radBot.generateResponse(message, activeQuestion, req.user.id);
    db.logRadBotChat(req.user.id, req.user.name, message, aiReply, { activeQuestionId });
    db.logActivity(req.user.id, req.user.name, 'radbot_query', { query: message }, ip, userAgent);
    res.json({ reply: aiReply, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('[RadBot Route] Error:', err.message);
    res.status(500).json({ error: 'AI assistant temporarily unavailable.' });
  }
});

app.get('/api/radbot/history', requireAuth, (req, res) => {
  const allChats = db.getRadBotChats(100);
  res.json({ chats: allChats.filter(c => c.userId === req.user.id) });
});

app.post('/api/radbot/clear', requireAuth, (req, res) => {
  radBot.clearHistory(req.user.id);
  res.json({ success: true });
});

app.get('/api/radbot/sessions', requireAuth, (req, res) => {
  res.json({ sessions: db.getRadBotSessions(req.user.id) });
});

app.post('/api/radbot/sessions', requireAuth, (req, res) => {
  const session = req.body;
  if (!session?.id) return res.status(400).json({ error: 'Session ID required.' });
  res.json({ success: true, session: db.saveRadBotSession(req.user.id, session) });
});

app.delete('/api/radbot/sessions/:id', requireAuth, (req, res) => {
  db.deleteRadBotSession(req.user.id, req.params.id);
  res.json({ success: true });
});

// ============================================================
// TESTS
// ============================================================
app.post('/api/tests/submit', requireAccess, (req, res) => {
  const { title, mode, questions, userAnswers, timeSpentSeconds } = req.body;
  const { ip, userAgent } = getClientMeta(req);
  const questionsMap = db.getQuestions().reduce((acc, q) => { acc[q.id] = q; return acc; }, {});
  let correctCount = 0;
  questions.forEach((qId, idx) => {
    const qObj = questionsMap[qId];
    if (qObj && userAnswers[idx] === qObj.correctIndex) correctCount++;
  });
  const scorePercentage = Math.round((correctCount / (questions.length || 1)) * 100);
  const testRecord = db.saveTestResult({
    userId: req.user.id, userName: req.user.name,
    title: title || 'USMLE Block', mode: mode || 'timed',
    totalQuestions: questions.length, correctCount, scorePercentage,
    timeSpentSeconds: timeSpentSeconds || 0, answers: userAnswers
  });
  db.logActivity(req.user.id, req.user.name, 'test_completed', {
    testId: testRecord.id, scorePercentage, correctCount, totalQuestions: questions.length
  }, ip, userAgent);
  res.json({ test: testRecord });
});

app.get('/api/tests/history', requireAuth, (req, res) => {
  res.json({ tests: db.getUserTests(req.user.id) });
});

// ============================================================
// ADMIN DASHBOARD ROUTES
// ============================================================
app.get('/api/admin/overview', requireAdmin, (req, res) => {
  const users = db.getUsers();
  const logs = db.getActivityLogs(1000);
  const chats = db.getRadBotChats(500);
  const todayStr = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().slice(0, 7);
  const activeToday = users.filter(u => u.lastLoginAt?.startsWith(todayStr)).length;
  const premiumCount = users.filter(u => u.tier === 'premium').length;
  const trialCount = users.filter(u => u.tier === 'trial').length;
  const expiredCount = users.filter(u => {
    if (u.tier !== 'trial' || !u.trialEndsAt) return false;
    return new Date(u.trialEndsAt) < new Date();
  }).length;
  const newThisMonth = users.filter(u => u.createdAt?.startsWith(thisMonth)).length;

  // Online in last 15 minutes
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const onlineNow = users.filter(u => u.lastLoginAt >= fifteenMinAgo).length;

  res.json({
    metrics: {
      totalUsers: users.length,
      activeToday,
      onlineNow,
      premiumUsers: premiumCount,
      trialUsers: trialCount,
      expiredTrials: expiredCount,
      newThisMonth,
      totalActivityLogs: logs.length,
      radBotInteractions: chats.length
    },
    recentLogs: logs.slice(0, 50)
  });
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
  const users = db.getUsers().map(u => {
    const { passwordHash: _, ...safe } = u;
    return { ...safe, accessStatus: getAccessStatus(u) };
  });
  res.json({ users });
});

app.put('/api/admin/users/:id', requireAdmin, (req, res) => {
  const { role, tier, status, trialEndsAt } = req.body;
  // Protect admins
  const targetUser = db.getUserById(req.params.id);
  if (!targetUser) return res.status(404).json({ error: 'User not found.' });
  if (ADMIN_EMAILS.includes(targetUser.email) && role && role !== 'admin') {
    return res.status(403).json({ error: 'Cannot change role of a super admin.' });
  }
  const updated = db.updateUser(req.params.id, { role, tier, status, trialEndsAt });
  const { ip, userAgent } = getClientMeta(req);
  db.logActivity(req.user.id, req.user.name, 'admin_updated_user', {
    targetEmail: updated.email, updates: { role, tier, status }
  }, ip, userAgent);
  const { passwordHash: _, ...safe } = updated;
  res.json({ user: safe });
});

app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (user.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself.' });
  if (ADMIN_EMAILS.includes(user.email)) return res.status(403).json({ error: 'Cannot delete a super admin.' });
  db.deleteUser(req.params.id);
  const { ip, userAgent } = getClientMeta(req);
  db.logActivity(req.user.id, req.user.name, 'admin_deleted_user', { targetEmail: user.email }, ip, userAgent);
  res.json({ success: true });
});

app.get('/api/admin/activity', requireAdmin, (req, res) => {
  const limit = parseInt(req.query.limit) || 200;
  res.json({ logs: db.getActivityLogs(limit) });
});

app.get('/api/admin/radbot-logs', requireAdmin, (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  res.json({ chats: db.getRadBotChats(limit) });
});

app.get('/api/admin/sessions-live', requireAdmin, (req, res) => {
  // Returns all users + their last session info
  const users = db.getUsers();
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const live = users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    picture: u.picture || null,
    lastLoginAt: u.lastLoginAt,
    lastIp: u.lastIp || 'Unknown',
    userAgent: u.userAgent || 'Unknown',
    tier: u.tier,
    role: u.role,
    status: u.status,
    trialEndsAt: u.trialEndsAt || null,
    online: (u.lastLoginAt || '') >= fifteenMinAgo
  }));
  res.json({ sessions: live });
});

// Settings
app.get('/api/admin/settings', requireAdmin, (req, res) => {
  res.json({ settings: db.getSettings() });
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const updated = db.updateSettings(req.body);
  const { ip, userAgent } = getClientMeta(req);
  db.logActivity(req.user.id, req.user.name, 'admin_updated_settings', {}, ip, userAgent);
  res.json({ settings: updated });
});

// Google OAuth configuration is deployment-managed only and cannot be changed by users.

// Admin Question CRUD
app.post('/api/admin/questions', requireAdmin, (req, res) => {
  const { title, system, discipline, difficulty, isPremium, vignette, imageUrl, imageAnnotation, options, correctIndex, explanation, highYieldPearl } = req.body;
  if (!title || !vignette || !options || correctIndex === undefined) {
    return res.status(400).json({ error: 'Title, vignette, options, and correctIndex are required.' });
  }
  const newQ = db.createQuestion({ title, system: system || 'General Medicine', discipline: discipline || 'Radiology', difficulty: difficulty || 'Medium', isPremium: Boolean(isPremium), vignette, imageUrl: imageUrl || '', imageAnnotation: imageAnnotation || '', options, correctIndex: parseInt(correctIndex), explanation: explanation || '', highYieldPearl: highYieldPearl || '' });
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
  if (!db.deleteQuestion(req.params.id)) return res.status(404).json({ error: 'Question not found.' });
  const { ip, userAgent } = getClientMeta(req);
  db.logActivity(req.user.id, req.user.name, 'admin_deleted_question', { questionId: req.params.id }, ip, userAgent);
  res.json({ success: true });
});

// Sketch
app.post('/api/save-sketch', requireAdmin, express.json({ limit: '50mb' }), (req, res) => {
  const { slug, dataUrl, type } = req.body;
  if (!slug || !dataUrl) return res.status(400).json({ error: 'Missing slug or dataUrl.' });
  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const ext = dataUrl.includes('image/webp') ? 'webp' : 'jpg';
  const prefix = type === 'scene' ? 'scene_' : 'thumb_';
  const filename = `${prefix}${slug}.${ext}`;
  const targetPath = path.join(__dirname, '..', 'public', 'assets', 'sketches', filename);
  fs.writeFileSync(targetPath, buffer);
  if (type === 'scene') fs.writeFileSync(path.join(__dirname, '..', 'public', 'assets', 'sketches', `canvas_${slug}.${ext}`), buffer);
  console.log(`[Sketch Saved] ${filename}`);
  res.json({ success: true, filename, size: buffer.length });
});

// ============================================================
// SPA FALLBACK — serve login page if not authenticated
// ============================================================
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ============================================================
// EXPORT & START
// ============================================================
module.exports = app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🩺 Synapse USMLE Platform running on http://localhost:${PORT}`);
    console.log(`👑 Admins: ${ADMIN_EMAILS.join(', ')}`);
    console.log(`🔐 Google OAuth: ${GOOGLE_CLIENT_ID ? 'ACTIVE' : 'DEV MODE (no client ID)'}`);
    console.log('====================================================');
  });
}
