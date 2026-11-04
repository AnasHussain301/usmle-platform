// ==========================================
// RAD BOT — Gemini 1.5 Flash + RAG Engine
// Full platform knowledge embedded via system prompt
// ==========================================

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildSystemPrompt } = require('./app_context');

// API key stored server-side only — NEVER expose to client
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

// Model priority list — tries each in order until one works
// gemini-flash-lite-latest is confirmed working with this API key
const MODEL_PRIORITY = [
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-pro-latest',
];

let genAI = null;
let geminiModel = null;
let workingModelName = null;

function initGemini() {
  if (geminiModel) return geminiModel;
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const modelName = workingModelName || MODEL_PRIORITY[0];
    geminiModel = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        maxOutputTokens: 1500,
        temperature: 0.4,
        topP: 0.9,
      },
    });
    workingModelName = modelName;
    return geminiModel;
  } catch (err) {
    console.error('[RadBot] Failed to init Gemini:', err.message);
    return null;
  }
}

// In-memory conversation history per session (keyed by userId)
// Each entry: { role: 'user'|'model', parts: [{ text: string }] }
const conversationHistory = new Map();

const MAX_HISTORY_TURNS = 8; // Keep last 8 turns (16 messages) to stay within context

function getHistory(userId) {
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, []);
  }
  return conversationHistory.get(userId);
}

function appendHistory(userId, role, text) {
  const history = getHistory(userId);
  history.push({ role, parts: [{ text }] });
  // Trim to max history
  while (history.length > MAX_HISTORY_TURNS * 2) {
    history.splice(0, 2); // Remove oldest user+model pair
  }
}

class RadBotEngine {
  constructor() {
    // Build system prompt once at startup (lazy load topics)
    this._systemPrompt = null;
    // Fallback knowledge for when Gemini is unavailable
    this.fallbackKB = this._buildFallbackKB();
  }

  getSystemPrompt() {
    if (!this._systemPrompt) {
      try {
        this._systemPrompt = buildSystemPrompt();
      } catch (e) {
        this._systemPrompt = 'You are RadBot, a USMLE AI study assistant. Be concise, medical, and board-focused.';
      }
    }
    return this._systemPrompt;
  }

  // ---- Main async entry point ----
  async generateResponseAsync(userMessage, activeQuestion, userId = 'guest') {
    // If Gemini is unavailable, fall back to rule-based
    if (!genAI) {
      try {
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      } catch (e) {
        return this._fallbackResponse(userMessage, activeQuestion);
      }
    }

    const history = getHistory(userId);
    const systemPrompt = this.getSystemPrompt();

    // Build extra context if user is looking at a specific question
    let questionContext = '';
    if (activeQuestion) {
      const correctLetter = ['A', 'B', 'C', 'D', 'E'][activeQuestion.correctIndex] || 'A';
      const correctText = (activeQuestion.options || [])[activeQuestion.correctIndex] || '';
      questionContext = `\n\n[ACTIVE QUESTION CONTEXT]\nThe user is currently viewing this question:\nQuestion: ${activeQuestion.question}\nOptions: ${(activeQuestion.options || []).map((o, i) => `${['A','B','C','D','E'][i]}) ${o}`).join(' | ')}\nCorrect Answer: (${correctLetter}) ${correctText}\nExplanation: ${activeQuestion.explanation || 'Not available'}\n`;
    }

    const fullUserMessage = questionContext
      ? `${userMessage}\n\n${questionContext}`
      : userMessage;

