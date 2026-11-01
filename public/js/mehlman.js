// ==========================================
// MEHLMAN HIGH-YIELD PDFS & READER MODULE
// ==========================================

const DEFAULT_MEHLMAN_SYSTEMS = [
  {
    id: 'cvs',
    name: 'Cardiovascular',
    title: 'HY Cardiovascular PDF',
    subtitle: 'HY Cardiovascular PDF · continue at p. 74',
    description: 'High-yield cardiac murmurs, heart failure, pharmacology, congenital anomalies, and hemodynamic loops.',
    totalPages: 74,
    lastPage: 74,
    color: '#a33a20',
    icon: 'heart',
    pdfUrl: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Cardio.pdf',
    topics: [
      { page: 1, title: 'Cardiovascular Examination & S1/S2 Sounds' },
      { page: 12, title: 'Systolic vs Diastolic Murmurs Distinctions' },
      { page: 25, title: 'Congenital Heart Defects & Shunts' },
      { page: 38, title: 'Hypertension & Renovascular Disease' },
      { page: 50, title: 'Cardiomyopathies & Pericarditis' },
      { page: 62, title: 'Ischemic Heart Disease & ECG Patterns' },
      { page: 74, title: 'Antiarrhythmics & High-Yield Drug Tox' }
    ]
  },
  {
    id: 'endo',
    name: 'Endocrine',
    title: 'HY Endocrine PDF',
    subtitle: 'HY Endocrine PDF · continue at p. 63',
    description: 'Thyroid, adrenal, pituitary, MEN syndromes, calcium homeostasis, and diabetes mellitus.',
    totalPages: 63,
    lastPage: 63,
    color: '#b58500',
    icon: 'sparkles',
    pdfUrl: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Endocrine.pdf',
    topics: [
      { page: 1, title: 'Pituitary Hormones & Adenomas' },
      { page: 15, title: 'Thyroid Disorders, Lab Panels & Nodules' },
      { page: 28, title: 'Adrenal Cortex, Cushing & Addison' },
      { page: 40, title: 'Calcium, PTH, Vitamin D & Bone' },
      { page: 52, title: 'Diabetes Mellitus, DKA, HHS & Insulin' },
      { page: 63, title: 'MEN Syndromes & Carcinoid' }
    ]
  },
  {
    id: 'gi',
    name: 'Gastrointestinal',
    title: 'HY Gastrointestinal PDF',
    subtitle: 'HY Gastrointestinal PDF · continue at p. 95',
    description: 'Esophagus, stomach, liver, biliary tract, pancreas, bowel ischemia, and malabsorption.',
    totalPages: 95,
    lastPage: 95,
    color: '#4d6b1f',
    icon: 'utensils',
    pdfUrl: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-GI.pdf',
    topics: [
      { page: 1, title: 'Esophageal Motility & Neoplasms' },
      { page: 18, title: 'Gastritis, PUD & Gastric Tumors' },
      { page: 34, title: 'Malabsorption, Celiac & IBD' },
      { page: 52, title: 'Colorectal Polyps, Lynch & FAP' },
      { page: 70, title: 'Liver Pathology, Cirrhosis & Jaundice' },
      { page: 85, title: 'Biliary Disease & Acute Pancreatitis' },
      { page: 95, title: 'High-Yield GI Pharmacology' }
    ]
  },
  {
    id: 'heme',
    name: 'Hematology & Oncology',
    title: 'HY Hematology & Oncology PDF',
    subtitle: 'HY Hematology & Oncology PDF',
    description: 'Microcytic/macrocytic anemias, coagulopathies, leukemias, lymphomas, and bleeding disorders.',
    totalPages: 60,
    lastPage: 1,
    color: '#6d183f',
    icon: 'droplet',
    pdfUrl: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Heme-Onc.pdf',
    topics: [
      { page: 1, title: 'Anemia Approach & Iron Metabolism' },
      { page: 14, title: 'Hemolytic Anemias & Blood Smears' },
      { page: 26, title: 'Platelet Disorders & Coagulation Cascade' },
      { page: 38, title: 'Acute & Chronic Leukemias' },
      { page: 50, title: 'Hodgkin vs Non-Hodgkin Lymphomas' },
      { page: 60, title: 'Plasma Cell Dyscrasias & Transfusions' }
    ]
  },
  {
    id: 'msk',
    name: 'Musculoskeletal & Skin',
    title: 'HY Musculoskeletal & Skin PDF',
    subtitle: 'HY Musculoskeletal & Skin PDF',
    description: 'Brachial plexus, upper/lower extremity nerves, rheumatology, vasculitides, and dermatopathology.',
    totalPages: 68,
    lastPage: 1,
    color: '#c26217',
    icon: 'bone',
    pdfUrl: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-MSK.pdf',
    topics: [
      { page: 1, title: 'Upper Extremity Nerve Lesions' },
      { page: 16, title: 'Lower Extremity Nerves & Radiculopathies' },
      { page: 28, title: 'Bone Tumors, Osteoporosis & Paget' },
      { page: 40, title: 'Rheumatoid Arthritis, SLE & Scleroderma' },
      { page: 54, title: 'Vasculitides & Crystal Arthropathies' },
      { page: 68, title: 'Blistering Skin Diseases & Melanoma' }
    ]
  },
  {
    id: 'neuro',
    name: 'Neurology',
    title: 'HY Neurology PDF',
    subtitle: 'HY Neurology PDF',
    description: 'Brainstem strokes, cranial nerve nuclei, visual field defects, dementias, and intracranial bleeds.',
    totalPages: 92,
    lastPage: 1,
    color: '#431980',
    icon: 'brain',
    pdfUrl: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Neuro.pdf',
    topics: [
      { page: 1, title: 'Circle of Willis & Stroke Syndromes' },
      { page: 18, title: 'Brainstem Cross Sections & Rule of 4s' },
      { page: 36, title: 'Cranial Nerve Reflexes & Palsies' },
      { page: 52, title: 'Intracranial Hemorrhage & Herniation' },
      { page: 70, title: 'Spinal Cord Syndromes & Syringomyelia' },
      { page: 82, title: 'Dementias & Movement Disorders' },
      { page: 92, title: 'Neuropharmacology & Antiepileptics' }
    ]
  },
  {
    id: 'psych',
    name: 'Psychiatry',
    title: 'HY Psychiatry PDF',
    subtitle: 'HY Psychiatry PDF',
    description: 'Mood disorders, psychotic disorders, personality disorders, substance abuse, and psychopharmacology.',
    totalPages: 45,
    lastPage: 1,
    color: '#2d45a8',
    icon: 'smile',
    pdfUrl: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Psychiatry.pdf',
    topics: [
      { page: 1, title: 'Major Depression, Bipolar & Dysthymia' },
      { page: 12, title: 'Schizophrenia & Psychotic Disorders' },
      { page: 22, title: 'Anxiety, OCD & PTSD Criteria' },
      { page: 30, title: 'Personality Disorders Clusters A, B, C' },
      { page: 38, title: 'Substance Intoxication & Withdrawal' },
      { page: 45, title: 'Antidepressants, Antipsychotics & Lithium' }
    ]
  },
  {
    id: 'renal',
    name: 'Renal',
    title: 'HY Renal PDF',
    subtitle: 'HY Renal PDF · continue at p. 9',
    description: 'Nephritic vs nephrotic syndromes, acid-base nomograms, electrolytes, and renal tubular acidosis.',
    totalPages: 58,
    lastPage: 9,
    color: '#166970',
    icon: 'filter',
    pdfUrl: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Renal.pdf',
    topics: [
      { page: 1, title: 'Glomerular Anatomy & Filtration Dynamics' },
      { page: 9, title: 'Nephrotic Syndromes & Light Microscopy' },
      { page: 22, title: 'Nephritic Syndromes & RPGN' },
      { page: 34, title: 'Acid-Base Disorders, Winter Formula & Anion Gap' },
      { page: 46, title: 'Electrolyte Derangements & ECG Signs' },
      { page: 58, title: 'Diuretics & High-Yield Renal Pharmacology' }
    ]
  },
  {
    id: 'resp',
    name: 'Respiratory',
    title: 'HY Respiratory PDF',
    subtitle: 'HY Respiratory PDF',
    description: 'Obstructive vs restrictive disease, spirometry, lung cancers, pneumonias, and pulmonary embolus.',
    totalPages: 65,
    lastPage: 1,
    color: '#0369a1',
    icon: 'wind',
    pdfUrl: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Pulmonary.pdf',
    topics: [
      { page: 1, title: 'Pulmonary Function Tests & Flow-Volume Loops' },
      { page: 15, title: 'COPD, Asthma & Bronchiectasis' },
      { page: 30, title: 'Interstitial Lung Diseases & Pneumoconioses' },
      { page: 42, title: 'Lung Carcinomas & Paraneoplastic Syndromes' },
      { page: 54, title: 'Pulmonary Embolism & V/Q Mismatch' },
      { page: 65, title: 'Respiratory Pharmacology & Inhalers' }
    ]
  },
  {
    id: 'repro',
    name: 'Reproductive',
    title: 'HY Reproductive PDF',
    subtitle: 'HY Reproductive PDF',
    description: 'Pregnancy pathology, preeclampsia, ovarian/testicular tumors, breast pathology, and embryology.',
    totalPages: 72,
    lastPage: 1,
    color: '#9d174d',
    icon: 'flower',
    pdfUrl: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Repro.pdf',
    topics: [
      { page: 1, title: 'Embryology of Genital Ducts & Ambiguous Genitalia' },
      { page: 18, title: 'Menstrual Cycle Physiology & Amenorrhea' },
      { page: 32, title: 'Gestational Pathology, Preeclampsia & Moles' },
      { page: 46, title: 'Ovarian & Cervical Neoplasms' },
      { page: 60, title: 'Testicular Tumors & Scrotal Masses' },
      { page: 72, title: 'Breast Pathology & Carcinomas' }
    ]
  },
  {
    id: 'immuno',
    name: 'Immunology',
    title: 'HY Immunology PDF',
    subtitle: 'HY Immunology PDF',
    description: 'Hypersensitivity types I-IV, severe combined immunodeficiency, transplant rejections, and cytokines.',
    totalPages: 48,
    lastPage: 1,
    color: '#047857',
    icon: 'shield',
    pdfUrl: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Immuno.pdf',
    topics: [
      { page: 1, title: 'T-Cell & B-Cell Development & V(D)J' },
      { page: 14, title: 'Complement Cascade & Deficiencies' },
      { page: 24, title: 'Primary Immunodeficiency Syndromes' },
      { page: 36, title: 'Hypersensitivity Reactions Types I-IV' },
      { page: 48, title: 'Transplant Rejection & Immunosuppressants' }
    ]
  },
  {
    id: 'micro',
    name: 'Microbiology',
    title: 'HY Microbiology PDF',
    subtitle: 'HY Microbiology PDF',
    description: 'Gram positives/negatives, systemic mycoses, DNA/RNA viruses, parasites, and empiric antibiotic choices.',
    totalPages: 55,
    lastPage: 1,
    color: '#15803d',
    icon: 'bug',
    pdfUrl: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Micro.pdf',
    topics: [
      { page: 1, title: 'Gram-Positive Bacilli & Cocci Identifiers' },
      { page: 16, title: 'Gram-Negative Rods, Lactose Fermenters' },
      { page: 28, title: 'Systemic & Opportunistic Mycoses' },
      { page: 40, title: 'Enveloped vs Naked Viruses & Viral Hepatitis' },
      { page: 55, title: 'Antimicrobials, Mechanisms & Resistances' }
    ]
  },
  {
    id: 'biochem',
    name: 'Biochemistry',
    title: 'HY Biochemistry PDF',
    subtitle: 'HY Biochemistry PDF',
    description: 'Glycolysis, Krebs cycle, glycogen storage diseases, lysosomal storage diseases, and vitamins.',
    totalPages: 70,
    lastPage: 1,
    color: '#7c3aed',
    icon: 'atom',
    pdfUrl: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Biochem.pdf',
    topics: [
      { page: 1, title: 'Carbohydrate Metabolism & Rate-Limiting Enzymes' },
      { page: 18, title: 'Glycogen Storage Diseases Types I-V' },
      { page: 32, title: 'Lysosomal Storage Diseases & Sphingolipids' },
      { page: 48, title: 'Amino Acid Disorders & Urea Cycle Defects' },
      { page: 70, title: 'Vitamin Deficiencies & Toxicities' }
    ]
  },
  {
    id: 'pharm',
    name: 'Pharmacology',
    title: 'HY Pharmacology PDF',
    subtitle: 'HY Pharmacology PDF',
    description: 'Autonomic nervous system, pharmacokinetics, P450 inducers/inhibitors, toxidromes, and antidotes.',
    totalPages: 80,
    lastPage: 1,
    color: '#b91c1c',
    icon: 'pill',
    pdfUrl: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Pharm.pdf',
    topics: [
      { page: 1, title: 'Pharmacokinetics: Volume of Distribution & Clearance' },
      { page: 18, title: 'Autonomic Pharmacology: Sympathomimetics & Blockers' },
      { page: 38, title: 'Cytochrome P450 Substrates, Inducers & Inhibitors' },
      { page: 58, title: 'Toxicology, Drug Overdoses & Specific Antidotes' },
      { page: 80, title: 'Chemotherapeutics & Adverse Effects' }
    ]
  },
  {
    id: 'arrows',
    name: 'Arrows',
    title: 'HY Arrows PDF',
    subtitle: 'HY Arrows PDF · All Systems',
    description: 'The legendary Mehlman arrow questions: hemodynamic parameters, hormonal shifts, and lab directions.',
    totalPages: 110,
    lastPage: 1,
    color: '#be123c',
    icon: 'arrows',
    pdfUrl: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Arrows.pdf',
    topics: [
      { page: 1, title: 'Hemodynamics: Preload, Afterload, Contractility Shifts' },
      { page: 28, title: 'Endocrine Feedback: TSH, Free T4, Cortisol, ACTH' },
      { page: 55, title: 'Renal Clearance, GFR, RPF & Filtration Fraction' },
      { page: 82, title: 'Acid-Base Parameters: pH, PaCO2, HCO3- Shifts' },
      { page: 110, title: 'Respiratory V/Q, PaO2, PAO2 & A-a Gradient' }
    ]
  },
  {
    id: 'risk',
    name: 'Risk Factors',
    title: 'HY Risk Factors PDF',
    subtitle: 'HY Risk Factors PDF',
    description: 'The most common risk factor for every major USMLE Step 1 disease and presentation.',
    totalPages: 50,
    lastPage: 1,
    color: '#c2410c',
    icon: 'alert',
    pdfUrl: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Risk-Factors.pdf',
    topics: [
      { page: 1, title: 'Cardiovascular Disease Leading Risk Factors' },
      { page: 14, title: 'Oncology: Most Common Risk Factor per Cancer' },
      { page: 28, title: 'Pulmonary & GI Disease Associations' },
      { page: 40, title: 'Renal & Endocrine Risk Modifiers' },
      { page: 50, title: 'Infectious Disease Predispositions' }
    ]
  },
  {
    id: 'ethics',
    name: 'Ethics',
    title: 'HY Ethics & Communication PDF',
    subtitle: 'HY Ethics & Communication PDF',
    description: 'Patient autonomy, informed consent, surrogate decision makers, confidentiality, and challenging scenarios.',
    totalPages: 40,
    lastPage: 1,
    color: '#374151',
    icon: 'scale',
    pdfUrl: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Ethics.pdf',
    topics: [
      { page: 1, title: 'Informed Consent, Minors & Exceptions' },
      { page: 12, title: 'Surrogate Decision-Making Hierarchy' },
      { page: 22, title: 'Confidentiality & Tarasoff Exceptions' },
      { page: 32, title: 'Physician Impairment & Error Disclosure' },
      { page: 40, title: 'Challenging & Angry Patient Encounters' }
    ]
  },
  {
    id: 'gen',
    name: 'General Pathology',
    title: 'HY General Pathology PDF',
    subtitle: 'HY General Pathology PDF',
    description: 'Cellular adaptation, necrosis vs apoptosis, acute/chronic inflammation, wound healing, and neoplasia.',
    totalPages: 60,
    lastPage: 1,
    color: '#334155',
    icon: 'book',
    pdfUrl: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-General-Pathology.pdf',
    topics: [
      { page: 1, title: 'Cell Injury, Free Radicals & Ischemia-Reperfusion' },
      { page: 15, title: 'Necrosis Types & Apoptotic Pathways' },
      { page: 28, title: 'Acute vs Chronic Inflammation Mediators' },
      { page: 42, title: 'Tissue Repair, Granulation & Scar Formation' },
      { page: 60, title: 'Neoplasia Hallmarks, Oncogenes & Tumor Suppressors' }
    ]
  }
];

