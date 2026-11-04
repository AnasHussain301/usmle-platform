// ==========================================
// APP CONTEXT BUILDER FOR GEMINI RAG
// Provides structured knowledge of every corner
// of the USMLE platform for the AI assistant
// ==========================================

const path = require('path');
const fs = require('fs');

// ---- First Aid Systems ----
const FA_SYSTEMS = [
  { id: 'cvs',   name: 'Cardiovascular',       pages: '279-336',  totalPages: 57  },
  { id: 'endo',  name: 'Endocrine',             pages: '337-374',  totalPages: 37  },
  { id: 'gi',    name: 'Gastrointestinal',      pages: '375-410',  totalPages: 35  },
  { id: 'heme',  name: 'Hematology & Oncology', pages: '411-448',  totalPages: 37  },
  { id: 'msk',   name: 'Musculoskeletal & Skin',pages: '449-490',  totalPages: 41  },
  { id: 'neuro', name: 'Neurology',             pages: '491-536',  totalPages: 45  },
  { id: 'psych', name: 'Psychiatry',            pages: '537-568',  totalPages: 31  },
  { id: 'renal', name: 'Renal',                 pages: '569-608',  totalPages: 39  },
  { id: 'resp',  name: 'Pulmonary',             pages: '609-644',  totalPages: 35  },
  { id: 'repro', name: 'Reproductive',          pages: '645-686',  totalPages: 41  },
  { id: 'immuno','name': 'Immunology',          pages: '95-124',   totalPages: 29  },
  { id: 'micro', name: 'Microbiology',          pages: '125-212',  totalPages: 87  },
  { id: 'biochem',name:'Biochemistry',          pages: '31-93',    totalPages: 62  },
];

// ---- Mehlman HY PDF Books ----
const MEHLMAN_BOOKS = [
  { id: 'cvs',    name: 'HY Cardiovascular',          pages: 74  },
  { id: 'endo',   name: 'HY Endocrine',               pages: 63  },
  { id: 'gi',     name: 'HY Gastrointestinal',        pages: 95  },
  { id: 'heme',   name: 'HY Hematology & Oncology',   pages: 60  },
  { id: 'msk',    name: 'HY Musculoskeletal & Skin',  pages: 88  },
  { id: 'neuro',  name: 'HY Neurology',               pages: 84  },
  { id: 'psych',  name: 'HY Psychiatry',              pages: 48  },
  { id: 'renal',  name: 'HY Renal',                   pages: 76  },
  { id: 'resp',   name: 'HY Pulmonary',               pages: 58  },
  { id: 'repro',  name: 'HY Reproductive',            pages: 68  },
  { id: 'immuno', name: 'HY Immunology',              pages: 42  },
  { id: 'micro',  name: 'HY Microbiology',            pages: 52  },
  { id: 'biochem',name: 'HY Biochemistry',            pages: 56  },
  { id: 'path',   name: 'HY Pathology',               pages: 60  },
  { id: 'ethics', name: 'HY Ethics & Communication',  pages: 40  },
];

// ---- Sketchy Decks ----
const SKETCHY_DECKS = {
  pathology: { count: 141, description: 'Sketchy Pathology visual mnemonics (141 sketches)' },
  microbiology: { count: 110, description: 'Sketchy Microbiology visual mnemonics (110 sketches covering bacteria, viruses, fungi, parasites)' },
  pharmacology: { count: 107, description: 'Sketchy Pharmacology visual mnemonics (107 sketches covering drug classes and mechanisms)' },
};

// ---- DDx (Differential Diagnosis) ----
const DDX_CATEGORIES = [
  'Chest Pain', 'Shortness of Breath', 'Abdominal Pain', 'Headache', 'Altered Mental Status',
  'Syncope', 'Palpitations', 'Dizziness / Vertigo', 'Fever', 'Fatigue',
  'Nausea / Vomiting', 'Diarrhea', 'Constipation', 'Back Pain', 'Joint Pain',
  'Rash', 'Hematuria', 'Dysphagia', 'Weight Loss', 'Leg Swelling',
  'Acute Vision Loss', 'Hematochezia / Melena', 'Polyuria / Polydipsia', 'Jaundice', 'Seizure'
];

// ---- App Routes ----
const APP_ROUTES = {
  '#fa':       'First Aid 2024 reader — 844 pages with per-heading AnKing/Mnemosyne/Mehlman flashcard launchers',
  '#mehlman':  'Mehlman High-Yield PDF reader — 15 systems, native in-browser PDF.js viewer',
  '#sketchy':  'Sketchy visual mnemonic viewer — Pathology (141), Microbiology (110), Pharmacology (107)',
  '#ddx':      'Differential Diagnosis tool — 25 chief complaints with structured differentials',
  '#qbank':    'QBank — USMLE-style practice questions with spaced repetition',
  '#radbot':   'ANSI 1.0 PRO — Next-Gen Neural Board Study Assistant',
};

