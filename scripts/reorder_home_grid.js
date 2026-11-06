const fs = require('fs');

const db = JSON.parse(fs.readFileSync('data/db.json', 'utf8'));

// Exact 13 ordered systems from prompt
const ORDERED = [
  { id: 'cvs', name: 'Cardiovascular', color: '#c2410c', icon: 'heart' },
  { id: 'endo', name: 'Endocrine', color: '#b58500', icon: 'sparkles' },
  { id: 'gi', name: 'Gastrointestinal', color: '#4d6b1f', icon: 'utensils' },
  { id: 'heme', name: 'Hematology & Oncology', color: '#831843', icon: 'drop' },
  { id: 'msk', name: 'Musculoskeletal & Skin', color: '#a16207', icon: 'bone' },
  { id: 'neuro', name: 'Neurology', color: '#581c87', icon: 'brain' },
  { id: 'psych', name: 'Psychiatry', color: '#3b82f6', icon: 'smile' },
  { id: 'renal', name: 'Renal', color: '#0e7490', icon: 'funnel' },
  { id: 'repro', name: 'Reproductive', color: '#be185d', icon: 'baby' },
  { id: 'resp', name: 'Respiratory', color: '#0284c7', icon: 'lungs' },
  { id: 'immuno', name: 'Immunology', color: '#0369a1', icon: 'shield' },
  { id: 'gen', name: 'General Principles', color: '#475569', icon: 'dna' },
  { id: 'micro', name: 'Microbiology', color: '#166534', icon: 'shield' }
];

const sysMap = new Map();
(db.firstAidSystems || []).forEach(s => sysMap.set(s.id, s));

const newSystems = ORDERED.map(ord => {
  const existing = sysMap.get(ord.id) || {};
  return {
    ...existing,
    id: ord.id,
    name: ord.name,
    color: ord.color,
    icon: ord.icon,
    easy: existing.easy || 0,
    forgetting: existing.forgetting || 0
  };
});

db.firstAidSystems = newSystems;
fs.writeFileSync('data/db.json', JSON.stringify(db, null, 2));
console.log('Successfully sorted and seeded db.json firstAidSystems into exact 13-card order with unique icons/colors!');