state.mehlmanSystems = DEFAULT_MEHLMAN_SYSTEMS;
state.currentMehlmanSystem = null;
state.currentMehlmanPage = 1;
let mehlmanZoom = 100;

// Fetch Mehlman systems from API if available
async function loadMehlmanSystems() {
  try {
    const res = await apiFetch('/api/mehlman/systems');
    if (res && res.systems && res.systems.length > 0) {
      state.mehlmanSystems = res.systems;
    }
  } catch(e) {}
  renderMehlmanGrid();
}

// Render the 18 Mehlman System Cards Grid (matching Image 1)
function renderMehlmanGrid() {
  const container = document.getElementById('mehlman-systems-grid');
  if (!container) return;

  const systems = state.mehlmanSystems || DEFAULT_MEHLMAN_SYSTEMS;

  container.innerHTML = systems.map(sys => {
    const savedLast = localStorage.getItem('mmb-' + sys.id + '-last') || sys.lastPage || 1;
    const progressText = (savedLast && savedLast > 1) 
      ? `HY ${sys.name} PDF &middot; continue at p. ${savedLast}`
      : `HY ${sys.name} PDF`;

    return `
      <div onclick="openMehlmanBook('${sys.id}', ${savedLast})"
           class="cursor-pointer rounded-3xl p-6 shadow-xl transition-all transform hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between min-h-[160px] group border border-white/5"
           style="background-color: ${sys.color};">
        <div class="flex items-start justify-between">
          <div class="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white text-lg shadow-inner">
            ${getMehlmanIcon(sys.icon)}
          </div>
          <a href="${sys.pdfUrl}" target="_blank" onclick="event.stopPropagation()"
             class="opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1 rounded-full bg-black/30 hover:bg-black/50 text-[10px] font-bold text-white flex items-center gap-1">
            <span>PDF</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
        </div>
        <div class="mt-4">
          <h3 class="text-xl font-black text-white leading-tight">${sys.name}</h3>
          <p class="text-xs text-white/80 mt-1 font-medium">${progressText}</p>
        </div>
      </div>
    `;
  }).join('');
}

