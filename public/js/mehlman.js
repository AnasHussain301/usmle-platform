// ==========================================
// MEHLMAN HIGH-YIELD PDFS & NATIVE IN-APP READER
// ==========================================

// Configure PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js';
}

const DEFAULT_MEHLMAN_SYSTEMS = [
  {
    id: 'cvs',
    name: 'Cardiovascular',
    title: 'HY Cardiovascular',
    description: 'High-yield cardiac murmurs, heart failure, pharmacology, congenital anomalies, and hemodynamic loops.',
    totalPages: 74,
    color: '#a33a20',
    icon: 'heart',
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
    title: 'HY Endocrine',
    description: 'Thyroid, adrenal, pituitary, MEN syndromes, calcium homeostasis, and diabetes mellitus.',
    totalPages: 63,
    color: '#b58500',
    icon: 'sparkles',
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
    title: 'HY Gastrointestinal',
    description: 'Esophageal motility, ulcers, malabsorption, inflammatory bowel, biliary cirrhosis, and hepatic failure.',
    totalPages: 95,
    color: '#3e6b21',
    icon: 'utensils',
    topics: [
      { page: 1, title: 'Esophageal Pathology & Achalasia' },
      { page: 18, title: 'Gastric Disorders & PUD' },
      { page: 36, title: 'Malabsorption & Celiac vs Tropical' },
      { page: 54, title: 'IBD: Crohn vs Ulcerative Colitis' },
      { page: 72, title: 'Liver, Bilirubin Metabolism & Jaundice' },
      { page: 95, title: 'Pancreatitis, Gallbladder & Bile Ducts' }
    ]
  },
  {
    id: 'heme',
    name: 'Hematology & Oncology',
    title: 'HY Hematology & Oncology',
    description: 'Micro/macro/normocytic anemias, bleeding disorders, coagulopathies, leukemias, and lymphomas.',
    totalPages: 60,
    color: '#6e1e3b',
    icon: 'droplet',
    topics: [
      { page: 1, title: 'Microcytic Anemias (Iron, Thal, Lead, Sidero)' },
      { page: 16, title: 'Normocytic & Hemolytic Anemias' },
      { page: 30, title: 'Platelet Disorders vs Coagulation Factor Deficiencies' },
      { page: 44, title: 'Acute & Chronic Leukemias' },
      { page: 60, title: 'Hodgkin & Non-Hodgkin Lymphomas' }
    ]
  },
  {
    id: 'msk',
    name: 'Musculoskeletal & Skin',
    title: 'HY Musculoskeletal & Skin',
    description: 'Upper/lower extremity nerve lesions, brachial plexus, rheumatology, vasculitis, and derm pathology.',
    totalPages: 88,
    color: '#8c4b1b',
    icon: 'bone',
    topics: [
      { page: 1, title: 'Upper Extremity Nerves & Brachial Plexus' },
      { page: 22, title: 'Lower Extremity Nerves & Gait Lesions' },
      { page: 40, title: 'Rheumatoid Arthritis, SLE & Scleroderma' },
      { page: 58, title: 'Vasculitides (Large, Medium, Small Vessel)' },
      { page: 74, title: 'Bone Tumors & Osteomalacia/Rickets' },
      { page: 88, title: 'Dermatology: Blistering Diseases & Skin Cancers' }
    ]
  },
  {
    id: 'neuro',
    name: 'Neurology',
    title: 'HY Neurology',
    description: 'Cranial nerves, stroke syndromes, visual field defects, spinal tracts, and neurodegenerative disorders.',
    totalPages: 84,
    color: '#461a6b',
    icon: 'brain',
    topics: [
      { page: 1, title: 'Cranial Nerves & Brainstem Rule of 4s' },
      { page: 20, title: 'Cerebral Circulation & Stroke Syndromes' },
      { page: 38, title: 'Visual Field Pathway Lesions' },
      { page: 55, title: 'Spinal Cord Syndromes (Brown-Séquard, Syringo)' },
      { page: 70, title: 'Parkinson, Huntington & Dementias' },
      { page: 84, title: 'Intracranial Hemorrhages & Herniation' }
    ]
  },
  {
    id: 'psych',
    name: 'Psychiatry',
    title: 'HY Psychiatry',
    description: 'Mood disorders, psychotic disorders, personality disorders, substance abuse, and psychopharm.',
    totalPages: 48,
    color: '#2b3a8c',
    icon: 'smile',
    topics: [
      { page: 1, title: 'Psychotic Disorders & Schizophrenia Timelines' },
      { page: 12, title: 'Depressive & Bipolar Disorders' },
      { page: 24, title: 'Personality Disorders (Clusters A, B, C)' },
      { page: 36, title: 'Somatic Symptom & Factitious Disorders' },
      { page: 48, title: 'Antipsychotics, Antidepressants & Lithium Toxicity' }
    ]
  },
  {
    id: 'renal',
    name: 'Renal',
    title: 'HY Renal',
    description: 'Nephritic vs nephrotic syndromes, tubular acidoses, electrolyte disorders, and acid-base disturbances.',
    totalPages: 76,
    color: '#1a545e',
    icon: 'filter',
    topics: [
      { page: 1, title: 'Nephritic vs Nephrotic Syndromes' },
      { page: 19, title: 'Glomerulonephritis Biopsy Findings' },
      { page: 35, title: 'Acid-Base Disturbances & Winter Formula' },
      { page: 50, title: 'Renal Tubular Acidoses (Types 1, 2, 4)' },
      { page: 62, title: 'Electrolyte Abnormalities (Na+, K+, Ca2+)' },
      { page: 76, title: 'Diuretics Mechanism & Toxicities' }
    ]
  },
  {
    id: 'resp',
    name: 'Pulmonary',
    title: 'HY Pulmonary',
    description: 'Obstructive vs restrictive PFTs, ARDS, pneumoconioses, lung cancers, and pulmonary emboli.',
    totalPages: 58,
    color: '#1a5873',
    icon: 'wind',
    topics: [
      { page: 1, title: 'PFT Interpretation (Obstructive vs Restrictive)' },
      { page: 15, title: 'Pneumonia & Atypical Pathogens' },
      { page: 30, title: 'Pneumoconioses (Asbestos, Silica, Berylliosis)' },
      { page: 44, title: 'Lung Carcinomas & Paraneoplastic Syndromes' },
      { page: 58, title: 'Pulmonary Embolism, V/Q Mismatch & A-a Gradient' }
    ]
  },
  {
    id: 'repro',
    name: 'Reproductive',
    title: 'HY Reproductive',
    description: 'Menstrual cycle, pregnancy complications, ovarian tumors, testicular masses, and teratogens.',
    totalPages: 68,
    color: '#8c1a4e',
    icon: 'flower',
    topics: [
      { page: 1, title: 'Embryology of Male & Female Genitalia' },
      { page: 18, title: 'Ovarian & Uterine Tumors' },
      { page: 34, title: 'PCOS, Endometriosis & Adenomyosis' },
      { page: 50, title: 'Testicular Tumors & Scrotal Masses' },
      { page: 68, title: 'Pregnancy Complications & Teratogens' }
    ]
  },
  {
    id: 'immuno',
    name: 'Immunology',
    title: 'HY Immunology',
    description: 'Hypersensitivities (Types I-IV), immunodeficiencies, transplant rejection, and HLA associations.',
    totalPages: 42,
    color: '#1a546e',
    icon: 'shield',
    topics: [
      { page: 1, title: 'T-Cell & B-Cell Activation & Complement Cascade' },
      { page: 14, title: 'Hypersensitivity Reactions (Types I, II, III, IV)' },
      { page: 28, title: 'Primary Immunodeficiencies (SCID, CGD, CVID, XLA)' },
      { page: 42, title: 'Transplant Rejection & Immunosuppressants' }
    ]
  },
  {
    id: 'micro',
    name: 'Microbiology',
    title: 'HY Microbiology',
    description: 'Gram positive/negative bacteria, viral taxonomy, mycology, and parasitology high-yield points.',
    totalPages: 52,
    color: '#215c2d',
    icon: 'bug',
    topics: [
      { page: 1, title: 'Gram-Positive Bacilli & Cocci' },
      { page: 15, title: 'Gram-Negative Rods & Enterics' },
      { page: 30, title: 'RNA & DNA Viruses High-Yield Points' },
      { page: 42, title: 'Dimorphic Fungi & Opportunists' },
      { page: 52, title: 'Parasites & Helminths' }
    ]
  },
  {
    id: 'biochem',
    name: 'Biochemistry',
    title: 'HY Biochemistry',
    description: 'Glycogen storage diseases, lysosomal storage diseases, inborn errors of metabolism, and vitamins.',
    totalPages: 56,
    color: '#73571a',
    icon: 'flask',
    topics: [
      { page: 1, title: 'Glycolysis, Gluconeogenesis & Rate-Limiting Enzymes' },
      { page: 16, title: 'Glycogen Storage Diseases (Von Gierke, Pompe, McArdle)' },
      { page: 30, title: 'Lysosomal Storage Diseases (Gaucher, Tay-Sachs, Niemann)' },
      { page: 44, title: 'Amino Acid Metabolism & Organic Acidemias' },
      { page: 56, title: 'Water- & Fat-Soluble Vitamin Deficiencies' }
    ]
  },
  {
    id: 'path',
    name: 'Pathology',
    title: 'HY Pathology',
    description: 'Cell injury, necrosis types, inflammation, amyloidosis, and neoplasia characteristics.',
    totalPages: 60,
    color: '#6b1a29',
    icon: 'microscope',
    topics: [
      { page: 1, title: 'Cell Injury, Apoptosis & Necrosis Types' },
      { page: 20, title: 'Acute vs Chronic Inflammation & Mediators' },
      { page: 42, title: 'Tissue Repair, Granulation & Scar Formation' },
      { page: 60, title: 'Neoplasia Hallmarks, Oncogenes & Tumor Suppressors' }
    ]
  },
  {
    id: 'ethics',
    name: 'Ethics & Communication',
    title: 'HY Ethics & Communication',
    description: 'Autonomy, informed consent, surrogate decision makers, patient confidentiality, and medical error disclosure.',
    totalPages: 40,
    color: '#344054',
    icon: 'scale',
    topics: [
      { page: 1, title: 'Ethical Principles: Autonomy, Beneficence, Nonmaleficence' },
      { page: 12, title: 'Informed Consent & Minors' },
      { page: 22, title: 'Surrogate Decision-Making & Advance Directives' },
      { page: 32, title: 'Confidentiality & Exceptions (Duty to Protect)' },
      { page: 40, title: 'Medical Errors & Difficult Patient Communication' }
    ]
  }
];

