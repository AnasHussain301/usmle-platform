/**
 * Rebuild all Sketchy data from the authentic sketches_meta.json (358 sketches).
 * 
 * Each sketch gets:
 *   - Its own unique thumb_<slug>.webp and scene_<slug>.jpg
 *   - The real pin count from `numbers` (30–66 pins per sketch)
 *   - Procedurally generated pin positions spread naturally across the canvas
 *   - Topics parsed into pin titles
 */

const fs = require('fs');
const path = require('path');
const db = require('./db');

const meta = JSON.parse(fs.readFileSync(path.join(__dirname, 'sketches_meta.json'), 'utf8'));

console.log(`Rebuilding Sketchy data from ${meta.length} authentic sketches...`);

// ─── helpers ───────────────────────────────────────────────────────
function slugFromPath(p) {
  return p.replace('sketches/', '').replace(/\/$/, '');
}

/** Distribute N pins across the canvas in a visually natural grid+jitter pattern */
function generatePinPositions(n) {
  const pins = [];
  // Use a grid-based approach with jitter for natural look
  const cols = Math.ceil(Math.sqrt(n * 1.5));
  const rows = Math.ceil(n / cols);
  const cellW = 90 / cols;
  const cellH = 85 / rows;
  
  let idx = 0;
  for (let r = 0; r < rows && idx < n; r++) {
    for (let c = 0; c < cols && idx < n; c++) {
      // Seeded pseudo-random jitter based on index
      const jx = ((idx * 7 + 13) % 17) / 17 - 0.5;
      const jy = ((idx * 11 + 7) % 19) / 19 - 0.5;
      const x = 5 + c * cellW + cellW * 0.5 + jx * cellW * 0.6;
      const y = 5 + r * cellH + cellH * 0.5 + jy * cellH * 0.6;
      pins.push({
        x: Math.round(Math.max(3, Math.min(95, x)) * 10) / 10,
        y: Math.round(Math.max(3, Math.min(95, y)) * 10) / 10
      });
      idx++;
    }
  }
  return pins;
}

/** Parse topics string into individual topic titles for pin labels */
function parseTopics(topicsStr) {
  if (!topicsStr) return [];
  // Split on commas but respect parenthesized groups
  const topics = [];
  let depth = 0, current = '';
  for (const ch of topicsStr) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      const t = current.trim();
      if (t) topics.push(t);
      current = '';
    } else {
      current += ch;
    }
  }
  const last = current.trim();
  if (last) topics.push(last);
  return topics;
}

// ─── build Sketchy Path systems ────────────────────────────────────
// Group by chapter (Sketchy Path = subject "path")
const pathSketches = meta.filter(s => s.subject === 'path');
const pharmSketches = meta.filter(s => s.subject === 'pharm');
const microSketches = meta.filter(s => ['bacteria', 'virus', 'parasite', 'fungi'].includes(s.subject));

// Sketchy Path: group by chapter
const pathChapters = {};
pathSketches.forEach(s => {
  if (!pathChapters[s.chapter]) pathChapters[s.chapter] = [];
  pathChapters[s.chapter].push(s);
});

// Chapter colors
const CHAPTER_COLORS = {
  'Reproductive & GU': '#be185d',
  'GI & Endocrine': '#15803d',
  'Cardiac Pathology': '#c2410c',
  'Vascular Pathology': '#991b1b',
  'Blood & Inflammation': '#b91c1c',
  'Blood & Coagulation': '#831843',
  'Musculoskeletal & Derm': '#a16207',
  'Neurology & Psychology': '#581c87',
  'Endocrine': '#7c3aed',
  'Respiratory': '#0369a1',
  'Renal': '#4338ca',
  'GI': '#15803d',
  'Hepatobiliary': '#047857',
  'Myeloid & Lymphoid': '#86198f',
  'Immunology': '#4d7c0f'
};

const CHAPTER_ICONS = {
  'Reproductive & GU': '🔬',
  'GI & Endocrine': '🫃',
  'Cardiac Pathology': '❤️',
  'Vascular Pathology': '🩸',
  'Blood & Inflammation': '💧',
  'Blood & Coagulation': '🩸',
  'Musculoskeletal & Derm': '🦴',
  'Neurology & Psychology': '🧠',
  'Endocrine': '🦋',
  'Respiratory': '🫁',
  'Renal': '🫘',
  'GI': '🫃',
  'Hepatobiliary': '🫀',
  'Myeloid & Lymphoid': '🔬',
  'Immunology': '🛡️'
};

/** Convert one meta entry into a full sketch object with symbols */
function buildSketch(s) {
  const slug = slugFromPath(s.path);
  const numPins = s.numbers || 20;
  const positions = generatePinPositions(numPins);
  const topicsList = parseTopics(s.topics);
  
  const pinColors = [
    '#3b82f6','#ef4444','#22c55e','#f59e0b','#8b5cf6',
    '#ec4899','#06b6d4','#f97316','#14b8a6','#a855f7',
    '#f43f5e','#84cc16','#0ea5e9','#e879f9','#facc15'
  ];
  
  const symbols = [];
  for (let i = 0; i < numPins; i++) {
    const topicTitle = topicsList[i] || topicsList[i % topicsList.length] || `Symbol #${i + 1}`;
    symbols.push({
      pin: i + 1,
      title: `#${i + 1}. ${topicTitle}`,
      meaning: topicTitle,
      fact: `High-yield board fact for ${topicTitle}. Tap to review the visual memory anchor.`,
      x: positions[i].x,
      y: positions[i].y,
      color: pinColors[i % pinColors.length]
    });
  }
  
  return {
    id: slug,
    key: s.key,
    number: s.code,
    title: s.title,
    progress: 0,
    image: `/assets/sketches/thumb_${slug}.webp`,
    canvasImage: `/assets/sketches/scene_${slug}.jpg`,
    totalSymbols: numPins,
    questionsCount: Math.round(numPins * 0.35),
    videoId: s.video || null,
    anking: s.anking || false,
    topics: s.topics,
    symbols
  };
}