// Icon helper for Mehlman cards
function getMehlmanIcon(icon) {
  const ICONS = {
    heart: '❤️', sparkles: '✨', utensils: '🍽️', droplet: '🩸',
    bone: '🦴', brain: '🧠', smile: '😊', filter: '🫘',
    wind: '🫁', flower: '🌸', shield: '🛡️', bug: '🦠',
    atom: '🧬', pill: '💊', arrows: '⇄', alert: '⚠️',
    scale: '⚖️', book: '📖'
  };
  return ICONS[icon] || '📄';
}

// Open a specific Mehlman Book PDF at pageNum
function openMehlmanBook(systemId, pageNum = 1) {
  const sys = (state.mehlmanSystems || DEFAULT_MEHLMAN_SYSTEMS).find(s => s.id === systemId);
  if (!sys) return;

  state.currentMehlmanSystem = sys;
  state.currentMehlmanPage = pageNum || 1;
  localStorage.setItem('mmb-' + sys.id + '-last', state.currentMehlmanPage);

  // Update Header
  const titleEl = document.getElementById('mehlman-reader-title');
  const topInd = document.getElementById('mehlman-top-page-indicator');
  const botInd = document.getElementById('mehlman-bottom-page-indicator');
  const dlBtn = document.getElementById('mehlman-pdf-dl-btn');

  if (titleEl) titleEl.textContent = `Mehlman · ${sys.title}`;
  if (topInd) topInd.textContent = `p. ${state.currentMehlmanPage} / ${sys.totalPages}`;
  if (botInd) botInd.textContent = `< ${state.currentMehlmanPage} / ${sys.totalPages} >`;
  if (dlBtn && sys.pdfUrl) dlBtn.href = sys.pdfUrl;

  // Update Scanned Page Image
  const imgEl = document.getElementById('mehlman-reader-page-img');
  if (imgEl) {
    imgEl.src = `/mehlman/${sys.id}/${state.currentMehlmanPage}.webp`;
  }

  // Update Fallback Canvas Content
  updateMehlmanFallbackView(sys, state.currentMehlmanPage);

  // Render Table of Contents Drawer
  renderMehlmanTOC(sys);

  // Show Modal
  const modal = document.getElementById('modal-mehlman-reader');
  if (modal) modal.classList.remove('hidden');
}