    // Try each model in priority order
    for (const modelName of MODEL_PRIORITY) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            maxOutputTokens: 1500,
            temperature: 0.4,
            topP: 0.9,
          },
        });

        const chat = model.startChat({
          history: [
            { role: 'user', parts: [{ text: `[SYSTEM INSTRUCTIONS]\n${systemPrompt}` }] },
            { role: 'model', parts: [{ text: 'Understood. I am ANSI 1.0 PRO, your advanced neural USMLE assistant on Synapse. I will answer all medical and board study questions in a concise, high-yield, board-focused style. How can I assist your prep today?' }] },
            ...history,
          ],
        });

        const result = await chat.sendMessage(fullUserMessage);
        const reply = result.response.text();

        // Success — cache the working model name
        workingModelName = modelName;
        geminiModel = model;

        // Store in conversation history
        appendHistory(userId, 'user', userMessage);
        appendHistory(userId, 'model', reply);

        console.log(`[RadBot] ✅ Responded using model: ${modelName}`);
        return reply;

      } catch (err) {
        const msg = err.message || '';
        console.warn(`[RadBot] Model ${modelName} failed: ${msg.slice(0, 120)}`);

        // Auth/key error — no point trying other models
        if (msg.includes('401') || msg.includes('403') || msg.includes('API_KEY')) {
          return '⚠️ **API key issue.** Please contact the platform administrator.';
        }
        // 429, 404, 503 — try next model in list
        // continue loop
      }
    }

    // All models failed — use rule-based fallback
    console.error('[RadBot] All Gemini models failed. Using rule-based fallback.');
    return this._fallbackResponse(userMessage, activeQuestion);
  }

  // ---- Synchronous wrapper (for backward compatibility with index.js) ----
  // Returns a promise — the route handler in index.js needs to be updated to await this
  generateResponse(userMessage, activeQuestion, userId = 'guest') {
    return this.generateResponseAsync(userMessage, activeQuestion, userId);
  }

  // ---- Clear a user's conversation history ----
  clearHistory(userId) {
    conversationHistory.delete(userId);
  }

  // ---- Fallback rule-based responses when Gemini is unavailable ----
  _fallbackResponse(message, activeQuestion) {
    const q = message.toLowerCase().trim();

    if (activeQuestion) {
      return this._explainActiveQuestion(activeQuestion);
    }

    // Navigation help
    if (q.includes('first aid') || q.includes('fa ')) {
      return '📖 **First Aid Reader** → Click **[First Aid]** in the left sidebar or navigate to `#fa`.\n\nEvery heading has an **M button** to launch AnKing/Mnemosyne/Mehlman flashcards for that topic.';
    }
    if (q.includes('mehlman') || q.includes('pdf') || q.includes('his pdf')) {
      return '📄 **Mehlman HY PDFs** → Click **[His PDFs]** in the left sidebar or navigate to `#mehlman`.\n\n15 High-Yield books: Cardiovascular (74p), GI (95p), MSK (88p), Neurology (84p), and more.';
    }
    if (q.includes('sketchy')) {
      return '🎨 **Sketchy** → Navigate to `#sketchy`.\n\n**141** Pathology • **110** Microbiology • **107** Pharmacology visual mnemonics.';
    }
    if (q.includes('ddx') || q.includes('differential')) {
      return '🩺 **Differential Diagnosis** → Navigate to `#ddx`.\n\n25 chief complaints: Chest Pain, SOB, Abdominal Pain, Headache, AMS, Syncope, and more.';
    }

    // Default welcome
    return `### 🧬 ANSI 1.0 PRO — Neural USMLE Engine\n\nI am your advanced AI board tutor for **Synapse**.\n\n**Ask me anything:**\n* "Explain autoregulation of blood flow"\n* "What are the 4 T's of anterior mediastinal mass?"\n* "Differential for nephrotic syndrome"\n* "How do I launch AnKing cards for Autoregulation?"\n* "What is in Mehlman HY Renal?"\n* "Quiz me on a high-yield Step 1 vignette"\n\nWhat high-yield topic shall we master?`;
  }

  _explainActiveQuestion(q) {
    const correctLetter = ['A', 'B', 'C', 'D', 'E'][q.correctIndex] || 'A';
    const correctText = (q.options || [])[q.correctIndex] || '';
    return `### 📋 Case Breakdown\n\n**Correct Answer:** **(${correctLetter}) ${correctText}**\n\n#### Clinical Reasoning:\n${q.explanation || 'Review the question stem carefully and correlate with the clinical presentation.'}\n\n#### High-Yield Pearl:\n> ${q.highYieldPearl || 'Correlate patient presentation with classic pathognomonic findings on boards.'}`;
  }

  _buildFallbackKB() {
    return { ready: true };
  }
}

module.exports = new RadBotEngine();
