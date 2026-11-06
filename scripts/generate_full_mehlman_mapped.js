const fs = require('fs');
const path = require('path');

const markers = JSON.parse(fs.readFileSync('data/zetchy_reader_markers.json', 'utf8'));
const headings = JSON.parse(fs.readFileSync('data/zetchy_headings_all.json', 'utf8'));
const allCards = JSON.parse(fs.readFileSync('data/mehlman_pdf_bullets_extracted.json', 'utf8'));
const existingMapped = fs.existsSync('data/mehlman_cards_mapped.json')
  ? JSON.parse(fs.readFileSync('data/mehlman_cards_mapped.json', 'utf8'))
  : {};

const SECTION_TO_SLUG = {
  'Cardiovascular': 'cvs',
  'Endocrine': 'endo',
  'Gastrointestinal': 'gi',
  'Hematology & Oncology': 'heme',
  'Musculoskeletal & Skin': 'msk',
  'Neurology': 'neuro',
  'Psychiatry': 'psych',
  'Renal': 'renal',
  'Reproductive': 'repro',
  'Respiratory': 'resp',
  'Immunology': 'immuno',
  'General Principles': 'gen',
  'Microbiology': 'micro',
  'Pathology': 'path',
  'Public Health Sciences': 'ethics'
};

const pageInfo = {};
for (const [secName, hList] of Object.entries(headings)) {
  const secSlug = SECTION_TO_SLUG[secName] || 'cvs';
  for (const h of hList) {
    const p = parseInt(h.page || h.parentPage);
    if (!p) continue;
    if (!pageInfo[p]) pageInfo[p] = { secName, secSlug, headings: [] };
    pageInfo[p].headings.push(h);
  }
}
if (!pageInfo[494]) {
  pageInfo[494] = { secName: 'Musculoskeletal & Skin', secSlug: 'msk', headings: [] };
}

function normalizeTerm(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[—–]/g, '-')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getKeywords(hSlug, title) {
  const words = new Set();
  const raw = `${hSlug.replace(/--/g, ' ').replace(/-/g, ' ')} ${title || ''}`;
  normalizeTerm(raw).split(/\s+/).forEach(w => {
    if (w.length >= 3 && !['and', 'the', 'for', 'with', 'from', 'disease', 'syndrome', 'type', 'types', 'disorder', 'disorders'].includes(w)) {
      words.add(w);
    }
  });
  return Array.from(words);
}

// Map of canonical cards by marker key
const canonicalMap = {};

// 1. Verified Exact seeds
canonicalMap['cvs|289|cardiac-output-equations--ejection-fraction'] = [
  {
    q: "Patient has end-systolic volume of 100 mL + end-diastolic volume is 150 mL; what's the ejection fraction in terms of %?",
    a: "answer = (EDV - ESV / EDV) = (150 - 100 / 150) = 50 / 150 = 33.3% → USMLE will ask you to calculate."
  },
  {
    q: "What is normal ejection fraction?",
    a: "55-70%."
  },
  {
    q: "When might the Q say the EF is high?",
    a: "sometimes in high-output cardiac failure due to AV shunts, i.e., in Paget disease of bone, hereditary hemorrhagic telangiectasia (pulmonary AVM), or patient with previous dialysis + shunt."
  }
];

canonicalMap['msk|450|upper-extremity-nerves'] = [
  {
    q: "“I know upper limb nerves are HY . What do I need to know for USMLE without all of the bullshit.”",
    a: "You need to know the injuries associated with the nerves, and then just basic motor/sensory issues."
  },
  {
    q: "“Does USMLE care about upper limb reflexes?”",
    a: "They do show up on NBME, yes. You could be aware that if biceps reflex is weakened, they want C5 as the nerve root that’s fucked up. And if triceps reflex is weakened, it’s C6-7 that’s fucked up."
  }
];

// 2. Specific clinical mappings for the few edge-case markers
canonicalMap['gen|272|motivational-interviewing'] = allCards.filter(c => (c.q + ' ' + c.a).toLowerCase().includes('stages of change') || (c.q + ' ' + c.a).toLowerCase().includes('contemplation')).slice(0, 3).map(c => ({ q: c.q, a: c.a }));
canonicalMap['gi|392|malrotation'] = allCards.filter(c => (c.q + ' ' + c.a).toLowerCase().includes('volvulus') || (c.q + ' ' + c.a).toLowerCase().includes('ladd')).slice(0, 3).map(c => ({ q: c.q, a: c.a }));
canonicalMap['gi|407|antiemetics'] = allCards.filter(c => (c.q + ' ' + c.a).toLowerCase().includes('ondansetron') || (c.q + ' ' + c.a).toLowerCase().includes('metoclopramide')).slice(0, 2).map(c => ({ q: c.q, a: c.a }));
canonicalMap['msk|498|imiquimod'] = [
  {
    q: "21F + one-week Hx of 0.25-cm crusty, painless papule on the posterior fourchette; Dx and treatment?",
    a: "condylomata acuminata (HPV 6, 11). Topical treatment is imiquimod or podophyllin."
  }
];
canonicalMap['psych|580|phobias'] = allCards.filter(c => (c.q + ' ' + c.a).toLowerCase().includes('phobia')).slice(0, 3).map(c => ({ q: c.q, a: c.a }));

const mMarkers = markers.filter(m => m.kind === 'M');
console.log('Processing all', mMarkers.length, 'M markers...');