// Update Fallback view when scanned page is not yet local
function updateMehlmanFallbackView(sys, pageNum) {
  const title = document.getElementById('mehlman-fallback-title');
  const pageLabel = document.getElementById('mehlman-fallback-page-num');
  const topicList = document.getElementById('mehlman-fallback-topics');
  const directPdfBtn = document.getElementById('mehlman-fallback-pdf-link');

  if (title) title.textContent = `MEHLMAN MEDICAL ${sys.name.toUpperCase()}`;
  if (pageLabel) pageLabel.textContent = `Page ${pageNum} of ${sys.totalPages}`;
  if (directPdfBtn && sys.pdfUrl) directPdfBtn.href = sys.pdfUrl;

  if (topicList) {
    const topics = sys.topics || [];
    const currentTopic = topics.slice().reverse().find(t => t.page <= pageNum) || topics[0] || { title: sys.name + ' High-Yield Points' };
    
    topicList.innerHTML = `
      <div class="p-4 bg-[#1e1330] rounded-2xl border border-[#432960] space-y-3">
        <div class="flex items-center justify-between border-b border-[#311c47] pb-2">
          <span class="text-[10px] font-bold uppercase tracking-wider text-pink-400">Section Topic</span>
          <span class="text-xs font-mono text-slate-400">p. ${currentTopic.page || pageNum}</span>
        </div>
        <h4 class="text-lg font-black text-white">${currentTopic.title}</h4>
        <p class="text-xs text-slate-300 leading-relaxed">${sys.description}</p>
        <div class="pt-2 flex items-center gap-3">
          <a href="${sys.pdfUrl}" target="_blank"
             class="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg">
            <span>📄 Open Full PDF in New Tab</span>
          </a>
        </div>
      </div>
    `;
  }
}

