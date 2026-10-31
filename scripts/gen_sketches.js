// Generate distinct SVG canvas images for each sketch
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'public', 'assets', 'sketches');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Each sketch has: id, bg gradient, scene description text, accent color, icon emoji
const sketches = [
  // ===== SKETCHY PATH =====
  // Blood & Coagulation
  {
    id: 'sketch_1_1', num: '1.1', title: 'Microcytic Anemia: Overview & Thalassemias',
    bg1: '#d4870a', bg2: '#b05a00', accent: '#fde68a',
    scene: 'Mediterranean Market', detail: 'Spice stalls · Coin merchants · Red clay pottery',
    thumb_bg1: '#c47d0a', thumb_bg2: '#9a4d00'
  },
  {
    id: 'sketch_1_2', num: '1.2', title: 'Iron Deficiency Anemia & ACD',
    bg1: '#166534', bg2: '#14532d', accent: '#6ee7b7',
    scene: "Dwarf's Forest Den", detail: 'Iron forge · Flowing river · Wooden cabin',
    thumb_bg1: '#15803d', thumb_bg2: '#166534'
  },
  {
    id: 'sketch_1_3', num: '1.3', title: 'Megaloblastic Anemia (B12 & Folate)',
    bg1: '#1e3a5f', bg2: '#0c1a2e', accent: '#93c5fd',
    scene: 'Royal Library', detail: 'Giant books · Cobalt crystals · Scholar knights',
    thumb_bg1: '#1d4ed8', thumb_bg2: '#1e3a5f'
  },
  {
    id: 'sketch_1_4', num: '1.4', title: 'Sickle Cell Disease',
    bg1: '#7c1d1d', bg2: '#450a0a', accent: '#fca5a5',
    scene: 'Desert Crescent Valley', detail: 'Crescent moons · Oasis · Sand dunes',
    thumb_bg1: '#991b1b', thumb_bg2: '#7c1d1d'
  },
  {
    id: 'sketch_1_5', num: '1.5', title: 'ITP & TTP/HUS',
    bg1: '#4a044e', bg2: '#2e0040', accent: '#e879f9',
    scene: 'Purple Castle Siege', detail: 'ADAMTS13 sword · Platelet shields · Fibrin webs',
    thumb_bg1: '#7e22ce', thumb_bg2: '#4a044e'
  },
  // Cardiovascular
  {
    id: 'sketch_cv_1', num: '2.1', title: 'Myocardial Infarction Pathology',
    bg1: '#7f1d1d', bg2: '#450a0a', accent: '#fca5a5',
    scene: 'Coronary River Dam', detail: 'Plaque boulders · Clot waterfall · Pale zones',
    thumb_bg1: '#9a3412', thumb_bg2: '#7f1d1d'
  },
  {
    id: 'sketch_cv_2', num: '2.2', title: 'Heart Failure & Cardiomyopathies',
    bg1: '#831843', bg2: '#500724', accent: '#f9a8d4',
    scene: 'Failing Pump Factory', detail: 'Dilated chambers · Brick walls · Fluid floods',
    thumb_bg1: '#9d174d', thumb_bg2: '#831843'
  },
  {
    id: 'sketch_cv_3', num: '2.3', title: 'Valvular Heart Diseases',
    bg1: '#5b21b6', bg2: '#3b0764', accent: '#c4b5fd',
    scene: 'Gate Kingdom', detail: 'Stenotic gates · Regurgitant valves · Murmur winds',
    thumb_bg1: '#7c3aed', thumb_bg2: '#5b21b6'
  },
  {
    id: 'sketch_cv_4', num: '2.4', title: 'Hypertension & Atherosclerosis',
    bg1: '#9a3412', bg2: '#431407', accent: '#fdba74',
    scene: 'High-Pressure Pipeline', detail: 'Fatty streaks · Pressure gauges · Fibrous caps',
    thumb_bg1: '#c2410c', thumb_bg2: '#9a3412'
  },
  // Respiratory
  {
    id: 'sketch_resp_1', num: '3.1', title: 'COPD, Emphysema & Chronic Bronchitis',
    bg1: '#0c4a6e', bg2: '#082f49', accent: '#7dd3fc',
    scene: 'Smoky Mountain Tunnels', detail: 'Alveolar balloons · Goblet cell chimneys · Airtrapping clouds',
    thumb_bg1: '#0284c7', thumb_bg2: '#0c4a6e'
  },
  {
    id: 'sketch_resp_2', num: '3.2', title: 'Asthma & Hypersensitivity',
    bg1: '#0d9488', bg2: '#064e3b', accent: '#99f6e4',
    scene: 'Pollen Storm Garden', detail: 'Mast cell flowers · Bronchospasm ropes · Eosinophil soldiers',
    thumb_bg1: '#0d9488', thumb_bg2: '#065f46'
  },
  {
    id: 'sketch_resp_3', num: '3.3', title: 'Pneumonia & Lung Infections',
    bg1: '#374151', bg2: '#1f2937', accent: '#d1d5db',
    scene: 'Foggy Harbor', detail: 'Consolidation boats · Exudate fog · Sputum anchors',
    thumb_bg1: '#4b5563', thumb_bg2: '#374151'
  },
  // GI
  {
    id: 'sketch_gi_1', num: '4.1', title: 'GERD, Barrett & Adenocarcinoma',
    bg1: '#4d7c0f', bg2: '#365314', accent: '#bef264',
    scene: 'Acid River Factory', detail: 'Acid waterfall · Metaplasia garden · Barrett bridge',
    thumb_bg1: '#65a30d', thumb_bg2: '#4d7c0f'
  },
  {
    id: 'sketch_gi_2', num: '4.2', title: 'Peptic Ulcer Disease',
    bg1: '#713f12', bg2: '#431407', accent: '#fde68a',
    scene: 'Ulcer Cave Mine', detail: 'H. pylori miners · Acid geysers · NSAIDs bombs',
    thumb_bg1: '#92400e', thumb_bg2: '#713f12'
  },
  {
    id: 'sketch_gi_3', num: '4.3', title: 'IBD: Crohn & Ulcerative Colitis',
    bg1: '#7c2d12', bg2: '#431407', accent: '#fdba74',
    scene: 'Inflamed Kingdom Wall', detail: 'Transmural cracks · Skip lesions · Cobblestone streets',
    thumb_bg1: '#9a3412', thumb_bg2: '#7c2d12'
  },
  // Renal
  {
    id: 'sketch_ren_1', num: '5.1', title: 'Membranous & Minimal Change Disease',
    bg1: '#0e7490', bg2: '#164e63', accent: '#67e8f9',
    scene: 'Glomerulus Aquarium', detail: 'Podocyte fish · Protein leaks · Basement membrane walls',
    thumb_bg1: '#0891b2', thumb_bg2: '#0e7490'
  },
  {
    id: 'sketch_ren_2', num: '5.2', title: 'Acute Kidney Injury',
    bg1: '#155e75', bg2: '#083344', accent: '#a5f3fc',
    scene: 'Filter Tower Breakdown', detail: 'Tubular casts · Ischemic wasteland · ATN ruins',
    thumb_bg1: '#0e7490', thumb_bg2: '#155e75'
  },
  // Neurology
  {
    id: 'sketch_neuro_1', num: '6.1', title: 'Alzheimer & Frontotemporal Dementia',
    bg1: '#4c1d95', bg2: '#2e1065', accent: '#c4b5fd',
    scene: 'Tangled Memory Palace', detail: 'Amyloid plaques · Tau tangles · Hippocampus maze',
    thumb_bg1: '#6d28d9', thumb_bg2: '#4c1d95'
  },
  {
    id: 'sketch_neuro_2', num: '6.2', title: 'Stroke & TIA',
    bg1: '#1e1b4b', bg2: '#0f172a', accent: '#818cf8',
    scene: 'Brain River Dam Burst', detail: 'Ischemic territory · Penumbra shore · Reperfusion floods',
    thumb_bg1: '#3730a3', thumb_bg2: '#1e1b4b'
  },
  // MSK
  {
    id: 'sketch_msk_1', num: '7.1', title: 'Rheumatoid Arthritis vs Osteoarthritis',
    bg1: '#92400e', bg2: '#78350f', accent: '#fde68a',
    scene: 'Joint Workshop', detail: 'Pannus invasion · Cartilage wear · Synovial fluid',
    thumb_bg1: '#b45309', thumb_bg2: '#92400e'
  },
  // Endocrine
  {
    id: 'sketch_endo_1', num: '8.1', title: 'Thyroiditis & Thyroid Carcinomas',
    bg1: '#a16207', bg2: '#713f12', accent: '#fef08a',
    scene: 'Butterfly Gland Kingdom', detail: 'Hashimoto army · Papillary churches · Calcitonin bells',
    thumb_bg1: '#ca8a04', thumb_bg2: '#a16207'
  },
  {
    id: 'sketch_endo_2', num: '8.2', title: 'Diabetes Mellitus Type 1 & 2',
    bg1: '#7e22ce', bg2: '#4a044e', accent: '#d8b4fe',
    scene: 'Glucose Highway City', detail: 'Insulin factory · Beta cell destruction · Glucose floods',
    thumb_bg1: '#9333ea', thumb_bg2: '#7e22ce'
  },
  // Reproductive
  {
    id: 'sketch_repro_1', num: '9.1', title: 'Seminoma vs GCT',
    bg1: '#be185d', bg2: '#881337', accent: '#fda4af',
    scene: 'Gonadal Tournament Arena', detail: 'Alpha-fetoprotein flags · hCG banners · LDH torches',
    thumb_bg1: '#db2777', thumb_bg2: '#be185d'
  },

  // ===== SKETCHY MICRO =====
  {
    id: 'micro_staph_aureus', num: 'M1', title: 'Staphylococcus aureus',
    bg1: '#ca8a04', bg2: '#92400e', accent: '#fef08a',
    scene: 'Golden Staff of Moses Arena', detail: 'Coagulase cauldron · Beta hemolysin shield · Toxin sword',
    thumb_bg1: '#eab308', thumb_bg2: '#ca8a04'
  },
  {
    id: 'micro_strep_pneumo', num: 'M2', title: 'Streptococcus pneumoniae',
    bg1: '#0d9488', bg2: '#134e4a', accent: '#a7f3d0',
    scene: 'Alpha Knight Tournament', detail: 'Lancet diplococci · Optochin mask · Bile soluble shield',
    thumb_bg1: '#10b981', thumb_bg2: '#0d9488'
  },
  {
    id: 'micro_pseudo', num: 'M3', title: 'Pseudomonas aeruginosa',
    bg1: '#1e40af', bg2: '#1e3a8a', accent: '#93c5fd',
    scene: 'Blue-Green Mona Lisa Gallery', detail: 'Grape candy · Pyocyanin paint · Oxidase palette',
    thumb_bg1: '#2563eb', thumb_bg2: '#1e40af'
  },
  {
    id: 'micro_ecoli', num: 'M4', title: 'E. coli & Enterobacteriaceae',
    bg1: '#dc2626', bg2: '#7f1d1d', accent: '#fca5a5',
    scene: 'Red Gram-Negative Bazaar', detail: 'Lactose fermenter stalls · O antigen flags · Fimbriae ropes',
    thumb_bg1: '#ef4444', thumb_bg2: '#dc2626'
  },
  {
    id: 'micro_tb', num: 'M5', title: 'Mycobacterium tuberculosis',
    bg1: '#92400e', bg2: '#451a03', accent: '#fde68a',
    scene: 'Caseous Cave Kingdom', detail: 'Ghon complex · Langhans giants · Caseation mines',
    thumb_bg1: '#b45309', thumb_bg2: '#92400e'
  },
  {
    id: 'micro_hiv', num: 'M6', title: 'HIV & AIDS',
    bg1: '#7c1d1d', bg2: '#3b0000', accent: '#fca5a5',
    scene: 'CD4 Castle Siege', detail: 'gp120 battering ram · Reverse transcriptase scribes · Protease chefs',
    thumb_bg1: '#b91c1c', thumb_bg2: '#7c1d1d'
  },
  {
    id: 'micro_influenza', num: 'M7', title: 'Influenza Virus',
    bg1: '#1e3a8a', bg2: '#0f172a', accent: '#93c5fd',
    scene: 'Antigenic Winter Storm', detail: 'Hemagglutinin spikes · Neuraminidase blades · Reassortment mixers',
    thumb_bg1: '#1d4ed8', thumb_bg2: '#1e3a8a'
  },
  {
    id: 'micro_candida', num: 'M8', title: 'Candida & Fungal Infections',
    bg1: '#5b21b6', bg2: '#2e1065', accent: '#e9d5ff',
    scene: 'White Pseudohyphae Jungle', detail: 'Candida yeast domes · Germ tube bridge · Azole castle gate',
    thumb_bg1: '#7c3aed', thumb_bg2: '#5b21b6'
  },

  // ===== SKETCHY PHARM =====
  {
    id: 'pharm_penicillin', num: 'P1', title: 'Penicillins & Beta-Lactams',
    bg1: '#065f46', bg2: '#022c22', accent: '#6ee7b7',
    scene: 'Penicillin Mold Kingdom', detail: 'PBP lock picks · Beta-lactamase traps · Cross-allergy web',
    thumb_bg1: '#059669', thumb_bg2: '#065f46'
  },
  {
    id: 'pharm_heparin', num: 'P2', title: 'Heparin & Anticoagulants',
    bg1: '#b45309', bg2: '#7c2d12', accent: '#fde68a',
    scene: 'Antithrombin River Fort', detail: 'Heparin chains · Protamine key · HIT platelet ambush',
    thumb_bg1: '#d97706', thumb_bg2: '#b45309'
  },
  {
    id: 'pharm_statins', num: 'P3', title: 'Statins & Lipid-Lowering Drugs',
    bg1: '#1e40af', bg2: '#1e3a8a', accent: '#bfdbfe',
    scene: 'HMG-CoA Reductase Factory', detail: 'Lovastatin machines · Myopathy risks · LDL receptor gates',
    thumb_bg1: '#2563eb', thumb_bg2: '#1e40af'
  },
  {
    id: 'pharm_ace', num: 'P4', title: 'ACE Inhibitors & ARBs',
    bg1: '#0891b2', bg2: '#0e4f69', accent: '#a5f3fc',
    scene: 'Angiotensin Tower', detail: 'ACE enzyme crusher · Bradykinin bell · Angiotensin II gates',
    thumb_bg1: '#0ea5e9', thumb_bg2: '#0891b2'
  },
  {
    id: 'pharm_ssri', num: 'P5', title: 'Antidepressants: SSRIs, SNRIs, TCAs',
    bg1: '#7c3aed', bg2: '#4c1d95', accent: '#ddd6fe',
    scene: 'Serotonin Synapse City', detail: 'Reuptake transporter dams · Monoamine rivers · NE highways',
    thumb_bg1: '#8b5cf6', thumb_bg2: '#7c3aed'
  },
  {
    id: 'pharm_antiepileptic', num: 'P6', title: 'Antiepileptics',
    bg1: '#0f766e', bg2: '#134e4a', accent: '#99f6e4',
    scene: 'Na-Channel Lightning Circus', detail: 'Phenytoin lightning rods · GABA trampolines · Carbamazepine nets',
    thumb_bg1: '#0d9488', thumb_bg2: '#0f766e'
  },
];

