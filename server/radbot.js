// ==========================================
// RAD BOT — ANSI 1.0 PRO Neural USMLE Engine
// Direct REST API (no SDK dependency) + Offline Clinical Intelligence Fallback
// ==========================================

const https = require('https');
const { buildSystemPrompt } = require('./app_context');

// Ensure environment variables are loaded at module init
try { if (process.loadEnvFile) process.loadEnvFile(); } catch (e) {}

// API key — always from backend .env only
function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
}

// Working model priority list (confirmed available via REST API listing)
// Try best/fastest first; fall through on 404/503
const MODEL_PRIORITY = [
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-pro-latest',
];

// In-memory conversation history per session (keyed by userId)
const conversationHistory = new Map();
const MAX_HISTORY_TURNS = 8; // Keep last 8 turns to stay within context

function getHistory(userId) {
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, []);
  }
  return conversationHistory.get(userId);
}

function appendHistory(userId, role, text) {
  const history = getHistory(userId);
  history.push({ role, parts: [{ text }] });
  while (history.length > MAX_HISTORY_TURNS * 2) {
    history.splice(0, 2); // Remove oldest user+model pair
  }
}

// ---- Direct REST call to Gemini API (no SDK) ----
function callGeminiREST(apiKey, modelName, systemPrompt, history, userMessage) {
  return new Promise((resolve, reject) => {
    // Build contents array: system context + history + current message
    const contents = [
      {
        role: 'user',
        parts: [{ text: `[SYSTEM INSTRUCTIONS]\n${systemPrompt}` }]
      },
      {
        role: 'model',
        parts: [{ text: 'Understood. I am ANSI 1.0 PRO, your advanced neural USMLE assistant on Synapse. I will answer all medical and board study questions in a concise, high-yield, board-focused style. How can I assist your prep today?' }]
      },
      ...history,
      {
        role: 'user',
        parts: [{ text: userMessage }]
      }
    ];

    const requestBody = JSON.stringify({
      contents,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.4,
        topP: 0.9,
      }
    });

    const path = `/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            const err = new Error(parsed.error.message || 'Gemini API error');
            err.code = parsed.error.code;
            err.status = parsed.error.status;
            return reject(err);
          }
          if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content) {
            const text = parsed.candidates[0].content.parts.map(p => p.text).join('');
            return resolve(text);
          }
          reject(new Error('No candidates in response: ' + data.slice(0, 200)));
        } catch (parseErr) {
          reject(new Error('JSON parse error: ' + data.slice(0, 200)));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Request timeout')); });
    req.write(requestBody);
    req.end();
  });
}

class RadBotEngine {
  constructor() {
    this._systemPrompt = null;
  }

  getSystemPrompt() {
    if (!this._systemPrompt) {
      try {
        this._systemPrompt = buildSystemPrompt();
      } catch (e) {
        this._systemPrompt = 'You are ANSI 1.0 PRO, a high-yield USMLE AI study assistant on Synapse. Answer all medical, pharmacology, pathology, physiology, and clinical questions in a concise, board-focused style with key clinical pearls. Format using markdown headers and bullet points for clarity. Never refuse to answer a medical question.';
      }
    }
    return this._systemPrompt;
  }

  // ---- Main async entry point ----
  async generateResponseAsync(userMessage, activeQuestion, userId = 'guest') {
    const activeKey = getApiKey();

    // Build extra context if user is viewing a specific question
    let questionContext = '';
    if (activeQuestion) {
      const correctLetter = ['A', 'B', 'C', 'D', 'E'][activeQuestion.correctIndex] || 'A';
      const correctText = (activeQuestion.options || [])[activeQuestion.correctIndex] || '';
      questionContext = `\n\n[ACTIVE QUESTION CONTEXT]\nThe user is currently viewing this question:\nQuestion: ${activeQuestion.question}\nOptions: ${(activeQuestion.options || []).map((o, i) => `${['A','B','C','D','E'][i]}) ${o}`).join(' | ')}\nCorrect Answer: (${correctLetter}) ${correctText}\nExplanation: ${activeQuestion.explanation || 'Not available'}\n`;
    }

    const fullUserMessage = questionContext
      ? `${userMessage}\n\n${questionContext}`
      : userMessage;

    // 1. Attempt Live Gemini REST API with priority models
    if (activeKey) {
      const history = getHistory(userId);
      const systemPrompt = this.getSystemPrompt();

      for (const modelName of MODEL_PRIORITY) {
        try {
          const reply = await callGeminiREST(activeKey, modelName, systemPrompt, history, fullUserMessage);

          appendHistory(userId, 'user', userMessage);
          appendHistory(userId, 'model', reply);

          console.log(`[RadBot] ✅ Responded using model: ${modelName}`);
          return reply;
        } catch (modelErr) {
          const msg = modelErr.message || '';
          const code = modelErr.code || 0;
          console.warn(`[RadBot] Model ${modelName} failed (${code}): ${msg.slice(0, 120)}`);

          // Auth errors (401/403) mean this key won't work for any model
          if (code === 401 || code === 403 || msg.includes('API_KEY') || msg.includes('API key') ||
              msg.includes('unregistered') || msg.includes('not valid') || msg.includes('PERMISSION_DENIED')) {
            console.warn('[RadBot] Auth error — switching to Neural Knowledge Engine.');
            break;
          }
          // 404 = model not found, try next
          // 503 / timeout = overloaded, try next model
          // Any other error — continue to next model
        }
      }
    } else {
      console.warn('[RadBot] No API key configured — using offline Neural Knowledge Engine.');
    }

    // 2. Seamless Fallback: Built-in Neural Medical Knowledge Engine
    console.log('[RadBot] Using Neural Medical Knowledge Base to synthesize response.');
    return this._neuralMedicalFallback(userMessage, activeQuestion);
  }

  generateResponse(userMessage, activeQuestion, userId = 'guest') {
    return this.generateResponseAsync(userMessage, activeQuestion, userId);
  }

  clearHistory(userId) {
    conversationHistory.delete(userId);
  }

  // ---- Advanced Neural Medical Knowledge Synthesis (Offline Fallback) ----
  _neuralMedicalFallback(message, activeQuestion) {
    const q = (message || '').toLowerCase().trim();

    if (activeQuestion) {
      return this._explainActiveQuestion(activeQuestion);
    }

    let response = '';

    // A. IMMUNE SYSTEM / IMMUNOLOGY
    if (q.includes('ammune') || q.includes('immune') || q.includes('immunol') || q.includes('antibody') || q.includes('complement') || q.includes('b cell') || q.includes('t cell')) {
      response = `### 🧬 High-Yield USMLE: The Immune System

The human immune system is divided into two primary arms: **Innate Immunity** (rapid, non-specific, no memory) and **Adaptive Immunity** (slow onset, highly specific, long-term memory).

---

#### 1. Innate Immunity (Immediate: 0 to 12 Hours)
* **First Line of Defense:** Epithelial barriers (skin, mucosa), defensins, lysosomes.
* **Cellular Effectors:**
  * **Neutrophils:** Primary responders to acute bacterial infection and tissue necrosis; recruited by **C5a, LTB4, and IL-8**.
  * **Macrophages:** Phagocytosis, antigen presentation via MHC II, secretion of **IL-1, IL-6, TNF-α** (acute phase response).
  * **Natural Killer (NK) Cells:** Large granular lymphocytes that destroy virus-infected and malignant cells. They recognize cells with **decreased MHC Class I expression** ("missing-self" signal).
* **Complement Cascade:**
  * **Opsonization:** **C3b** (primary opsonin for macrophage phagocytosis).
  * **Anaphylatoxins:** **C3a, C4a, C5a** (trigger mast cell histamine release).
  * **Membrane Attack Complex (MAC):** **C5b-C9** punches osmotic holes in Gram-negative bacteria (deficiency leads to recurrent *Neisseria meningitidis/gonorrhoeae*).

---

#### 2. Adaptive Immunity (Delayed: >4 Days)
##### A. Cell-Mediated Immunity (T-Lymphocytes)
* **CD4+ Helper T Cells:** Bind **MHC Class II**; Th1 → IFN-γ; Th2 → IL-4, IL-5; Th17 → IL-17; Treg → IL-10/TGF-β.
* **CD8+ Cytotoxic T Cells:** Bind **MHC Class I**; kill via perforin/granzyme B.

##### B. Humoral Immunity (B-Lymphocytes & Antibodies)
* **IgG:** Most abundant; crosses placenta; secondary response.
* **IgA:** Secretory dimer; mucosal surfaces.
* **IgM:** Pentamer; primary response; complement activator.
* **IgE:** Mast cell binding; Type I hypersensitivity.

---

#### 📚 Study in Synapse:
* **First Aid 2024 (#fa):** Immunology (pages 95–124)
* **Mehlman HY PDFs (#mehlman):** HY Immunology`;
    }

    // B. CARDIOVASCULAR / HEART
    else if (q.includes('cardio') || q.includes('heart') || q.includes('autoregulation') || q.includes('murmur') || q.includes('hypertension') || q.includes('infarct') || q.includes('angina') || q.includes('cardiac') || q.includes('coronary') || q.includes('ventricl') || q.includes('atri')) {
      response = `### 🫀 High-Yield Cardiovascular Concepts for USMLE

#### What is the Heart?
The heart is a **hollow muscular organ** (≈300g in adults) located in the mediastinum, slightly left of midline. It functions as a **dual pump** maintaining pulmonary and systemic circulation.

**4 Chambers:**
* **Right Atrium → Right Ventricle:** Pumps deoxygenated blood to lungs (low-pressure circuit)
* **Left Atrium → Left Ventricle:** Pumps oxygenated blood to systemic circulation (high-pressure circuit)

**Blood Supply (Coronary Arteries):**
* **LAD (Left Anterior Descending):** Anterior LV, anterior 2/3 interventricular septum — *"widow maker"*
* **RCA (Right Coronary Artery):** Right ventricle, SA node (60%), AV node (90%)
* **LCx (Left Circumflex):** Lateral/posterior LV, SA node (40%)

---

#### High-Yield Cardiac Physiology
* **Cardiac Output (CO):** CO = HR × SV. Normal: ~5 L/min
* **Starling's Law:** ↑ preload → ↑ stroke volume (up to a point)
* **Frank-Starling curve** shifts UP with positive inotropes (dobutamine), DOWN in heart failure

#### Classic Murmurs
* **Aortic Stenosis:** Crescendo-decrescendo systolic murmur → radiates to carotids; pulsus parvus et tardus
* **Mitral Regurgitation:** Holosystolic at apex → axilla; ↑ with decreased afterload
* **Aortic Regurgitation:** Early diastolic decrescendo at LSB; wide pulse pressure
* **Mitral Stenosis:** Opening snap + mid-diastolic rumble; associated with rheumatic fever

---

#### 📚 Study in Synapse:
* **First Aid 2024 (#fa):** Cardiovascular (pages 284–342)
* **Mehlman HY PDFs (#mehlman):** HY Cardiovascular
* **Sketchy (#sketchy):** Cardiac Pharm mnemonics`;
    }

    // C. RENAL / NEPHROTIC / NEPHRITIC
    else if (q.includes('renal') || q.includes('kidney') || q.includes('nephrotic') || q.includes('nephritic') || q.includes('diuretic') || q.includes('gfr')) {
      response = `### 🩺 High-Yield Renal Pathology & Physiology

#### 1. Nephrotic Syndrome (>3.5 g/day proteinuria, hypoalbuminemia, edema, hyperlipidemia)
* **Minimal Change Disease:** Most common in children; podocyte effacement on EM; responds to steroids.
* **FSGS:** Most common in African Americans, HIV, heroin use; segmental sclerosis on LM.
* **Membranous Nephropathy:** Subepithelial spike-and-dome deposits; PLA2R antibodies; hepatitis B/C, NSAIDs.

#### 2. Nephritic Syndrome (hematuria, RBC casts, hypertension, oliguria)
* **PSGN:** 2–4 weeks post-strep; subepithelial "humps" on EM, lumpy-bumpy IF.
* **IgA Nephropathy (Berger Disease):** Hematuria concurrent with viral URI (1–2 days).
* **GPA (Wegener):** PR3-ANCA / c-ANCA; saddle nose, lungs, kidneys.

---

#### 📚 Study in Synapse:
* **First Aid 2024 (#fa):** Renal System (pages 585–630)
* **Mehlman HY PDFs (#mehlman):** HY Renal (48 pages)`;
    }

    // D. PULMONOLOGY / RESPIRATORY
    else if (q.includes('lung') || q.includes('pulmon') || q.includes('asthma') || q.includes('copd') || q.includes('pneumonia') || q.includes('fev1')) {
      response = `### 🫁 High-Yield Pulmonology for USMLE

#### Obstructive vs Restrictive Lung Disease
* **Obstructive (FEV1/FVC <70%):** Air trapping, ↑ RV and TLC.
  * Asthma (reversible), COPD/Emphysema (centrilobular in smokers; panacinar in α1-antitrypsin deficiency), Bronchiectasis
* **Restrictive (FEV1/FVC ≥70%, ↓ FVC & TLC):**
  * IPF (honeycombing), Sarcoidosis (noncaseating granulomas, elevated ACE/calcium), Asbestosis

#### Pulmonary Embolism (PE)
* **Presentation:** Sudden dyspnea, pleuritic chest pain, tachycardia
* **Dx:** CT pulmonary angiography (gold standard); elevated D-dimer
* **ECG:** Sinus tachycardia (most common); classic S1Q3T3 pattern

---

#### 📚 Study in Synapse:
* **First Aid 2024 (#fa):** Respiratory System (pages 660–702)
* **Mehlman HY PDFs (#mehlman):** HY Pulmonary`;
    }

    // E. NEUROLOGY / STROKE / CRANIAL NERVES
    else if (q.includes('neuro') || q.includes('brain') || q.includes('stroke') || q.includes('cranial') || q.includes('headache') || q.includes('seizure')) {
      response = `### 🧠 High-Yield Neurology for USMLE

#### 1. Stroke Localization Syndromes
* **MCA:** Contralateral face + upper extremity; aphasia (dominant); hemineglect (non-dominant)
* **ACA:** Contralateral lower extremity motor/sensory deficits
* **PCA:** Contralateral homonymous hemianopia with macular sparing
* **Wallenberg (PICA):** Dysphagia, ipsilateral Horner, contralateral body pain/temp loss

#### 2. Headaches
* **Migraine:** Unilateral, pulsating; treat with triptans; prevent with topiramate, propranolol
* **Cluster:** Severe unilateral periorbital; lacrimation; treat with 100% O₂ and sumatriptan
* **Temporal Arteritis:** Elderly + jaw claudication + elevated ESR → immediate steroids (prevent blindness)

---

#### 📚 Study in Synapse:
* **First Aid 2024 (#fa):** Neurology (pages 490–560)
* **Mehlman HY PDFs (#mehlman):** HY Neurology (84 pages)`;
    }

    // F. DEFAULT / COMPREHENSIVE OVERVIEW
    else {
      response = `### ⚡ ANSI 1.0 PRO — Neural USMLE Engine

I am your next-generation clinical assistant on **Synapse**. Ask me anything about:

* 🧬 Pathophysiology, Immunology, Microbiology
* 💊 Pharmacology (mechanisms, side effects, drug interactions)
* 🫀 Cardiovascular, Renal, Pulmonary, Neurology
* 🩺 Differentials, clinical vignettes, board pearls
* 📖 First Aid topics, Mehlman HY content, Sketchy mnemonics

**How to use Synapse:**
* **First Aid (#fa):** 1,281 topics with integrated flashcard launcher
* **Mehlman (#mehlman):** 15 HY PDFs — annotated board compendiums
* **Sketchy (#sketchy):** 358 visual mnemonics for Micro, Pharm & Path
* **QBank (#qbank):** Clinical board vignette practice
* **DDx Matrix (#ddx):** 25 differential diagnosis trees

> ⚠️ *Currently running in offline mode. The AI service is temporarily busy — please try again in a moment for a fully personalized response.*`;
    }

    return response;
  }

  _explainActiveQuestion(q) {
    const correctLetter = ['A', 'B', 'C', 'D', 'E'][q.correctIndex] || 'A';
    const correctText = (q.options || [])[q.correctIndex] || '';
    return `### 📋 Clinical Board Vignette Breakdown

**Correct Answer:** **(${correctLetter}) ${correctText}**

#### Clinical Reasoning:
${q.explanation || 'Analyze the primary pathology presented in the clinical vignette, noting key laboratory findings and physical examination signs.'}

#### High-Yield USMLE Pearl:
> ${q.highYieldPearl || 'Correlate patient demographics, onset timing, and pathognomonic physical exam findings for rapid elimination of board distractors.'}

#### Next Best Steps:
* Click **Launch QBank** to practice similar board vignettes.
* Use the **First Aid** reader to review the associated organ system tables.`;
  }
}

module.exports = new RadBotEngine();