// ---- Load topic list from zetchy_cards.json ----
function loadTopicSummary() {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'zetchy_cards.json');
    if (!fs.existsSync(dataPath)) return { topicCount: 0, questionCount: 0, sampleTopics: [] };
    
    const raw = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(raw);
    
    const topicKeys = Object.keys(data);
    const questionCount = topicKeys.reduce((sum, key) => sum + (data[key].length || 0), 0);
    
    // Sample 30 topics for context
    const sampleTopics = topicKeys.slice(0, 30);
    
    return {
      topicCount: topicKeys.length,
      questionCount,
      sampleTopics,
      allTopics: topicKeys, // Full list for deeper RAG
    };
  } catch (e) {
    return { topicCount: 1281, questionCount: 13474, sampleTopics: [], allTopics: [] };
  }
}

// ---- Build the system prompt / RAG context ----
function buildSystemPrompt() {
  const topics = loadTopicSummary();
  
  const faSystemsText = FA_SYSTEMS.map(s => 
    `  • ${s.name} (pages ${s.pages}, ${s.totalPages} pages)`
  ).join('\n');
  
  const mehlmanText = MEHLMAN_BOOKS.map(b => 
    `  • ${b.name} (${b.pages} pages)`
  ).join('\n');
  
  const sampleTopicsText = topics.sampleTopics.length > 0
    ? topics.sampleTopics.slice(0, 20).join(', ')
    : 'Autoregulation, Cardiac Output, Nephritic Syndrome, Thyroid Cancer, ...';
  
  const routesText = Object.entries(APP_ROUTES).map(([route, desc]) => 
    `  ${route}: ${desc}`
  ).join('\n');

  return `You are ANSI 1.0 PRO, the advanced neural AI study assistant for Synapse (USMLE Step 1 & Step 2 preparation platform). You are an expert medical educator with deep knowledge of all USMLE-tested content. You speak in a clear, high-yield, board-focused style. Always be concise and clinically relevant.

## YOUR PLATFORM — COMPLETE KNOWLEDGE MAP

### App Sections
${routesText}

### First Aid 2024 Reader (#fa)
The First Aid 2024 textbook is integrated as an interactive reader with 844 pages across 13 organ systems:
${faSystemsText}

Each heading has an "M" button that opens a flashcard launcher popup. The popup shows:
- Mode: Test / Preview
- Source tabs: AnKing (most cards), Mnemosyne, Mehlman
- Status rows: All, Again (missed), Good, Not done
Clicking "Not done" opens an in-book floating flashcard player with cloze deletions and spaced-repetition (Again/Good) buttons. Progress is saved to browser localStorage.

### Flashcard Database
- Total topics: ${topics.topicCount}
- Total flashcards: ${topics.questionCount}
- Sources: AnKing (largest set), Mnemosyne, Mehlman
- Sample topics: ${sampleTopicsText}
- All cards use cloze deletion format: "____ is [definition]" or "What is ____ ?"

### Mehlman High-Yield PDFs (#mehlman)
15 PDF books by Dr. Mehlman, rendered natively in-browser with PDF.js:
${mehlmanText}
Each book has a Table of Contents sidebar, previous/next page buttons, and zoom controls (−/+).

### Sketchy Visual Mnemonics (#sketchy)
- Sketchy Pathology: 141 visual sketches
- Sketchy Microbiology: 110 visual sketches (bacteria, viruses, fungi, parasites)
- Sketchy Pharmacology: 107 visual sketches (drug mechanisms and classes)
Each sketch is viewable in a fullscreen lightbox modal with zoom.

### Differential Diagnosis Tool (#ddx)
25 chief complaints with structured differentials:
${DDX_CATEGORIES.join(', ')}

### QBank (#qbank)
USMLE-style practice questions with:
- Spaced repetition (Again/Good rating system)
- Detailed explanations and high-yield pearls
- Radiology image interpretation questions
- Track correct/incorrect performance

## HOW TO HELP USERS

1. **Navigation help**: Tell users exactly which section (#fa, #mehlman, #sketchy, #ddx, #qbank) to visit for their topic.

2. **Content questions**: Answer medical questions directly with USMLE-focused, high-yield information. Use mnemonics, tables, and bullet points.

3. **Study strategy**: Guide users on how to use AnKing cards, Mehlman PDFs, and Sketchy together for maximum retention.

4. **Differential diagnoses**: For any chief complaint, provide a structured differential with key distinguishing features.

5. **Radiology**: Explain classic imaging findings, radiological signs, and their clinical significance.

6. **Pharmacology**: Drug mechanisms, side effects, contraindications, and high-yield associations.

## RESPONSE STYLE
- Use markdown formatting (bold, bullets, tables)
- Lead with the most important information
- Include mnemonics where helpful
- Keep responses focused and board-relevant
- For complex topics, use headers to organize
- Always mention which platform section has more detail on the topic

You are speaking directly to a medical student preparing for USMLE boards. Be their expert tutor.`;
}

module.exports = { buildSystemPrompt, FA_SYSTEMS, MEHLMAN_BOOKS, SKETCHY_DECKS, DDX_CATEGORIES };