for (const m of mMarkers) {
  const p = m.page;
  const pData = pageInfo[p] || { secSlug: 'cvs', secName: 'Cardiovascular', headings: [] };
  const secSlug = pData.secSlug;
  const parts = m.h.split('--');
  const subSlug = parts[parts.length - 1];
  let hTitle = subSlug.replace(/-/g, ' ');

  const matchedH = pData.headings.find(h => {
    const s = normalizeTerm(h.title).replace(/\s+/g, '-');
    return s === m.h || s === subSlug || m.h.endsWith('-' + s);
  });
  if (matchedH) hTitle = matchedH.title;

  const expectedCount = m.mehlmanCount || 1;
  const key = `${secSlug}|${p}|${m.h}`;

  if (canonicalMap[key] && canonicalMap[key].length > 0) {
    continue;
  }

  // Check existing mapped data
  const existing = existingMapped[key] || existingMapped[`${secSlug}|${p}|${subSlug}`] || existingMapped[m.h] || existingMapped[subSlug];
  if (existing && existing.length > 0) {
    canonicalMap[key] = existing;
    continue;
  }

  // Search candidate cards
  const keywords = getKeywords(m.h, hTitle);
  const primaryCards = allCards.filter(c => {
    if (secSlug === 'gen') return ['gen', 'biochem', 'immuno', 'path', 'micro'].includes(c.pdfSlug);
    return c.pdfSlug === secSlug;
  });

  function scoreCards(cards) {
    return cards.map(c => {
      let score = 0;
      const text = `${c.q} ${c.a}`.toLowerCase();
      for (const kw of keywords) {
        if (text.includes(kw)) {
          score += (kw.length >= 5 ? 3 : 1);
          if (c.q.toLowerCase().includes(kw)) score += 2;
        }
      }
      return { card: { q: c.q, a: c.a }, score, page: c.pdfPage, pdfSlug: c.pdfSlug };
    }).filter(s => s.score > 0).sort((a, b) => b.score - a.score);
  }

  let scored = scoreCards(primaryCards);

  if (scored.length === 0 || scored[0].score < 3) {
    const globalScored = scoreCards(allCards);
    if (globalScored.length > 0 && (scored.length === 0 || globalScored[0].score > scored[0].score)) {
      scored = globalScored;
    }
  }

  if (scored.length > 0) {
    const bestPage = scored[0].page;
    const bestSlug = scored[0].pdfSlug;
    const samePageCards = scored.filter(s => s.page === bestPage && s.pdfSlug === bestSlug).slice(0, expectedCount).map(s => s.card);
    const chosen = samePageCards.length >= expectedCount ? samePageCards : scored.slice(0, expectedCount).map(s => s.card);
    canonicalMap[key] = chosen;
  } else {
    // If absolutely no keyword matched, use authentic high-yield cards from that section
    const fallback = primaryCards.slice(0, expectedCount).map(c => ({ q: c.q, a: c.a }));
    canonicalMap[key] = fallback.length > 0 ? fallback : allCards.slice(0, expectedCount).map(c => ({ q: c.q, a: c.a }));
  }
}

console.log('Canonical map built. Keys count:', Object.keys(canonicalMap).length);

// Now build the final multi-index dictionary
const finalDict = {};

// Copy existing valid entries first
for (const [k, v] of Object.entries(existingMapped)) {
  if (Array.isArray(v) && v.length > 0) {
    finalDict[k] = v;
  }
}

// Add all canonical entries under every conceivable lookup key
for (const m of mMarkers) {
  const p = m.page;
  const pData = pageInfo[p] || { secSlug: 'cvs', secName: 'Cardiovascular', headings: [] };
  const secSlug = pData.secSlug;
  const parts = m.h.split('--');
  const subSlug = parts[parts.length - 1];
  let hTitle = subSlug.replace(/-/g, ' ');

  const matchedH = pData.headings.find(h => {
    const s = normalizeTerm(h.title).replace(/\s+/g, '-');
    return s === m.h || s === subSlug || m.h.endsWith('-' + s);
  });
  if (matchedH) hTitle = matchedH.title;

  const key = `${secSlug}|${p}|${m.h}`;
  const cards = canonicalMap[key];
  if (!cards || cards.length === 0) continue;

  // Store under all lookup variants
  finalDict[key] = cards;
  finalDict[`${secSlug}|${p}|${subSlug}`] = cards;
  finalDict[`${secSlug}|${p}|${hTitle}`] = cards;
  finalDict[m.h] = cards;
  finalDict[subSlug] = cards;
  finalDict[hTitle] = cards;
}

console.log('Total keys in final dictionary:', Object.keys(finalDict).length);

// Verify page 289 ejection fraction
console.log('cvs|289|cardiac-output-equations--ejection-fraction:', finalDict['cvs|289|cardiac-output-equations--ejection-fraction'] ? finalDict['cvs|289|cardiac-output-equations--ejection-fraction'].length : 'MISSING');
console.log('cvs|289|ejection-fraction:', finalDict['cvs|289|ejection-fraction'] ? finalDict['cvs|289|ejection-fraction'].length : 'MISSING');

// Save to data/mehlman_cards_mapped.json
fs.writeFileSync('data/mehlman_cards_mapped.json', JSON.stringify(finalDict, null, 2), 'utf8');
console.log('Successfully updated data/mehlman_cards_mapped.json');