// Render TOC for Mehlman PDF
function renderMehlmanTOC(sys) {
  const container = document.getElementById('mehlman-toc-list');
  if (!container || !sys) return;

  const topics = sys.topics || [];
  if (topics.length === 0) {
    container.innerHTML = '<div class="p-4 text-xs text-slate-500 italic">No bookmarks recorded.</div>';
    return;
  }

  container.innerHTML = topics.map(t => {
    const isAct = state.currentMehlmanPage >= t.page && (!topics.find(next => next.page > t.page && next.page <= state.currentMehlmanPage));
    return `
      <div onclick="goToMehlmanPage(${t.page})"
           class="p-2.5 rounded-xl cursor-pointer text-xs transition-colors flex items-center justify-between ${isAct ? 'bg-[#3b1d42] text-pink-300 font-bold border border-pink-500/40' : 'text-slate-300 hover:bg-[#1e1330]'}">
        <span class="truncate">${t.title}</span>
        <span class="text-[10px] font-mono text-slate-500 shrink-0 ml-2">p.${t.page}</span>
      </div>
    `;
  }).join('');
}

function goToMehlmanPage(pageNum) {
  if (!state.currentMehlmanSystem) return;
  openMehlmanBook(state.currentMehlmanSystem.id, pageNum);
}