function makeSVG(sketch, isThumb = false) {
  const W = isThumb ? 300 : 800;
  const H = isThumb ? 200 : 450;

  // Pin positions for non-thumb (scatter across image)
  const totalPins = isThumb ? 0 : Math.floor(Math.random() * 20) + 15;
  let pinsHtml = '';
  if (!isThumb) {
    const colors = ['#3b82f6','#ef4444','#22c55e','#f59e0b','#8b5cf6','#ec4899','#06b6d4'];
    for (let i = 1; i <= totalPins; i++) {
      const x = 5 + Math.random() * 88;
      const y = 10 + Math.random() * 80;
      const col = colors[i % colors.length];
      pinsHtml += `<circle cx="${(x/100*W).toFixed(1)}" cy="${(y/100*H).toFixed(1)}" r="11" fill="${col}" stroke="white" stroke-width="1.5"/>
<text x="${(x/100*W).toFixed(1)}" y="${(y/100*H + 4).toFixed(1)}" text-anchor="middle" fill="white" font-size="9" font-weight="bold" font-family="Arial">${i}</text>`;
    }
  }

  const bg1 = isThumb ? sketch.thumb_bg1 : sketch.bg1;
  const bg2 = isThumb ? sketch.thumb_bg2 : sketch.bg2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bg1}"/>
      <stop offset="100%" style="stop-color:${bg2}"/>
    </linearGradient>
    <filter id="blur">
      <feGaussianBlur stdDeviation="2"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  
  <!-- Decorative circles (scene atmosphere) -->
  <circle cx="${W*0.15}" cy="${H*0.2}" r="${H*0.4}" fill="${sketch.accent}22" filter="url(#blur)"/>
  <circle cx="${W*0.8}" cy="${H*0.7}" r="${H*0.35}" fill="${sketch.accent}18" filter="url(#blur)"/>
  <circle cx="${W*0.5}" cy="${H*0.5}" r="${H*0.55}" fill="${bg1}33" filter="url(#blur)"/>
  
  <!-- Grid texture overlay -->
  ${Array.from({length: 8}, (_, i) => 
    `<line x1="0" y1="${H*i/8}" x2="${W}" y2="${H*i/8}" stroke="white" stroke-opacity="0.04" stroke-width="1"/>`
  ).join('')}
  ${Array.from({length: 12}, (_, i) => 
    `<line x1="${W*i/12}" y1="0" x2="${W*i/12}" y2="${H}" stroke="white" stroke-opacity="0.04" stroke-width="1"/>`
  ).join('')}

  <!-- Scene label badge -->
  <rect x="10" y="10" width="${isThumb ? 120 : 180}" height="${isThumb ? 18 : 22}" rx="9" fill="black" fill-opacity="0.5"/>
  <text x="${isThumb ? 60 : 90}" y="${isThumb ? 22 : 25}" text-anchor="middle" fill="${sketch.accent}" font-size="${isThumb ? 8 : 10}" font-weight="bold" font-family="Arial">${sketch.scene.toUpperCase()}</text>

  <!-- Number badge -->
  <rect x="${W-50}" y="10" width="40" height="${isThumb ? 18 : 22}" rx="${isThumb ? 9 : 11}" fill="${sketch.accent}44" stroke="${sketch.accent}" stroke-width="1"/>
  <text x="${W-30}" y="${isThumb ? 22 : 26}" text-anchor="middle" fill="white" font-size="${isThumb ? 9 : 11}" font-weight="bold" font-family="Arial">${sketch.num}</text>

  ${!isThumb ? pinsHtml : ''}
  
  <!-- Title background -->
  <rect x="0" y="${H-(isThumb ? 50 : 70)}" width="${W}" height="${isThumb ? 50 : 70}" fill="black" fill-opacity="0.65"/>
  
  <!-- Title text -->
  <text x="${W/2}" y="${H - (isThumb ? 28 : 42)}" text-anchor="middle" fill="white" font-size="${isThumb ? 11 : 15}" font-weight="bold" font-family="Arial">${sketch.title.length > 40 ? sketch.title.substring(0,38)+'...' : sketch.title}</text>
  <text x="${W/2}" y="${H - (isThumb ? 12 : 22)}" text-anchor="middle" fill="${sketch.accent}" font-size="${isThumb ? 8 : 10}" font-family="Arial">${sketch.detail}</text>
  ${!isThumb ? `<text x="${W/2}" y="${H - 6}" text-anchor="middle" fill="white" fill-opacity="0.5" font-size="8" font-family="Arial">Zetchy • Interactive Memory Palace Canvas</text>` : ''}
</svg>`;
}

let generated = 0;
for (const sketch of sketches) {
  // Full canvas SVG
  const canvasSvg = makeSVG(sketch, false);
  const canvasPath = path.join(outputDir, `canvas_${sketch.id}.svg`);
  fs.writeFileSync(canvasPath, canvasSvg);
  
  // Thumbnail SVG
  const thumbSvg = makeSVG(sketch, true);
  const thumbPath = path.join(outputDir, `thumb_${sketch.id}.svg`);
  fs.writeFileSync(thumbPath, thumbSvg);
  
  generated++;
}

console.log(`Generated ${generated * 2} SVG files (${generated} canvases + ${generated} thumbnails)`);
console.log('Sketch IDs:', sketches.map(s => s.id).join(', '));