if (typeof state === 'undefined') {
  window.state = {};
}
state.mehlmanSystems = DEFAULT_MEHLMAN_SYSTEMS;
state.currentMehlmanSystem = null;
state.currentMehlmanPage = 1;
let mehlmanZoom = 100;

// PDF.js instance cache
let _mehlmanPdfDoc = null;
let _mehlmanPdfSysId = null;
let _mehlmanRenderTask = null;
let _mehlmanIsRendering = false;
const _mehlmanPendingPages = new Set();

// Render the 15 Mehlman System Cards Grid
function renderMehlmanGrid() {
  const container = document.getElementById('mehlman-systems-grid');
  if (!container) return;

  const systems = (state && state.mehlmanSystems) || DEFAULT_MEHLMAN_SYSTEMS;

  container.innerHTML = systems.map(sys => {
    const savedLast = parseInt(localStorage.getItem('mmb-' + sys.id + '-last') || 1, 10);
    const progressText = (savedLast && savedLast > 1) 
      ? `HY ${sys.name} &middot; continue at p. ${savedLast}`
      : `HY ${sys.name} &middot; ${sys.totalPages} pages`;

    return `
      <div onclick="openMehlmanBook('${sys.id}', ${savedLast})"
           class="cursor-pointer rounded-3xl p-6 shadow-xl transition-all transform hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between min-h-[160px] group border border-white/10 select-none"
           style="background-color: ${sys.color};">
        <div class="flex items-start justify-between">
          <div class="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white text-lg shadow-inner">
            ${getMehlmanIcon(sys.icon)}
          </div>
          <span class="px-2.5 py-1 rounded-full bg-black/30 text-[10px] font-bold text-white/90 uppercase tracking-wider">
            ${sys.totalPages}p
          </span>
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
    bone: '🦴', brain: '🧠', smile: '😊', filter: '🧪',
    wind: '🫁', flower: '🌸', shield: '🛡️', bug: '🪲',
    flask: '🧬', microscope: '🔬', scale: '⚖️'
  };
  return ICONS[icon] || '📖';
}

// ==========================================
// NATIVE PDF READER (PDF.JS CANVAS)
// ==========================================

function updateMehlmanHeaderIndicators() {
  const sys = state.currentMehlmanSystem;
  if (!sys) return;
  const curPage = state.currentMehlmanPage || 1;
  const total = (_mehlmanPdfDoc && _mehlmanPdfDoc.numPages) || sys.totalPages || 1;

  const titleEl = document.getElementById('mehlman-reader-title');
  if (titleEl) titleEl.textContent = `Mehlman · ${sys.title || sys.name}`;

  const topEl = document.getElementById('mehlman-top-page-indicator');
  if (topEl) topEl.textContent = `p. ${curPage} / ${total}`;

  const botEl = document.getElementById('mehlman-bottom-page-indicator');
  if (botEl) botEl.textContent = `${curPage} / ${total}`;

  const zoomEl = document.getElementById('mehlman-zoom-label');
  if (zoomEl) zoomEl.textContent = `${mehlmanZoom}%`;

  updateMehlmanScrubberUI();
}

function updateMehlmanScrubberUI() {
  const sys = state.currentMehlmanSystem;
  if (!sys) return;
  const max = (_mehlmanPdfDoc ? _mehlmanPdfDoc.numPages : sys.totalPages) || 1;
  const curr = state.currentMehlmanPage || 1;
  const pct = Math.max(0, Math.min(1, (curr - 1) / Math.max(1, max - 1)));

  const track = document.getElementById('mehlman-scrubber-track');
  const fill = document.getElementById('mehlman-scrubber-fill');
  const thumb = document.getElementById('mehlman-scrubber-thumb');
  const bubbleText = document.getElementById('mehlman-scrubber-bubble-text');

  if (fill) fill.style.height = `${Math.round(pct * 100)}%`;
  if (track && thumb) {
    const travel = track.clientHeight - thumb.clientHeight;
    thumb.style.top = `${Math.round(pct * travel)}px`;
  }
  if (bubbleText) bubbleText.textContent = `p. ${curr} / ${max}`;
}

let _isScrubbingMehlman = false;
let _scrubberThrottleTimer = null;
let _mehlmanPageObserver = null;
let _mehlmanStackReady = false;

function buildMehlmanPageStack() {
  const wrapper = document.getElementById('mehlman-page-canvas-wrapper');
  if (!wrapper || !_mehlmanPdfDoc) return;
  wrapper.innerHTML = '';
  wrapper.classList.remove('overflow-hidden');
  wrapper.classList.add('overflow-visible');
  _mehlmanStackReady = true;

  for (let pageNum = 1; pageNum <= _mehlmanPdfDoc.numPages; pageNum += 1) {
    const pageWrapper = document.createElement('div');
    pageWrapper.className = 'mehlman-pdf-page relative w-full flex justify-center my-3 first:mt-0 last:mb-0';
    pageWrapper.dataset.page = String(pageNum);
    pageWrapper.id = `mehlman-pdf-page-${pageNum}`;
    pageWrapper.style.width = 'min(880px, 100%)';
    pageWrapper.style.aspectRatio = '0.77';
    const canvas = document.createElement('canvas');
    canvas.className = 'mehlman-pdf-canvas max-w-full w-full h-auto rounded-xl shadow-2xl bg-white';
    canvas.dataset.page = String(pageNum);
    pageWrapper.appendChild(canvas);
    wrapper.appendChild(pageWrapper);
  }

  const scrollArea = document.getElementById('mehlman-scroll-area');
  if (_mehlmanPageObserver) _mehlmanPageObserver.disconnect();
  _mehlmanPageObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const pageNum = Number(entry.target.dataset.page);
      if (pageNum && pageNum !== state.currentMehlmanPage) {
        state.currentMehlmanPage = pageNum;
        updateMehlmanHeaderIndicators();
        updateMehlmanScrubberUI();
      }
      renderMehlmanPage(pageNum);
    }
  }, { root: scrollArea, rootMargin: '700px 0px', threshold: 0.1 });

  wrapper.querySelectorAll('.mehlman-pdf-page').forEach(page => _mehlmanPageObserver.observe(page));
}

function initMehlmanScrubber() {
  const track = document.getElementById('mehlman-scrubber-track');
  const thumb = document.getElementById('mehlman-scrubber-thumb');
  const bubble = document.getElementById('mehlman-scrubber-bubble');
  const bubbleText = document.getElementById('mehlman-scrubber-bubble-text');
  const scrollArea = document.getElementById('mehlman-scroll-area');

  if (!track || track._hasInitScrubber) return;
  track._hasInitScrubber = true;

  function handleScrub(clientY) {
    const sys = state.currentMehlmanSystem;
    if (!sys) return;
    const max = (_mehlmanPdfDoc ? _mehlmanPdfDoc.numPages : sys.totalPages) || 1;
    const rect = track.getBoundingClientRect();
    const offsetY = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const pct = offsetY / rect.height;
    const targetPage = Math.max(1, Math.min(max, Math.round(1 + pct * (max - 1))));

    if (bubble) bubble.classList.remove('hidden');
    if (bubbleText) bubbleText.textContent = `p. ${targetPage} / ${max}`;
    if (thumb) {
      const travel = rect.height - thumb.clientHeight;
      thumb.style.top = `${Math.round(pct * travel)}px`;
    }
    const fill = document.getElementById('mehlman-scrubber-fill');
    if (fill) fill.style.height = `${Math.round(pct * 100)}%`;

    if (!_scrubberThrottleTimer) {
      _scrubberThrottleTimer = setTimeout(() => {
        _scrubberThrottleTimer = null;
        if (targetPage !== state.currentMehlmanPage) {
          goToMehlmanPage(targetPage);
        }
      }, 100);
    }
  }

  // Mouse drag & click on vertical bar
  track.addEventListener('mousedown', (e) => {
    _isScrubbingMehlman = true;
    if (bubble) bubble.classList.remove('hidden');
    handleScrub(e.clientY);
  });

  window.addEventListener('mousemove', (e) => {
    if (_isScrubbingMehlman) {
      e.preventDefault();
      handleScrub(e.clientY);
    }
  });

  window.addEventListener('mouseup', () => {
    if (_isScrubbingMehlman) {
      _isScrubbingMehlman = false;
      setTimeout(() => {
        if (bubble && !_isScrubbingMehlman) bubble.classList.add('hidden');
      }, 800);
    }
  });

  // Touch drag for mobile
  track.addEventListener('touchstart', (e) => {
    _isScrubbingMehlman = true;
    if (bubble) bubble.classList.remove('hidden');
    if (e.touches && e.touches[0]) handleScrub(e.touches[0].clientY);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (_isScrubbingMehlman && e.touches && e.touches[0]) {
      handleScrub(e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    if (_isScrubbingMehlman) {
      _isScrubbingMehlman = false;
      setTimeout(() => {
        if (bubble && !_isScrubbingMehlman) bubble.classList.add('hidden');
      }, 800);
    }
  });

}

async function openMehlmanBook(systemId, pageNum = 1, options = {}) {
  const sys = (state.mehlmanSystems || DEFAULT_MEHLMAN_SYSTEMS).find(s => s.id === systemId);
  if (!sys) return;

  state.currentMehlmanSystem = sys;
  const p = Math.max(1, parseInt(pageNum, 10) || 1);
  state.currentMehlmanPage = p;

  // Open modal
  const modal = document.getElementById('modal-mehlman-reader');
  if (modal) modal.classList.remove('hidden');

  // Sync browser URL & history if not from popstate
  if (!options.fromPopState) {
    const targetHash = `#mehlman/${systemId}/${p}`;
    if (window.location.hash !== targetHash) {
      history.pushState({ modal: 'mehlman', systemId, page: p }, '', targetHash);
    }
  }

  initMehlmanScrubber();
  updateMehlmanHeaderIndicators();
  updateMehlmanScrubberUI();
  renderMehlmanTOC(sys);

  // If already loaded this document, jump straight to the page
  if (_mehlmanPdfDoc && _mehlmanPdfSysId === systemId) {
    if (!_mehlmanStackReady) buildMehlmanPageStack();
    goToMehlmanPage(state.currentMehlmanPage);
    return;
  }

  _mehlmanPendingPages.clear();

  // Cancel any active render task
  if (_mehlmanRenderTask) {
    try { _mehlmanRenderTask.cancel(); } catch(e) {}
    _mehlmanRenderTask = null;
  }

  const loadingEl = document.getElementById('mehlman-pdf-loading');
  if (loadingEl) loadingEl.classList.remove('hidden');

  const pdfUrl = '/pdf/' + sys.id + '.pdf';

  try {
    if (typeof pdfjsLib === 'undefined') {
      throw new Error('PDF.js library not ready');
    }
    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true
    });
    _mehlmanPdfDoc = await loadingTask.promise;
    _mehlmanPdfSysId = systemId;
    if (_mehlmanPdfDoc.numPages) {
      sys.totalPages = _mehlmanPdfDoc.numPages;
    }
    updateMehlmanHeaderIndicators();
    renderMehlmanTOC(sys);
    buildMehlmanPageStack();
    goToMehlmanPage(state.currentMehlmanPage);
  } catch (err) {
    console.error('PDF.js load error:', err);
    if (loadingEl) loadingEl.classList.add('hidden');
    showMehlmanFallback(sys, state.currentMehlmanPage);
  }
}

