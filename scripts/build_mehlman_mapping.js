const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('data/mehlman_raw_extracted.json', 'utf8'));
const headings = JSON.parse(fs.readFileSync('data/zetchy_headings_all.json', 'utf8'));

// Slug mapping
const SECTION_SLUGS = {
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
  'Microbiology': 'micro'
};

function normalize(str) {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\bcontinued\b/g, '')
    .trim();
}

function wordsMatch(t1, t2) {
  const w1 = normalize(t1).split(/\s+/).filter(w => w.length > 2);
  const w2 = normalize(t2).split(/\s+/).filter(w => w.length > 2);
  if (w1.length === 0 || w2.length === 0) return false;
  return w1.some(w => w2.includes(w));
}

const mehlmanCards = {};
let totalHasM = 0;
let matchedHasM = 0;
let unmatchedList = [];

for (const sectionName of Object.keys(headings)) {
  const rows = headings[sectionName];
  const secSlug = SECTION_SLUGS[sectionName] || sectionName.toLowerCase();
  const pdfCards = raw[sectionName] || [];

  for (const row of rows) {
    if (!row.hasM) continue;
    totalHasM++;

    const key = `${secSlug}|${row.page || row.parentPage || ''}|${row.title}`;
    const normTitle = normalize(row.title);

    // Exact or contains match on question or answer text
    let matchedCards = pdfCards.filter(c => {
      const qNorm = normalize(c.q);
      const aNorm = normalize(c.a);
      return qNorm.includes(normTitle) || aNorm.includes(normTitle) ||
             (normTitle.length > 5 && (c.q.toLowerCase().includes(normTitle) || c.a.toLowerCase().includes(normTitle)));
    });

    // Fallback: word overlap with significant medical terms
    if (matchedCards.length === 0) {
      const titleWords = normTitle.split(/\s+/).filter(w => w.length >= 4 && !['disease','syndrome','disorder','pathology','physiology','anatomy'].includes(w));
      if (titleWords.length > 0) {
        matchedCards = pdfCards.filter(c => {
          const combined = (c.q + ' ' + c.a).toLowerCase();
          return titleWords.some(w => combined.includes(w));
        });
      }
    }

    // Limit to top 5 most relevant cards per heading to prevent overload
    if (matchedCards.length > 5) {
      matchedCards = matchedCards.slice(0, 5);
    }

    if (matchedCards.length > 0) {
      matchedHasM++;
      mehlmanCards[key] = matchedCards.map(c => ({ q: c.q, a: c.a }));
    } else {
      unmatchedList.push({ section: sectionName, page: row.page || row.parentPage, title: row.title });
    }
  }
}

console.log(`\n=================== MEHLMAN LINKING REPORT ===================`);
console.log(`Total hasM headings: ${totalHasM}`);
console.log(`Matched hasM headings: ${matchedHasM} (${Math.round((matchedHasM/totalHasM)*100)}%)`);
console.log(`Unmatched hasM headings: ${unmatchedList.length}`);
console.log(`\nSample unmatched headings (first 15):`);
unmatchedList.slice(0, 15).forEach(u => console.log(`  [${u.section} p.${u.page}] ${u.title}`));

fs.writeFileSync('data/mehlman_cards_mapped.json', JSON.stringify(mehlmanCards, null, 2));
console.log(`\nSaved mapped cards to data/mehlman_cards_mapped.json`);
