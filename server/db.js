const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultState = {
  users: [],
  activity_logs: [],
  questions: [],
  tests: [],
  radbot_chats: [],
  flashcards: [],
  settings: {
    platformName: 'RadMed USMLE',
    tagline: 'High-Yield Medical & Radiology Board Preparation',
    logoUrl: '/assets/logo.svg',
    primaryColor: '#0284c7',
    allowSignups: true,
    enableRadBot: true,
    aiModel: 'RadBot Clinical Engine v3.5',
    apiKey: ''
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
      console.error('Error loading db.json, initializing fresh db:', err.message);
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

  // --- Collection Helpers ---

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

  // Activity Logs (Admin Audit Trail)
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
    // Keep last 1,000 logs for performance
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

  updateQuestion(id, updates) {
    const idx = this.data.questions.findIndex(q => q.id === id);
    if (idx === -1) return null;
    this.data.questions[idx] = { ...this.data.questions[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.questions[idx];
  }

  deleteQuestion(id) {
    const idx = this.data.questions.findIndex(q => q.id === id);
    if (idx === -1) return false;
    this.data.questions.splice(idx, 1);
    this.save();
    return true;
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

  // Tests
  saveTestResult(testData) {
    const test = {
      id: 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      ...testData
    };
    if (!this.data.tests) this.data.tests = [];
    this.data.tests.unshift(test);
    this.save();
    return test;
  }

  getUserTests(userId) {
    return (this.data.tests || []).filter(t => t.userId === userId);
  }

  // Settings
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