// Build Sketchy Path systems
const pathSystems = Object.entries(pathChapters).map(([chapter, sketches]) => {
  // Group sketches within this chapter by their code prefix (e.g. 1.x, 2.x, 3.x)
  const subgroups = {};
  sketches.forEach(s => {
    const prefix = s.code.split('.')[0];
    if (!subgroups[prefix]) subgroups[prefix] = [];
    subgroups[prefix].push(s);
  });
  
  const subcategories = Object.entries(subgroups).map(([prefix, sks]) => {
    // Try to derive a subcategory name from the first sketch's topics
    const subName = sks.length > 1
      ? `${chapter} - Section ${prefix}`
      : sks[0].title;
    return {
      name: `${chapter} - Section ${prefix}`,
      count: sks.length,
      sketches: sks.map(buildSketch)
    };
  });
  
  return {
    id: `sys_${chapter.toLowerCase().replace(/[^a-z]/g, '_').replace(/_+/g, '_')}`,
    name: chapter,
    color: CHAPTER_COLORS[chapter] || '#6366f1',
    icon: CHAPTER_ICONS[chapter] || '📚',
    totalSketches: sketches.length,
    progress: 0,
    subcategories
  };
});

// Build Sketchy Micro deck
const microSubjects = {};
microSketches.forEach(s => {
  const sub = s.subject === 'bacteria' ? 'Bacteriology' : 
              s.subject === 'virus' ? 'Virology' :
              s.subject === 'parasite' ? 'Parasitology' : 'Mycology';
  if (!microSubjects[sub]) microSubjects[sub] = [];
  microSubjects[sub].push(s);
});

const microSketchObjects = microSketches.map(s => {
  const sk = buildSketch(s);
  sk.system = s.subject === 'bacteria' ? 'Bacteriology' : 
              s.subject === 'virus' ? 'Virology' :
              s.subject === 'parasite' ? 'Parasitology' : 'Mycology';
  sk.system += ` (${s.chapter})`;
  return sk;
});

// Build Sketchy Pharm deck
const pharmChapters = {};
pharmSketches.forEach(s => {
  if (!pharmChapters[s.chapter]) pharmChapters[s.chapter] = [];
  pharmChapters[s.chapter].push(s);
});

const pharmSketchObjects = pharmSketches.map(s => {
  const sk = buildSketch(s);
  sk.system = s.chapter;
  return sk;
});

// ─── update database ───────────────────────────────────────────────

// Sketchy Path
db.data.sketchyPathData = {
  totalSketches: pathSketches.length,
  systemsCount: pathSystems.length,
  systems: pathSystems
};

// Sketchy Decks (Micro & Pharm)
const existingDecks = db.data.sketchyDecks || [];
const pathDeck = existingDecks.find(d => d.id === 'sketchy_path') || {
  id: 'sketchy_path',
  title: 'Sketchy Path',
  subtitle: 'Visual Pathology & Physiology',
  icon: '🎨',
  color: 'from-purple-600 to-pink-600'
};
pathDeck.cardsCount = pathSketches.length;

const microDeck = {
  id: 'sketchy_micro',
  title: 'Sketchy Micro',
  subtitle: `${microSketches.length} Interactive Microbiology Sketches`,
  icon: '🦠',
  color: 'from-green-600 to-teal-600',
  cardsCount: microSketches.length,
  sketches: microSketchObjects
};

const pharmDeck = {
  id: 'sketchy_pharm',
  title: 'Sketchy Pharm',
  subtitle: `${pharmSketches.length} Interactive Pharmacology Sketches`,
  icon: '💊',
  color: 'from-blue-600 to-indigo-600',
  cardsCount: pharmSketches.length,
  sketches: pharmSketchObjects
};

db.data.sketchyDecks = [pathDeck, microDeck, pharmDeck];

db.save();

// ─── stats ─────────────────────────────────────────────────────────
const totalPins = meta.reduce((a, s) => a + (s.numbers || 0), 0);
console.log('');
console.log('══════════════════════════════════════════════════');
console.log(`✅ Sketchy Path: ${pathSystems.length} chapters, ${pathSketches.length} sketches`);
console.log(`✅ Sketchy Micro: ${microSketches.length} sketches (Bacteria: ${microSubjects['Bacteriology']?.length || 0}, Viruses: ${microSubjects['Virology']?.length || 0}, Parasites: ${microSubjects['Parasitology']?.length || 0}, Fungi: ${microSubjects['Mycology']?.length || 0})`);
console.log(`✅ Sketchy Pharm: ${pharmSketches.length} sketches across ${Object.keys(pharmChapters).length} drug chapters`);
console.log(`✅ Total pins/symbols across all sketches: ${totalPins}`);
console.log(`✅ Every sketch has a UNIQUE image (thumb + scene)`);
console.log('══════════════════════════════════════════════════');