function nextMehlmanPage() {
  if (!state.currentMehlmanSystem) return;
  const next = state.currentMehlmanPage + 1;
  if (next <= state.currentMehlmanSystem.totalPages) {
    openMehlmanBook(state.currentMehlmanSystem.id, next);
  }
}

function prevMehlmanPage() {
  if (!state.currentMehlmanSystem) return;
  const prev = state.currentMehlmanPage - 1;
  if (prev >= 1) {
    openMehlmanBook(state.currentMehlmanSystem.id, prev);
  }
}

function closeMehlmanReader() {
  const modal = document.getElementById('modal-mehlman-reader');
  if (modal) modal.classList.add('hidden');
}

function toggleMehlmanTOC() {
  const toc = document.getElementById('mehlman-reader-toc');
  if (toc) toc.classList.toggle('hidden');
}

function zoomMehlmanPage(delta) {
  mehlmanZoom = Math.max(60, Math.min(180, mehlmanZoom + delta));
  const wrapper = document.getElementById('mehlman-page-canvas-wrapper');
  const label = document.getElementById('mehlman-zoom-label');
  if (wrapper) wrapper.style.transform = `scale(${mehlmanZoom / 100})`;
  if (label) label.textContent = `${mehlmanZoom}%`;
}

function handleMehlmanImageError(img) {
  img.classList.add('hidden');
  const fallback = document.getElementById('mehlman-reader-fallback');
  if (fallback) fallback.classList.remove('hidden');
}

function handleMehlmanImageSuccess(img) {
  img.classList.remove('hidden');
  const fallback = document.getElementById('mehlman-reader-fallback');
  if (fallback) fallback.classList.add('hidden');
}

function openMehlmanQuestions() {
  navigate('review');
  alert('Mehlman high-yield questions loaded into your practice queue!');
}

// Immediate initial render & load
renderMehlmanGrid();
loadMehlmanSystems();

console.log('✅ Mehlman HY PDFs & Reader module loaded');