async function renderMehlmanPage(num) {
  if (!_mehlmanPdfDoc) return;

  // Let the active page finish, then render every requested visible page.
  if (_mehlmanIsRendering) {
    _mehlmanPendingPages.add(num);
    return;
  }

  _mehlmanIsRendering = true;
  state.currentMehlmanPage = num;
  if (state.currentMehlmanSystem) {
    localStorage.setItem('mmb-' + state.currentMehlmanSystem.id + '-last', num);
    if (typeof renderContinueReading === 'function') renderContinueReading();
  }

  const loadingEl = document.getElementById('mehlman-pdf-loading');
  if (loadingEl) loadingEl.classList.remove('hidden');

  try {
    const page = await _mehlmanPdfDoc.getPage(num);
    const canvas = _mehlmanStackReady
      ? document.querySelector(`.mehlman-pdf-canvas[data-page="${num}"]`)
      : document.getElementById('mehlman-pdf-canvas');
    if (!canvas) {
      _mehlmanIsRendering = false;
      return;
    }
    const ctx = canvas.getContext('2d', { alpha: false });

    // Device Pixel Ratio for sharp retina text rendering
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Calculate fit width based on screen width & zoom (fluid & responsive on all Android/mobile screens)
    const scrollContainer = document.getElementById('mehlman-scroll-area');
    const isMobile = window.innerWidth < 640;
    const padding = isMobile ? 16 : 40;
    const containerWidth = scrollContainer && scrollContainer.clientWidth > 50
      ? scrollContainer.clientWidth - padding
      : window.innerWidth - padding;
    const availWidth = Math.max(280, Math.min(containerWidth, 880));

    const baseViewport = page.getViewport({ scale: 1.0 });
    const targetWidth = availWidth * (mehlmanZoom / 100);
    const fitScale = targetWidth / baseViewport.width;

    const viewport = page.getViewport({ scale: fitScale });

    // Set physical pixel dimensions for high-DPI display
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);

    // Set CSS display dimensions: centered with margin auto
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.width = Math.floor(viewport.width) + 'px';
    canvas.style.height = Math.floor(viewport.height) + 'px';

    // Pass DPR transform directly to PDF.js via transform matrix.
    // Do NOT use ctx.save/restore around render — PDF.js manages canvas state internally.
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
      transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null,
    };

    _mehlmanRenderTask = page.render(renderContext);
    await _mehlmanRenderTask.promise;
    _mehlmanRenderTask = null;

    canvas.classList.remove('hidden');
    const fallback = document.getElementById('mehlman-reader-fallback');
    if (fallback) fallback.classList.add('hidden');
  } catch (err) {
    if (err && err.name !== 'RenderingCancelledException') {
      console.error('Error rendering Mehlman page:', err);
    }
  } finally {
    if (loadingEl) loadingEl.classList.add('hidden');
    _mehlmanIsRendering = false;

    if (_mehlmanPendingPages.size > 0) {
      const nextNum = _mehlmanPendingPages.values().next().value;
      _mehlmanPendingPages.delete(nextNum);
      renderMehlmanPage(nextNum);
    }
  }

  updateMehlmanHeaderIndicators();
  renderMehlmanTOC(state.currentMehlmanSystem);
}

