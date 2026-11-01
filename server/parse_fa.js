/**
 * FIRST AID COMPLETE DATA PARSER & SEEDER
 * ==============================================================
 * Parses 'fa_complete_dataset.json' into rich, normalized DB records:
 *   - 13 Organ Systems
 *   - Subjects / Sections hierarchy (Anatomy, Pathology, Pharmacology...)
 *   - 1,367 Headings with exact First Aid book page numbers
 *   - Subheadings with individual images and tables attached
 *   - Continuation headings linked to parent headings
 *   - 1,609 UWorld High-Yield Tables (HTML formatted)
 *   - 3,575 UWorld Medical Image references (direct + subtopics + _more)
 * 
 * Saves directly to db.data.firstAidSystems & db.data.firstAidFull
 */

const fs = require('fs');
const path = require('path');
const db = require('./db');

console.log('📖 Parsing First Aid Complete Dataset with full subtopics and images...');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'fa_complete_dataset.json'), 'utf8'));

const SYS_NAMES = {
  cvs: 'Cardiovascular',
  endo: 'Endocrine',
  gi: 'Gastrointestinal',
  heme: 'Hematology & Oncology',
  msk: 'Musculoskeletal & Skin',
  neuro: 'Neurology',
  psych: 'Psychiatry',
  renal: 'Renal',
  repro: 'Reproductive',
  resp: 'Respiratory',
  immuno: 'Immunology',
  micro: 'Microbiology',
  gen: 'General Principles'
};

const SYS_COLORS = {
  cvs: '#c2410c',
  endo: '#7c3aed',
  gi: '#15803d',
  heme: '#831843',
  msk: '#a16207',
  neuro: '#581c87',
  psych: '#3b82f6',
  renal: '#0e7490',
  repro: '#be185d',
  resp: '#0284c7',
  immuno: '#0369a1',
  micro: '#166534',
  gen: '#475569'
};

const sandbox = { FA_TABLES: {}, FA_IMAGES: {} };
Object.keys(raw.faData).forEach(sysKey => {
  const item = raw.faData[sysKey];
  if (item.tablesJs) {
    try { new Function('window', item.tablesJs)(sandbox); } catch(e) {}
  }
  if (item.imagesJs) {
    try { new Function('window', item.imagesJs)(sandbox); } catch(e) {}
  }
});

const parsedSystems = [];

Object.keys(raw.faData).forEach(sysKey => {
  const item = raw.faData[sysKey];
  const sysSandbox = {};
  
  if (item.dataJs) {
    try {
      new Function('window', item.dataJs)(sysSandbox);
    } catch(e) {
      console.warn(`Error executing dataJs for ${sysKey}:`, e.message);
    }
  }

  const faData = sysSandbox.FA_DATA || {};
  const rawTopics = faData.topics || [];
  const subjects = faData.subjects || [];
  const sysTables = sandbox.FA_TABLES[sysKey] || {};
  const sysImages = sandbox.FA_IMAGES[sysKey] || {};
  const moreImages = sysImages._more || [];

  // Map topics and subtopics
  const topics = rawTopics.map((t, idx) => {
    const directImgs = sysImages[t.id] || [];
    const directTbls = sysTables[t.id] || [];

    const subs = (t.subs || []).map(s => {
      const sImgs = sysImages[s.id] || [];
      const sTbls = sysTables[s.id] || [];
      return {
        id: s.id,
        title: s.title,
        page: s.fp || s.page || t.fp || t.page,
        subject: s.subject || t.subject,
        sketch: s.sketch || null,
        images: sImgs,
        tables: sTbls
      };
    });

    // Roll up subtopic images
    const rolledImgs = [...directImgs];
    subs.forEach(s => {
      s.images.forEach(img => {
        if (!rolledImgs.some(x => x[0] === img[0])) rolledImgs.push(img);
      });
    });

    // Roll up subtopic tables
    const rolledTbls = [...directTbls];
    subs.forEach(s => {
      s.tables.forEach(tb => {
        if (!rolledTbls.some(x => x[0] === tb[0])) rolledTbls.push(tb);
      });
    });

    return {
      id: t.id,
      title: t.title,
      page: t.fp || t.page,
      subject: t.subject,
      sketch: t.sketch || null,
      subs: subs,
      directImages: directImgs,
      images: rolledImgs,
      directTables: directTbls,
      tables: rolledTbls
    };
  });

  // Handle (continued) topics - link to preceding parent topic if empty
  topics.forEach((t, idx) => {
    if (t.title.includes('(continued)') || t.id.endsWith('-continued')) {
      const baseTitle = t.title.replace(/\s*\(continued\)/i, '').trim().toLowerCase();
      const parent = topics.slice(0, idx).reverse().find(p => p.title.toLowerCase().trim() === baseTitle);
      if (parent) {
        t.parentTopicId = parent.id;
        if (t.images.length === 0 && parent.images.length > 0) {
          t.images = [...parent.images];
        }
        if (t.tables.length === 0 && parent.tables.length > 0) {
          t.tables = [...parent.tables];
        }
        if (t.subs.length === 0 && parent.subs.length > 0) {
          t.subs = [...parent.subs];
        }
      }
    }
  });

  const minP = topics.length ? Math.min(...topics.map(t => t.page || 0).filter(Boolean)) : 0;
  const maxP = topics.length ? Math.max(...topics.map(t => t.page || 0).filter(Boolean)) : 0;

  parsedSystems.push({
    id: sysKey,
    key: sysKey,
    name: SYS_NAMES[sysKey] || sysKey.toUpperCase(),
    subtitle: `pp. ${minP}–${maxP} · ${topics.length} topics`,
    color: SYS_COLORS[sysKey] || '#6366f1',
    pageRange: { min: minP, max: maxP },
    subjects: subjects,
    topicsCount: topics.length,
    topics: topics,
    moreImages: moreImages
  });
});

// Update database
db.data.firstAidSystems = parsedSystems;
db.data.firstAidFull = {
  totalSystems: parsedSystems.length,
  totalTopics: parsedSystems.reduce((a, s) => a + s.topicsCount, 0),
  totalTables: Object.values(sandbox.FA_TABLES).reduce((acc, sys) => acc + Object.values(sys).reduce((a, t) => a + t.length, 0), 0),
  totalImages: Object.values(sandbox.FA_IMAGES).reduce((acc, sys) => acc + Object.values(sys).reduce((a, i) => a + i.length, 0), 0)
};

db.save();

console.log('══════════════════════════════════════════════════');
console.log(`✅ Parsed ${db.data.firstAidFull.totalSystems} First Aid Systems`);
console.log(`✅ Total Topics / Headings: ${db.data.firstAidFull.totalTopics}`);
console.log(`✅ Total UWorld Tables: ${db.data.firstAidFull.totalTables}`);
console.log(`✅ Total UWorld Medical Images: ${db.data.firstAidFull.totalImages}`);
console.log('══════════════════════════════════════════════════');
