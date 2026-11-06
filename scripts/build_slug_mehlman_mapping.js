const fs = require('fs');

const headings = JSON.parse(fs.readFileSync('d:/usmleapp/data/zetchy_headings_all.json', 'utf8'));
const allQa = JSON.parse(fs.readFileSync('d:/usmleapp/data/mehlman_all_pdf_qa.json', 'utf8'));
const markers = JSON.parse(fs.readFileSync('d:/usmleapp/data/zetchy_reader_markers.json', 'utf8'));

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

function slugify(title) {
  return String(title || '').toLowerCase()
    .replace(/[—–]/g, '-')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Map each slug + page to heading info
const slugMap = {};
for (const secName of Object.keys(headings)) {
  const rows = headings[secName];
  const secSlug = SECTION_SLUGS[secName] || 'cvs';
  rows.forEach(r => {
    const s = slugify(r.title);
    const p = r.page || r.parentPage || '';
    const key = `${secSlug}|${p}|${s}`;
    slugMap[key] = {
      sectionSlug: secSlug,
      sectionName: secName,
      title: r.title,
      page: p,
      hasM: r.hasM,
      slug: s
    };
  });
}

// Build cards mapped by slug and by legacy key
const cardsBySlug = {};

// Hardcoded verified exact pairs from reference screenshots & Dr. Mehlman's books
const EXACT_SEEDS = {
  'cvs|328|antiarrhythmics-potassium-channel-blockers-class-iii': [
    {
      q: 'What are the type III anti-arrhythmics?',
      a: 'potassium channel blockers à amiodarone, dronedarone, sotalol, ibutilide, dofetilide à often used in ventricular arrhythmias and in patients being defibrillated unsuccessfully à can be used in atrial fibrillation for rhythm control in those with structural heart disease who cannot take flecainide.'
    },
    {
      q: 'Points about amiodarone?',
      a: 'causes TdP, pulmonary fibrosis, drug-induced thyroid dysfunction (~40% iodine by weight), corneal deposits, blue-grey skin discoloration à do PFTs, TFTs, LFTs before commencing amiodarone.'
    }
  ],
  'cvs|328|antiarrhythmics-calcium-channel-blockers-class-iv': [
    {
      q: 'What are the type IV anti-arrhythmics?',
      a: 'non-dihydropyridine calcium channel blockers à verapamil, diltiazem à verapamil acts selectively on cardiac (nodal) tissue; in contrast, dihydropyridines like nifedipine act on vascular smooth muscle; diltiazem is said to be a mixed agent à verapamil’s notable use is for AF rate control in patients who cannot receive beta-blockers à verapamil causes constipation (really HY); it can also cause hyperprolactinemia; diltiazem has occasional utility in the Tx of anal fissure and achalasia.'
    }
  ],
  'cvs|328|other-antiarrhythmics--ivabradine': [
    {
      q: 'What is ivabradine?',
      a: 'inhibits myocardial “funny” Na channels (phase IV of AP) à may be attempted in select patients with stable angina who cannot take beta-blockers à can cause “luminous phenomenon,” which is brightness in an area of the visual field.'
    }
  ],
  'msk|450|upper-extremity-nerves': [
    {
      q: '“I know upper limb nerves are HY . What do I need to know for USMLE without all of the bullshit.”',
      a: 'You need to know the injuries associated with the nerves, and then just basic motor/sensory issues.'
    },
    {
      q: '“Does USMLE care about upper limb reflexes?”',
      a: 'They do show up on NBME, yes. You could be aware that if biceps reflex is weakened, they want C5 as the nerve root that’s fucked up. And if triceps reflex is weakened, it’s C6-7 that’s fucked up.'
    }
  ]
};

// Seed exact matches
Object.assign(cardsBySlug, EXACT_SEEDS);

// For other M markers and headings, link by matching slug keywords against extracted QA
markers.filter(m => m.kind === 'M' && m.h).forEach(m => {
  const p = m.page;
  // find candidate in slugMap
  const matchingKey = Object.keys(slugMap).find(k => k.endsWith(`|${p}|${m.h}`) || (k.includes(`|${p}|`) && k.includes(m.h)));
  if (!matchingKey) return;
  if (cardsBySlug[matchingKey]) return; // already seeded

  const info = slugMap[matchingKey];
  const secQa = allQa.filter(q => q.sysSlug === info.sectionSlug);

  // Match by heading terms
  const terms = m.h.split('-').filter(t => t.length >= 4 && !['antiarrhythmics','disease','syndrome','disorder'].includes(t));
  let matched = [];
  if (terms.length > 0) {
    matched = secQa.filter(item => {
      const text = (item.rawQ + ' ' + item.a).toLowerCase();
      return terms.some(t => text.includes(t));
    });
  }

  const targetCount = m.mehlmanCount || 2;
  if (matched.length > 0) {
    cardsBySlug[matchingKey] = matched.slice(0, targetCount).map(c => ({
      q: c.q,
      a: c.a
    }));
  }
});

// Also create mapping by slug alone: cardsBySlugOnly[slug] = cards
const cardsBySlugOnly = {};
for (const k of Object.keys(cardsBySlug)) {
  const parts = k.split('|');
  const slug = parts[2];
  cardsBySlugOnly[slug] = cardsBySlug[k];
  // Also keep legacy title key
  const info = slugMap[k];
  if (info) {
    cardsBySlug[`${info.sectionSlug}|${info.page}|${info.title}`] = cardsBySlug[k];
  }
}

console.log('Total headings with Mehlman cards:', Object.keys(cardsBySlug).length);
fs.writeFileSync('d:/usmleapp/data/mehlman_cards_mapped.json', JSON.stringify(cardsBySlug, null, 2));
fs.writeFileSync('d:/usmleapp/data/mehlman_cards_by_slug.json', JSON.stringify(cardsBySlugOnly, null, 2));
console.log('Saved mapped cards by exact slug and legacy key!');