function goToMehlmanPage(pageNum, options = {}) {
  const sys = state.currentMehlmanSystem;
  if (!sys) return;
  const max = (_mehlmanPdfDoc ? _mehlmanPdfDoc.numPages : sys.totalPages) || 999;
  const target = Math.max(1, Math.min(max, parseInt(pageNum, 10) || 1));
  renderMehlmanPage(target);

  // Update URL hash smoothly if not from popstate
  if (!options.fromPopState && window.location.hash.startsWith('#mehlman/')) {
    history.replaceState({ modal: 'mehlman', systemId: sys.id, page: target }, '', `#mehlman/${sys.id}/${target}`);
  }

  const scrollArea = document.getElementById('mehlman-scroll-area');
  const targetPage = document.getElementById(`mehlman-pdf-page-${target}`);
  if (scrollArea && targetPage) {
    targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  updateMehlmanScrubberUI();
}

function nextMehlmanPage() {
  if (!state.currentMehlmanSystem) return;
  goToMehlmanPage(state.currentMehlmanPage + 1);
}

function prevMehlmanPage() {
  if (!state.currentMehlmanSystem) return;
  goToMehlmanPage(state.currentMehlmanPage - 1);
}


function showMehlmanFallback(sys, pageNum) {
  const canvas = document.getElementById('mehlman-pdf-canvas');
  if (canvas) canvas.classList.add('hidden');
  const fallback = document.getElementById('mehlman-reader-fallback');
  if (fallback) fallback.classList.remove('hidden');
  const title = document.getElementById('mehlman-fallback-title');
  if (title) title.textContent = sys ? (sys.title || sys.name) : 'MEHLMAN MEDICAL';
  const page = document.getElementById('mehlman-fallback-page-num');
  if (page) page.textContent = 'Page ' + pageNum;
}

// Table of Contents Drawer
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

function closeMehlmanReader(options = {}) {
  const modal = document.getElementById('modal-mehlman-reader');
  if (modal) modal.classList.add('hidden');
  if (!options.fromPopState && window.location.hash.startsWith('#mehlman/')) {
    history.back();
  }
}

function toggleMehlmanTOC() {
  const toc = document.getElementById('mehlman-reader-toc');
  if (toc) toc.classList.toggle('hidden');
}

function zoomMehlmanPage(delta) {
  mehlmanZoom = Math.max(70, Math.min(180, mehlmanZoom + delta));
  const label = document.getElementById('mehlman-zoom-label');
  if (label) label.textContent = `${mehlmanZoom}%`;
  if (_mehlmanPdfDoc && state.currentMehlmanSystem) {
    goToMehlmanPage(state.currentMehlmanPage);
  }
}

// Keyboard shortcuts inside Mehlman Reader
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('modal-mehlman-reader');
  if (!modal || modal.classList.contains('hidden')) return;

  if (e.key === 'ArrowRight' || e.key === 'PageDown') {
    e.preventDefault();
    nextMehlmanPage();
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    e.preventDefault();
    prevMehlmanPage();
  } else if (e.key === 'Escape') {
    closeMehlmanReader();
  }
});

// Immediate initial render & load
renderMehlmanGrid();

console.log('📖 Mehlman Native In-App PDF Reader ready');
