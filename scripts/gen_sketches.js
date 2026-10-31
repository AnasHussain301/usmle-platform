// High-Quality Memory Palace Scene Generator (100% W3C Valid SVG 1.1)
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'public', 'assets', 'sketches');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Convert hex to rgb
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const num = parseInt(hex, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

const sketches = [
  // ===== SKETCHY PATH =====
  {
    id: 'sketch_1_1', num: '1.1', title: 'Microcytic Anemia: Overview & Thalassemias',
    theme: 'market', sky1: '#9a3412', sky2: '#c2410c', ground: '#78350f', accent: '#fef08a',
    sceneTitle: 'Mediterranean Bazaar', subtitle: 'Spice Merchant Palace · Currency Scales · Ancient Amphoras'
  },
  {
    id: 'sketch_1_2', num: '1.2', title: 'Iron Deficiency Anemia & ACD',
    theme: 'forest_forge', sky1: '#14532d', sky2: '#166534', ground: '#1e3a1f', accent: '#86efac',
    sceneTitle: "Dwarf's Forest Forge", subtitle: 'Iron Smelting Mill · Mossy Water Wheel · River Sluice'
  },
  {
    id: 'sketch_1_3', num: '1.3', title: 'Megaloblastic Anemia (B12 & Folate)',
    theme: 'library', sky1: '#1e3a8a', sky2: '#1d4ed8', ground: '#0f172a', accent: '#93c5fd',
    sceneTitle: 'The Grand Royal Library', subtitle: 'Cobalt Crystal Spires · Ancient Folios · Knight Scholars'
  },
  {
    id: 'sketch_1_4', num: '1.4', title: 'Sickle Cell Disease & Hemoglobinopathies',
    theme: 'desert', sky1: '#831843', sky2: '#9f1239', ground: '#4c0519', accent: '#fbcfe8',
    sceneTitle: 'Desert Crescent Dunes', subtitle: 'Sickle Moon Oasis · Caravanserai · Blood River Basin'
  },
  {
    id: 'sketch_1_5', num: '1.5', title: 'ITP & TTP / HUS',
    theme: 'castle', sky1: '#581c87', sky2: '#7e22ce', ground: '#2e1065', accent: '#e9d5ff',
    sceneTitle: 'Purple Citadel Fortress', subtitle: 'ADAMTS13 Armory · Fibrin Drawbridge · Platelet Wall'
  },

  // Cardiovascular
  {
    id: 'sketch_cv_1', num: '2.1', title: 'Myocardial Infarction: Pathology & Timeline',
    theme: 'volcano', sky1: '#7f1d1d', sky2: '#b91c1c', ground: '#450a0a', accent: '#fecaca',
    sceneTitle: 'Coronary Gorge Fissure', subtitle: 'Plaque Rupture Cliff · Lava Thrombosis · Necrosis Valley'
  },
  {
    id: 'sketch_cv_2', num: '2.2', title: 'Heart Failure & Cardiomyopathies',
    theme: 'factory', sky1: '#831843', sky2: '#9d174d', ground: '#500724', accent: '#fbcfe8',
    sceneTitle: 'The Steam Engine Pumping Station', subtitle: 'Dilated Pressure Chambers · Piston Hydraulics · Edema Floodgates'
  },
  {
    id: 'sketch_cv_3', num: '2.3', title: 'Valvular Heart Diseases',
    theme: 'castle_gates', sky1: '#4c1d95', sky2: '#6d28d9', ground: '#2e1065', accent: '#ddd6fe',
    sceneTitle: 'Kingdom of Four Gates', subtitle: 'Aortic Grand Arch · Mitral Drawbridge · Murmur Cataracts'
  },
  {
    id: 'sketch_cv_4', num: '2.4', title: 'Hypertension & Atherosclerosis',
    theme: 'high_pressure', sky1: '#9a3412', sky2: '#ea580c', ground: '#431407', accent: '#fed7aa',
    sceneTitle: 'High-Pressure Aqueduct Network', subtitle: 'Fatty Plaque Silt · Calcified Pipelines · Endothelial Canal'
  },

  // Respiratory
  {
    id: 'sketch_resp_1', num: '3.1', title: 'COPD, Emphysema & Chronic Bronchitis',
    theme: 'industrial', sky1: '#075985', sky2: '#0284c7', ground: '#0c4a6e', accent: '#bae6fd',
    sceneTitle: 'Smoky Valley Mine Tunnels', subtitle: 'Alveolar Gas Domes · Goblet Smoke Stacks · Air-Trapping Bellows'
  },
  {
    id: 'sketch_resp_2', num: '3.2', title: 'Asthma & Hypersensitivity',
    theme: 'garden', sky1: '#0f766e', sky2: '#0d9488', ground: '#134e4a', accent: '#99f6e4',
    sceneTitle: 'The Pollen Storm Greenhouse', subtitle: 'Mast Cell Spores · Smooth Muscle Vines · Eosinophil Thorns'
  },
  {
    id: 'sketch_resp_3', num: '3.3', title: 'Pneumonia & Lung Infections',
    theme: 'harbor', sky1: '#374151', sky2: '#4b5563', ground: '#1f2937', accent: '#e5e7eb',
    sceneTitle: 'Foggy Infiltration Harbor', subtitle: 'Consolidation Barges · Exudate Fog · Sputum Docks'
  },

  // GI
  {
    id: 'sketch_gi_1', num: '4.1', title: 'GERD, Barrett Esophagus & Adenocarcinoma',
    theme: 'acid_river', sky1: '#3f6212', sky2: '#65a30d', ground: '#1a2e05', accent: '#d9f99d',
    sceneTitle: 'Acid River Gorge', subtitle: 'Gastric Acid Geysers · Metaplasia Bridge · Glandular Citadel'
  },
  {
    id: 'sketch_gi_2', num: '4.2', title: 'Peptic Ulcer Disease & Gastritis',
    theme: 'cavern', sky1: '#713f12', sky2: '#a16207', ground: '#422006', accent: '#fef08a',
    sceneTitle: 'The Mucosal Crater Cavern', subtitle: 'H. pylori Flagella Drillers · Bicarbonate Shields · Bleeding Artery Sump'
  },
  {
    id: 'sketch_gi_3', num: '4.3', title: 'IBD: Crohn Disease & Ulcerative Colitis',
    theme: 'bridge', sky1: '#7c2d12', sky2: '#c2410c', ground: '#431407', accent: '#fed7aa',
    sceneTitle: 'The Cobblestone Causeway', subtitle: 'Transmural Skip Chasms · Pseudopolyp Towers · Continuous Mucosal Road'
  },

  // Renal
  {
    id: 'sketch_ren_1', num: '5.1', title: 'Membranous & Minimal Change Disease',
    theme: 'filtration', sky1: '#0e7490', sky2: '#06b6d4', ground: '#164e63', accent: '#a5f3fc',
    sceneTitle: 'The Glomerular Reservoir & Dam', subtitle: 'Podocyte Sieve Netting · Spike & Dome Masonry · Protein Sluice'
  },
  {
    id: 'sketch_ren_2', num: '5.2', title: 'Acute Kidney Injury & Tubulointerstitial Diseases',
    theme: 'quarry', sky1: '#155e75', sky2: '#0891b2', ground: '#083344', accent: '#cffafe',
    sceneTitle: 'Tubular Drainage Quarry', subtitle: 'Ischemic Cast Chutes · Eosinophil Crystals · ATN Slag Heap'
  },

  // Neurology
  {
    id: 'sketch_neuro_1', num: '6.1', title: 'Alzheimer Disease & Frontotemporal Dementia',
    theme: 'maze', sky1: '#4c1d95', sky2: '#7c3aed', ground: '#2e1065', accent: '#ddd6fe',
    sceneTitle: 'The Labyrinth of Forgotten Scrolls', subtitle: 'Amyloid Plaque Boulders · Tau Tangle Vines · Atrophic Hall of Echoes'
  },
  {
    id: 'sketch_neuro_2', num: '6.2', title: 'Stroke & Transient Ischemic Attack (TIA)',
    theme: 'river_junction', sky1: '#1e1b4b', sky2: '#3730a3', ground: '#0f172a', accent: '#c7d2fe',
    sceneTitle: 'Cerebrovascular Confluence', subtitle: 'Circle of Willis Aqueduct · Penumbra Watershed · Thrombectomy Winch'
  },

  // MSK
  {
    id: 'sketch_msk_1', num: '7.1', title: 'Rheumatoid Arthritis vs Osteoarthritis',
    theme: 'artisan', sky1: '#78350f', sky2: '#b45309', ground: '#451a03', accent: '#fde68a',
    sceneTitle: 'The Articulated Clockwork Workshop', subtitle: 'Synovial Pannus Rust · Osteophyte Spurs · Heberden Gemstones'
  },

  // Endocrine
  {
    id: 'sketch_endo_1', num: '8.1', title: 'Thyroiditis & Thyroid Carcinomas',
    theme: 'volcanic_butterfly', sky1: '#854d0e', sky2: '#ca8a04', ground: '#422006', accent: '#fef08a',
    sceneTitle: 'Mount Butterfly Caldera', subtitle: 'Hurthle Cell Lava Furnaces · Orphan Annie Eyes Gem Vault · Calcitonin Bell'
  },
  {
    id: 'sketch_endo_2', num: '8.2', title: 'Diabetes Mellitus Type 1 & 2',
    theme: 'sugar_mill', sky1: '#6b21a8', sky2: '#a855f7', ground: '#3b0764', accent: '#f3e8ff',
    sceneTitle: 'The Imperial Sugar Refinery', subtitle: 'Beta Cell Smelting Pots · Insulin Delivery Flotilla · Amyloid Crystals'
  },

  // Reproductive
  {
    id: 'sketch_repro_1', num: '9.1', title: 'Seminoma vs Non-Seminomatous Germ Cell Tumors',
    theme: 'arena', sky1: '#831843', sky2: '#be185d', ground: '#4c0519', accent: '#fbcfe8',
    sceneTitle: 'The Gonadal Coliseum', subtitle: 'Fried Egg Banners · AFP & hCG Standard Poles · Schiller-Duval Glomeruloids'
  },

  // ===== SKETCHY MICRO =====
  {
    id: 'micro_staph_aureus', num: 'M1.1', title: 'Staphylococcus aureus (The Golden Staff of Moses)',
    theme: 'egypt', sky1: '#713f12', sky2: '#ca8a04', ground: '#422006', accent: '#fef08a',
    sceneTitle: 'Pharaoh Moses Camp & Scepter', subtitle: 'Golden Staff of Moses · Beta-Hemolytic Torches · Coagulase Cauldron'
  },
  {
    id: 'micro_strep_pneumo', num: 'M1.2', title: 'Streptococcus pneumoniae (The Alpha Knight Tournament)',
    theme: 'tournament', sky1: '#065f46', sky2: '#059669', ground: '#022c22', accent: '#a7f3d0',
    sceneTitle: 'The Alpha Knight Tournament Grounds', subtitle: 'Lancet Diplococci Jousting Spears · Optochin Chin Armor · Bile Shield'
  },
  {
    id: 'micro_pseudo', num: 'M2.1', title: 'Pseudomonas aeruginosa (The Suited Mona Lisa)',
    theme: 'gallery', sky1: '#1e3a8a', sky2: '#2563eb', ground: '#0f172a', accent: '#bfdbfe',
    sceneTitle: 'The Pyocyanin Art Gallery', subtitle: 'Blue-Green Mona Lisa · Grape Candy Dispensary · Oxidase Ring Palette'
  },
  {
    id: 'micro_ecoli', num: 'M2.2', title: 'Escherichia coli (The Red Gram-Negative Bazaar)',
    theme: 'red_bazaar', sky1: '#991b1b', sky2: '#dc2626', ground: '#450a0a', accent: '#fecaca',
    sceneTitle: 'The Crimson Gram-Negative Bazaar', subtitle: 'Pink MacConkey Milk Carts · Fimbriae Ropes · Green Sheen Metal Forges'
  },
  {
    id: 'micro_tb', num: 'M3.1', title: 'Mycobacterium tuberculosis (The Caseous Cave)',
    theme: 'cave', sky1: '#78350f', sky2: '#b45309', ground: '#451a03', accent: '#fde68a',
    sceneTitle: 'The Caseous Cave Kingdom', subtitle: 'Acid-Fast Red Tassel Guns · Cord Factor Rope · Ghon Complex Pillars'
  },
  {
    id: 'micro_hiv', num: 'M4.1', title: 'HIV & Retroviruses (The CD4 Castle Siege)',
    theme: 'citadel_siege', sky1: '#7f1d1d', sky2: '#b91c1c', ground: '#450a0a', accent: '#fecaca',
    sceneTitle: 'The Helper T-Cell Citadel Siege', subtitle: 'gp120 Battering Ram · Reverse Transcriptase Scribes · Protease Cleavers'
  },
  {
    id: 'micro_influenza', num: 'M4.2', title: 'Influenza Virus (The Antigenic Winter Storm)',
    theme: 'winter', sky1: '#1e3a8a', sky2: '#3b82f6', ground: '#0f172a', accent: '#dbeafe',
    sceneTitle: 'The Antigenic Winter Glacier', subtitle: 'Hemagglutinin Spiked Anchors · Neuraminidase Scalpels · Drift Floes'
  },
  {
    id: 'micro_candida', num: 'M5.1', title: 'Candida albicans (The White Pseudohyphae Jungle)',
    theme: 'fungal_jungle', sky1: '#581c87', sky2: '#9333ea', ground: '#2e1065', accent: '#f3e8ff',
    sceneTitle: 'The White Pseudohyphae Canopy', subtitle: '37°C Germ Tube Bridges · Thrush Snowdrifts · Azole Drawbridge'
  },

  // ===== SKETCHY PHARM =====
  {
    id: 'pharm_penicillin', num: 'P1.1', title: 'Penicillins & Beta-Lactams',
    theme: 'alchemist', sky1: '#065f46', sky2: '#10b981', ground: '#022c22', accent: '#a7f3d0',
    sceneTitle: 'The Beta-Lactam Alchemical Forest', subtitle: 'Transpeptidase Lockpicks · Beta-Lactamase Pitfalls · PBP Cell Walls'
  },
  {
    id: 'pharm_heparin', num: 'P2.1', title: 'Heparin & Anticoagulants',
    theme: 'naval_fort', sky1: '#92400e', sky2: '#d97706', ground: '#451a03', accent: '#fde68a',
    sceneTitle: 'Antithrombin River Fort & Locks', subtitle: 'Heparin Multi-Chain Cables · Protamine Key · HIT Platelet Ambush'
  },
  {
    id: 'pharm_statins', num: 'P2.2', title: 'Statins (HMG-CoA Reductase Inhibitors)',
    theme: 'refinery', sky1: '#1e40af', sky2: '#3b82f6', ground: '#0f172a', accent: '#bfdbfe',
    sceneTitle: 'The Cholesterol Smelting Works', subtitle: 'HMG-CoA Reductase Conveyors · LDL Receptor Gates · Myopathy Alarms'
  },
  {
    id: 'pharm_ace', num: 'P2.3', title: 'ACE Inhibitors & Angiotensin Blockers',
    theme: 'aqueduct_tower', sky1: '#0e7490', sky2: '#06b6d4', ground: '#164e63', accent: '#a5f3fc',
    sceneTitle: 'The Angiotensin Water Tower', subtitle: 'ACE Enzyme Crusher · Bradykinin Cough Bell · Efferent Arteriolar Gate'
  },
  {
    id: 'pharm_ssri', num: 'P3.1', title: 'Antidepressants: SSRIs, SNRIs & TCAs',
    theme: 'synapse_city', sky1: '#6b21a8', sky2: '#a855f7', ground: '#3b0764', accent: '#f3e8ff',
    sceneTitle: 'Serotonin Synaptic Plaza', subtitle: '5-HT Reuptake Dams · Monoamine Rivers · Serotonin Syndrome Lightning'
  },
  {
    id: 'pharm_antiepileptic', num: 'P3.2', title: 'Antiepileptics: Phenytoin & Carbamazepine',
    theme: 'lightning_circus', sky1: '#0f766e', sky2: '#14b8a6', ground: '#134e4a', accent: '#99f6e4',
    sceneTitle: 'The Voltage-Gated Lightning Coliseum', subtitle: 'Sodium Channel Insulators · GABA Trampolines · Zero-Order Hourglasses'
  }
];

function generateSceneSVG(sketch, isThumb = false) {
  const W = isThumb ? 320 : 800;
  const H = isThumb ? 180 : 450;
  const scale = isThumb ? 0.4 : 1.0;

  // Render artistic background landscape with mountains, buildings, towers, and rivers
  const skyTop = sketch.sky1;
  const skyBottom = sketch.sky2;
  const groundColor = sketch.ground;
  const accent = sketch.accent;

  // Scene specific decorative elements
  const sceneElements = `
    <!-- Sky Gradient -->
    <rect width="${W}" height="${H}" fill="url(#skyGrad_${sketch.id}_${isThumb ? 't' : 'f'})"/>

    <!-- Distant Mountains / Citadel Silhouette -->
    <path d="M0,${H*0.65} Q${W*0.15},${H*0.3} ${W*0.3},${H*0.5} T${W*0.65},${H*0.4} T${W*0.9},${H*0.55} L${W},${H*0.6} L${W},${H} L0,${H} Z" fill="${rgba(groundColor, 0.45)}"/>
    <path d="M0,${H*0.72} Q${W*0.2},${H*0.5} ${W*0.45},${H*0.65} T${W*0.8},${H*0.58} L${W},${H*0.7} L${W},${H} L0,${H} Z" fill="${rgba(groundColor, 0.75)}"/>

    <!-- Midground Ground Terrain -->
    <rect y="${H*0.68}" width="${W}" height="${H*0.32}" fill="${groundColor}"/>

    <!-- Architectural Structures & Thematic Silhouettes -->
    <!-- Tower / Castle structure on the left -->
    <rect x="${W*0.06}" y="${H*0.35}" width="${W*0.14}" height="${H*0.35}" fill="${rgba('#000000', 0.35)}" rx="${4*scale}"/>
    <polygon points="${W*0.04},${H*0.35} ${W*0.13},${H*0.22} ${W*0.22},${H*0.35}" fill="${accent}" fill-opacity="0.85"/>
    <rect x="${W*0.09}" y="${H*0.48}" width="${W*0.06}" height="${H*0.12}" rx="${3*scale}" fill="${skyTop}"/>

    <!-- Central Pavilion / Archway -->
    <rect x="${W*0.32}" y="${H*0.42}" width="${W*0.36}" height="${H*0.32}" fill="${rgba('#000000', 0.28)}" rx="${6*scale}"/>
    <path d="M${W*0.42},${H*0.74} L${W*0.42},${H*0.52} Q${W*0.5},${H*0.44} ${W*0.58},${H*0.52} L${W*0.58},${H*0.74} Z" fill="${skyBottom}" fill-opacity="0.8"/>
    <polygon points="${W*0.3},${H*0.42} ${W*0.5},${H*0.3} ${W*0.7},${H*0.42}" fill="${accent}" fill-opacity="0.75"/>

    <!-- Right-side Outpost / Mill -->
    <rect x="${W*0.78}" y="${H*0.38}" width="${W*0.16}" height="${H*0.34}" fill="${rgba('#000000', 0.4)}" rx="${4*scale}"/>
    <polygon points="${W*0.76},${H*0.38} ${W*0.86},${H*0.26} ${W*0.96},${H*0.38}" fill="${accent}" fill-opacity="0.85"/>
    <circle cx="${W*0.86}" cy="${H*0.52}" r="${18*scale}" fill="none" stroke="${accent}" stroke-width="${3*scale}" stroke-dasharray="${6*scale},${4*scale}"/>

    <!-- Winding River / Pathway -->
    <path d="M${W*0.5},${H*0.74} Q${W*0.52},${H*0.82} ${W*0.45},${H*0.9} T${W*0.35},${H} L${W*0.65},${H} Q${W*0.6},${H*0.88} ${W*0.55},${H*0.74} Z" fill="${skyTop}" fill-opacity="0.6"/>

    <!-- Ambient atmosphere lights & glow -->
    <circle cx="${W*0.5}" cy="${H*0.3}" r="${40*scale}" fill="${accent}" fill-opacity="0.25"/>
    <circle cx="${W*0.13}" cy="${H*0.22}" r="${20*scale}" fill="${accent}" fill-opacity="0.3"/>
  `;

  // Draw scene banner overlay at bottom
  const bannerHeight = isThumb ? 46 : 64;
  const bannerY = H - bannerHeight;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skyGrad_${sketch.id}_${isThumb ? 't' : 'f'}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${skyTop}"/>
      <stop offset="100%" stop-color="${skyBottom}"/>
    </linearGradient>
  </defs>

  ${sceneElements}

  <!-- Top Left Scene Pill -->
  <rect x="${8*scale}" y="${8*scale}" width="${(isThumb ? 130 : 200)}" height="${(isThumb ? 18 : 26)}" rx="${(isThumb ? 9 : 13)}" fill="rgba(0,0,0,0.65)"/>
  <text x="${(isThumb ? 73 : 108)}" y="${(isThumb ? 20 : 25)}" text-anchor="middle" fill="${accent}" font-size="${(isThumb ? 8.5 : 11)}" font-weight="bold" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif">
    ${sketch.sceneTitle.toUpperCase()}
  </text>

  <!-- Top Right Number Badge -->
  <rect x="${W - (isThumb ? 44 : 56)}" y="${8*scale}" width="${(isThumb ? 36 : 48)}" height="${(isThumb ? 18 : 26)}" rx="${(isThumb ? 9 : 13)}" fill="rgba(0,0,0,0.65)" stroke="${accent}" stroke-width="1"/>
  <text x="${W - (isThumb ? 26 : 32)}" y="${(isThumb ? 20 : 25)}" text-anchor="middle" fill="#ffffff" font-size="${(isThumb ? 9 : 12)}" font-weight="900" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif">
    ${sketch.num}
  </text>

  <!-- Bottom Details Bar -->
  <rect x="0" y="${bannerY}" width="${W}" height="${bannerHeight}" fill="rgba(10, 6, 18, 0.88)"/>
  <line x1="0" y1="${bannerY}" x2="${W}" y2="${bannerY}" stroke="${accent}" stroke-opacity="0.3" stroke-width="1"/>

  <text x="${W/2}" y="${bannerY + (isThumb ? 18 : 26)}" text-anchor="middle" fill="#ffffff" font-size="${(isThumb ? 10.5 : 15)}" font-weight="800" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif">
    ${sketch.title.length > 44 ? sketch.title.substring(0, 42) + '...' : sketch.title}
  </text>
  <text x="${W/2}" y="${bannerY + (isThumb ? 32 : 46)}" text-anchor="middle" fill="${accent}" font-size="${(isThumb ? 8 : 10.5)}" font-weight="500" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif">
    ${sketch.subtitle}
  </text>
</svg>`;
}

let count = 0;
for (const sketch of sketches) {
  // Generate Canvas SVG
  const canvasSvg = generateSceneSVG(sketch, false);
  fs.writeFileSync(path.join(outputDir, `canvas_${sketch.id}.svg`), canvasSvg, 'utf8');

  // Generate Thumbnail SVG
  const thumbSvg = generateSceneSVG(sketch, true);
  fs.writeFileSync(path.join(outputDir, `thumb_${sketch.id}.svg`), thumbSvg, 'utf8');

  count++;
}

console.log(`✅ Successfully generated ${count * 2} clean W3C SVG assets (${count} canvases + ${count} thumbnails)`);
