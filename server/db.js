const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultState = {
  users: [],
  activity_logs: [],
  questions: [],
  tests: [],
  radbot_chats: [],
  radbot_sessions: [],
  flashcards: [],
  firstAidSystems: [],
  sketchyDecks: [],
  ddxCategories: [],
  settings: {
    platformName: 'Zetchy',
    tagline: 'All-in-One USMLE, First Aid, Sketchy, Flashcards & AI DDx Station',
    logoUrl: '/assets/logo.svg',
    primaryColor: '#e11d48',
    allowSignups: true,
    enableRadBot: true
  }
};

class Database {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        return { ...defaultState, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.error('Error loading db.json:', err.message);
    }
    this.save(defaultState);
    return defaultState;
  }

  save(data = this.data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving db.json:', err.message);
    }
  }

  // Users
  getUsers() {
    return this.data.users || [];
  }

  getUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData) {
    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      status: 'active',
      tier: 'free',
      role: 'user',
      hasCompletedTour: false,
      trialDaysRemaining: 2,
      ...userData
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.users[idx];
  }

  deleteUser(id) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    this.data.users.splice(idx, 1);
    this.save();
    return true;
  }

  // Activity Logs
  logActivity(userId, userName, action, details = {}, ip = '127.0.0.1', userAgent = 'Unknown') {
    const log = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      userId,
      userName: userName || 'Anonymous',
      action,
      details,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    };
    if (!this.data.activity_logs) this.data.activity_logs = [];
    this.data.activity_logs.unshift(log);
    if (this.data.activity_logs.length > 1000) {
      this.data.activity_logs = this.data.activity_logs.slice(0, 1000);
    }
    this.save();
    return log;
  }

  getActivityLogs(limit = 100) {
    return (this.data.activity_logs || []).slice(0, limit);
  }

  // Questions
  getQuestions() {
    return this.data.questions || [];
  }

  getQuestionById(id) {
    return this.data.questions.find(q => q.id === id);
  }

  createQuestion(qData) {
    const newQ = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      ...qData
    };
    this.data.questions.push(newQ);
    this.save();
    return newQ;
  }

  deleteQuestion(id) {
    const idx = this.data.questions.findIndex(q => q.id === id);
    if (idx === -1) return false;
    this.data.questions.splice(idx, 1);
    this.save();
    return true;
  }

  // First Aid Systems
  getFirstAidSystems() {
    return this.data.firstAidSystems || [];
  }

  // Sketchy Decks
  getSketchyDecks() {
    return this.data.sketchyDecks || [];
  }

  getSketchyPathData() {
    return this.data.sketchyPathData || null;
  }

  // DDx Categories
  getDDxCategories() {
    return this.data.ddxCategories || [];
  }

  // Flashcards (FSRS Spaced Repetition)
  getFlashcards(userId) {
    return (this.data.flashcards || []).filter(c => !userId || c.userId === userId);
  }

  saveFlashcard(card) {
    if (!this.data.flashcards) this.data.flashcards = [];
    const newCard = {
      id: 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      state: 'new', // new, learning, review
      dueDate: new Date().toISOString(),
      interval: 1,
      ease: 2.5,
      ...card
    };
    this.data.flashcards.push(newCard);
    this.save();
    return newCard;
  }

  // RadBot Chats
  logRadBotChat(userId, userName, message, response, context = {}) {
    const chat = {
      id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      userId,
      userName: userName || 'Guest',
      message,
      response,
      context,
      timestamp: new Date().toISOString()
    };
    if (!this.data.radbot_chats) this.data.radbot_chats = [];
    this.data.radbot_chats.unshift(chat);
    if (this.data.radbot_chats.length > 1000) {
      this.data.radbot_chats = this.data.radbot_chats.slice(0, 1000);
    }
    this.save();
    return chat;
  }

  getRadBotChats(limit = 100) {
    return (this.data.radbot_chats || []).slice(0, limit);
  }

  // RadBot Chat Sessions (with 10,000 words max & 7 days retention)
  saveRadBotSession(userId, session) {
    if (!this.data.radbot_sessions) this.data.radbot_sessions = [];
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    // 1. Prune all sessions older than 7 days
    this.data.radbot_sessions = this.data.radbot_sessions.filter(s => {
      const ts = s.updatedAt ? new Date(s.updatedAt).getTime() : new Date(s.createdAt || now).getTime();
      return (now - ts) < ONE_WEEK_MS;
    });

    if (!session || !session.id) return null;

    // 2. Enforce 10,000 words maximum for this saved session
    const countWords = (txt) => (txt ? txt.trim().split(/\s+/).filter(Boolean).length : 0);
    const messages = Array.isArray(session.messages) ? [...session.messages] : [];
    let totalWords = messages.reduce((sum, m) => sum + countWords(m.text || m.content || ''), 0);

    // If over 10,000 words, trim oldest messages until under 10k
    while (totalWords > 10000 && messages.length > 2) {
      const removed = messages.shift();
      totalWords -= countWords(removed.text || removed.content || '');
    }

    const cleanedSession = {
      id: session.id,
      userId: userId || 'guest',
      title: session.title || 'Conversation',
      createdAt: session.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount: totalWords,
      messages
    };

    // Replace if existing, or unshift
    const idx = this.data.radbot_sessions.findIndex(s => s.id === cleanedSession.id && s.userId === cleanedSession.userId);
    if (idx >= 0) {
      this.data.radbot_sessions[idx] = cleanedSession;
    } else {
      this.data.radbot_sessions.unshift(cleanedSession);
    }

    // Keep max 50 recent sessions per user
    this.save();
    return cleanedSession;
  }

  getRadBotSessions(userId) {
    if (!this.data.radbot_sessions) this.data.radbot_sessions = [];
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    // Prune expired
    this.data.radbot_sessions = this.data.radbot_sessions.filter(s => {
      const ts = s.updatedAt ? new Date(s.updatedAt).getTime() : new Date(s.createdAt || now).getTime();
      return (now - ts) < ONE_WEEK_MS;
    });

    return this.data.radbot_sessions
      .filter(s => s.userId === userId || s.userId === 'guest')
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  }

  deleteRadBotSession(userId, sessionId) {
    if (!this.data.radbot_sessions) return false;
    this.data.radbot_sessions = this.data.radbot_sessions.filter(s => !(s.id === sessionId && (s.userId === userId || s.userId === 'guest')));
    this.save();
    return true;
  }

  getSettings() {
    return this.data.settings || defaultState.settings;
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
    return this.data.settings;
  }
}

module.exports = new Database();
