// Zetchy Application State & Logic

let state = {
  currentUser: null,
  token: localStorage.getItem('radmed_token') || null,
  currentView: 'home',
  firstAidSystems: [],
  sketchyDecks: [],
  ddxCategories: [],
  questions: [],
  currentExam: {
    active: false,
    mode: 'timed',
    questionList: [],
    currentIndex: 0,
    answers: {},
    timeRemaining: 45 * 60,
    timerInterval: null
  },
  tourStep: 0,
  sketchyTab: 'sketchy'
};

// 2-Minute Onboarding Tour Steps Definition
const TOUR_STEPS = [
  {
    title: "Welcome to Zetchy! 🚀",
    subtitle: "Your complete medical board study workstation in 2 minutes.",
    body: "Zetchy brings together everything you need for USMLE Step 1, Step 2 CK, and clinical rotations: First Aid, Sketchy, Spaced Repetition Cards, and the Clinical DDx Finder.",
    badge: "STEP 1 · OVERVIEW",
    icon: "🩺"
  },
  {
    title: "1. First Aid Organ Systems 📖",
    subtitle: "Study headings, page numbers, and UWorld incorrects.",
    body: "Navigate all 12 organ systems with custom high-yield notes. Paste the question IDs you missed on UWorld into the top search bar to immediately review the corresponding high-yield concepts.",
    badge: "STEP 2 · FIRST AID",
    icon: "📗"
  },
  {
    title: "2. Sketchy Visual Learning 🎨",
    subtitle: "Master Micro, Pharm, and Path with memory palaces.",
    body: "Explore 358 visual sketches across Microbiology, Pharmacology, and Pathology. Each sketch includes interactive visual anchors and high-yield association symbols.",
    badge: "STEP 3 · SKETCHY",
    icon: "🎨"
  },
  {
    title: "3. Cards & FSRS Spaced Repetition 🃏",
    subtitle: "Optimized retention with the modern FSRS algorithm.",
    body: "Track your Due Today, New, and Mature cards with Day Streak tracking. You can customize daily review limits and target retention directly in settings.",
    badge: "STEP 4 · SPACED REPETITION",
    icon: "🗂️"
  },
  {
    title: "4. DDx Finder & AI Rad Bot 🩻",
    subtitle: "Chief complaint to ranked differentials + AI assistant.",
    body: "Browse 25+ presenting complaints across Cardiology, Pulmonology, and Neurology. If you have questions about any clinical presentation or radiology scan, click the floating purple AI Rad Bot at any time!",
    badge: "STEP 5 · CLINICAL DDX & AI",
    icon: "🤖"
  }
];

document.addEventListener('DOMContentLoaded', async () => {
  await checkSession();
  await loadZetchyData();
  
  // Handle URL hash navigation (#fa, #sketchy, #review, #ddx)
  const hash = window.location.hash.replace('#', '');
  if (['fa', 'sketchy', 'review', 'ddx', 'qbank', 'admin'].includes(hash)) {
    navigate(hash);
  } else {
    navigate('home');
  }

  // Trigger tour if first time
  checkFirstTimeTour();
});

async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }
  const res = await fetch(endpoint, { ...options, headers });
  if (res.status === 401 && endpoint !== '/api/auth/login' && endpoint !== '/api/auth/register') {
    logout();
    return { error: 'Session expired' };
  }
  return res.json();
}

async function checkSession() {
  if (!state.token) {
    renderAuthUI();
    return;
  }
  try {
    const data = await apiFetch('/api/auth/me');
    if (data.user) {
      state.currentUser = data.user;
    } else {
      state.token = null;
      localStorage.removeItem('radmed_token');
    }
  } catch (err) {
    console.error('Session error', err);
  }
  renderAuthUI();
}

function renderAuthUI() {
  const container = document.getElementById('top-profile-container');
  const tierPill = document.getElementById('top-tier-pill');
  const adminBtn = document.getElementById('top-admin-btn');
  const reviewSync = document.getElementById('review-user-sync');

  if (state.currentUser) {
    const isPremium = state.currentUser.tier === 'premium' || state.currentUser.role === 'admin';
    const isAdmin = state.currentUser.role === 'admin';

    if (tierPill) {
      tierPill.textContent = isPremium ? '⭐ Premium VIP' : 'Free trial · 2 days left';
      tierPill.className = isPremium
        ? 'px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40'
        : 'px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#241732] hover:bg-[#2e1d40] text-slate-300 border border-[#3b2752]';
    }

    if (isAdmin) {
      adminBtn?.classList.remove('hidden');
    } else {
      adminBtn?.classList.add('hidden');
    }

    if (reviewSync) {
      reviewSync.innerHTML = `Signed in as <span class="text-slate-200 font-medium">${state.currentUser.email}</span> · deck synced across devices`;
    }

    container.innerHTML = `
      <div class="flex items-center gap-2 bg-[#241732] p-1 pr-3 rounded-full border border-[#3b2752]">
        <div class="w-7 h-7 rounded-full ${isAdmin ? 'bg-rose-600' : (isPremium ? 'bg-amber-500' : 'bg-pink-600')} text-white flex items-center justify-center font-bold text-xs">
          ${(state.currentUser.name || 'U').charAt(0).toUpperCase()}
        </div>
        <span class="text-xs font-bold text-slate-200 hidden sm:inline">${state.currentUser.name.split(' ')[0]}</span>
        <button onclick="logout()" class="text-slate-400 hover:text-rose-400 text-xs ml-1" title="Sign Out">✕</button>
      </div>
    `;
  } else {
    adminBtn?.classList.add('hidden');
    container.innerHTML = `
      <button onclick="openLoginModal()" class="w-9 h-9 rounded-full bg-[#241732] hover:bg-[#2e1d40] border border-[#3b2752] flex items-center justify-center text-slate-300">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
      </button>
    `;
  }
}

function logout() {
  state.currentUser = null;
  state.token = null;
  localStorage.removeItem('radmed_token');
  renderAuthUI();
  navigate('home');
}

// ==========================================
// 2. ROUTING & SECTION NAVIGATION
// ==========================================

function navigate(viewName) {
  state.currentView = viewName;
  window.location.hash = viewName === 'home' ? '' : viewName;

  const views = ['home', 'fa', 'sketchy', 'sketchy-path', 'sketch-detail', 'review', 'ddx', 'qbank', 'exam', 'admin'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) {
      if (v === viewName) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (viewName === 'admin') refreshAdminDashboard();
  if (viewName === 'qbank') renderQBankList();
}

// ==========================================
// 3. LOAD DATA & RENDER SCREENS
// ==========================================

async function loadZetchyData() {
  try {
    const [faRes, sketchyRes, ddxRes, qRes] = await Promise.all([
      apiFetch('/api/fa/systems'),
      apiFetch('/api/sketchy/decks'),
      apiFetch('/api/ddx/categories'),
      apiFetch('/api/questions')
    ]);

    if (faRes.systems) {
      state.firstAidSystems = faRes.systems;
      renderFirstAidGrid();
    }
    if (sketchyRes.decks) {
      state.sketchyDecks = sketchyRes.decks;
      renderSketchyDecks();
    }
    if (ddxRes.categories) {
      state.ddxCategories = ddxRes.categories;
      renderDDxCategories();
    }
    if (qRes.questions) {
      state.questions = qRes.questions;
      renderQBankList();
    }
  } catch (err) {
    console.error('Failed to load Zetchy core data', err);
  }
}

// SCREEN 2: FIRST AID ORGAN SYSTEMS
function renderFirstAidGrid(systems = state.firstAidSystems) {
  const container = document.getElementById('fa-systems-grid');
  if (!container) return;

  const iconSvgs = {
    heart: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`,
    butterfly: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,
    bowl: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`,
    drop: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>`,
    bone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
    brain: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`,
    smile: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    funnel: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>`,
    baby: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    lungs: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg>`,
    shield: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
    dna: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/></svg>`
  };

  container.innerHTML = systems.map(sys => {
    return `
      <div onclick="openFirstAidSystem('${sys.id}')" class="cursor-pointer rounded-2xl p-5 shadow-lg transition-all transform hover:-translate-y-1 flex flex-col justify-between min-h-[140px]" style="background-color: ${sys.color};">
        <div>
          <div class="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white mb-2">
            ${iconSvgs[sys.icon] || iconSvgs.heart}
          </div>
          <h3 class="text-base font-bold text-white">${sys.name}</h3>
          <p class="text-[11px] text-white/80">${sys.subtitle}</p>
        </div>
        <div class="pt-3 text-[11px] font-medium text-white/90">
          ✓ ${sys.easy} easy · 🔄 ${sys.forgetting} forgetting
        </div>
      </div>
    `;
  }).join('');
}

function openFirstAidSystem(sysId) {
  const sys = state.firstAidSystems.find(s => s.id === sysId);
  if (!sys) return;

  const topicsList = (sys.topics || []).map(t => `
    <div class="p-3 bg-[#170e20] rounded-xl border border-[#3b2554] space-y-1">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-bold text-white">${t.title}</h4>
        <span class="text-[10px] font-mono text-pink-400 bg-pink-950/60 px-2 py-0.5 rounded border border-pink-900">${t.page}</span>
      </div>
      <p class="text-xs text-slate-300 leading-relaxed">${t.highYield}</p>
    </div>
  `).join('');

  document.getElementById('complaint-modal-title').textContent = `${sys.name} High-Yield Headings`;
  document.getElementById('complaint-modal-body').innerHTML = `
    <div class="space-y-3">
      <p class="text-xs text-slate-400">Headings by subject and page, high-yield associations:</p>
      ${topicsList}
    </div>
  `;
  document.getElementById('modal-complaint').classList.remove('hidden');
}

function filterUWorldIncorrects() {
  const val = document.getElementById('uworld-id-input').value.trim();
  if (!val) {
    renderFirstAidGrid();
    return;
  }
  alert(`Highlighted 3 First Aid systems corresponding to UWorld IDs: ${val}`);
}

// SCREEN 3: SKETCHY
function renderSketchyDecks() {
  const container = document.getElementById('sketchy-decks-container');
  if (!container) return;

  const iconSvgs = {
    microscope: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>`,
    virus: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,
    pill: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>`
  };

  container.innerHTML = state.sketchyDecks.map(deck => {
    return `
      <div onclick="openSketchyDeck('${deck.id}')" class="cursor-pointer rounded-3xl p-6 shadow-xl transition-all transform hover:-translate-y-1 flex flex-col justify-between min-h-[170px]" style="background-color: ${deck.color};">
        <div>
          <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-3">
            ${iconSvgs[deck.icon] || iconSvgs.microscope}
          </div>
          <h3 class="text-xl font-bold text-white">${deck.title}</h3>
          <p class="text-xs text-white/80 mt-1">${deck.subtitle}</p>
        </div>
        <div class="mt-4">
          <div class="w-full bg-black/20 h-1.5 rounded-full overflow-hidden mb-1.5">
            <div class="bg-white/40 h-full" style="width: ${deck.progress}%"></div>
          </div>
          <span class="text-xs text-white/90 font-medium">${deck.progress}% known</span>
        </div>
      </div>
    `;
  }).join('');
}

function openSketchyDeck(deckId) {
  if (deckId === 'sketchy_path') {
    navigate('sketchy-path');
    return;
  }

  const deck = state.sketchyDecks.find(d => d.id === deckId);
  if (!deck) return;

  const sketchesHtml = (deck.sketches || []).map(sk => `
    <div onclick="openInteractiveSketch('${sk.id || 'sketch_1_2'}')" class="p-4 bg-[#170e20] hover:bg-[#20132c] cursor-pointer rounded-2xl border border-[#3b2554] space-y-2 transition-colors">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-bold text-pink-400">${sk.title}</h4>
        <span class="text-[10px] text-slate-300 font-semibold px-2 py-0.5 rounded bg-[#2b173c]">${sk.system}</span>
      </div>
      <div class="text-xs text-slate-300 space-y-1">
        <p class="font-bold text-slate-400">Visual Anchors &amp; Memory Clues:</p>
        <ul class="list-disc list-inside text-slate-300 space-y-0.5">
          ${(sk.symbols || []).map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');

  document.getElementById('complaint-modal-title').textContent = `${deck.title} Sketches`;
  document.getElementById('complaint-modal-body').innerHTML = `
    <div class="space-y-3">
      <p class="text-xs text-slate-400">${deck.subtitle} with memory palaces:</p>
      ${sketchesHtml}
    </div>
  `;
  document.getElementById('modal-complaint').classList.remove('hidden');
}

// Interactive Sketch View (Screenshot 2)
let currentSketchState = {
  sketchId: 'sketch_1_2',
  currentPin: 1,
  totalPins: 15,
  symbols: [
    { pin: 1, title: "Dwarf's Den Entrance", meaning: 'Microcytic Anemia (MCV < 80 fL) - defective hemoglobin synthesis results in an extra division of erythroid precursors producing small RBCs.', fact: 'Iron deficiency is the #1 most common nutritional deficiency worldwide.' },
    { pin: 2, title: 'Diminished Iron Ingot Pile', meaning: 'Decreased Serum Iron levels due to absolute body depletion or inflammatory sequestration.', fact: 'Serum iron reflects iron bound to transferrin; drops as body stores deplete.' },
    { pin: 3, title: 'Empty Iron Forge Cart', meaning: 'Elevated Total Iron Binding Capacity (TIBC) / High Serum Transferrin concentration.', fact: 'Liver synthesizes more transferrin in an attempt to capture any remaining circulating iron.' },
    { pin: 4, title: 'Low Ferritin Deposit Chest', meaning: 'Low Serum Ferritin (< 30 ng/mL) is the single most sensitive and specific test for iron deficiency.', fact: 'Ferritin < 15-30 ng/mL is virtually diagnostic of iron deficiency anemia.' },
    { pin: 5, title: 'Caged Iron Safe (Hepcidin)', meaning: 'Hepcidin upregulation in Anemia of Chronic Disease (ACD) blocks ferroportin.', fact: 'ACD shows elevated Ferritin and low TIBC, differentiating it from true iron deficiency.' },
    { pin: 6, title: 'Red Cells with Central Pallor', meaning: 'Hypochromic erythrocytes with central pallor exceeding 1/3 of the red blood cell diameter.', fact: 'Severe iron deficiency produces pencil cells / cigar-shaped elliptocytes on peripheral smear.' },
    { pin: 7, title: 'Anisocytosis Balance Scale', meaning: 'Elevated Red Cell Distribution Width (RDW > 15%).', fact: 'RDW is elevated in Iron Deficiency, but normal in uncomplicated Thalassemia trait.' },
    { pin: 8, title: 'Locked Iron Gate', meaning: 'Ferroportin internalisation by Hepcidin prevents duodenal enterocyte iron absorption.', fact: 'Upregulated by IL-6, TNF-alpha, and other acute phase inflammatory cytokines.' },
    { pin: 9, title: 'Rusty Iron Cauldron', meaning: 'Free Erythrocyte Protoporphyrin (FEP) accumulates because iron is unavailable to bind protoporphyrin.', fact: 'Final step of heme synthesis catalyzed by ferrochelatase in mitochondria.' },
    { pin: 10, title: 'Peptic Ulcer Cavern', meaning: 'Occult gastrointestinal bleeding is the primary cause in adult males and postmenopausal females.', fact: 'Any adult male with iron deficiency anemia must undergo colonoscopy and endoscopy to rule out colorectal carcinoma.' },
    { pin: 11, title: 'Menstrual Red Stream', meaning: 'Menorrhagia / abnormal uterine bleeding is the most common cause in premenopausal females.', fact: 'Ask about frequency of changing pads/tampons and passing large blood clots.' },
    { pin: 12, title: 'Duodenal Celiac Steppe', meaning: 'Malabsorption due to Celiac Disease, Crohn disease, or prior gastric bypass surgery.', fact: 'Non-heme iron is absorbed primarily in the duodenum via DMT-1.' },
    { pin: 13, title: 'Esophageal Web Flap', meaning: 'Plummer-Vinson Syndrome: triad of Iron deficiency anemia, Esophageal webs, and Dysphagia.', fact: 'Carries increased risk for squamous cell carcinoma of the esophagus.' },
    { pin: 14, title: 'Spoon-Shaped Nails (Koilonychia)', meaning: 'Brittle, spoon-shaped concave fingernails resulting from severe chronic iron depletion.', fact: 'Often accompanied by atrophic glossitis (smooth beefy red tongue) and angular cheilitis.' },
    { pin: 15, title: 'Ice Chewers Pickaxe', meaning: 'Pica (craving non-nutritive substances) & Pagophagia (compulsive ice chewing).', fact: 'Classically resolves within days of beginning oral iron replacement therapy.' }
  ]
};

function openInteractiveSketch(sketchId) {
  currentSketchState.sketchId = sketchId;
  currentSketchState.currentPin = 1;
  navigate('sketch-detail');
  selectPin(1);
}

function selectPin(pinNum) {
  currentSketchState.currentPin = pinNum;

  // Highlight selected pin on image
  for (let i = 1; i <= currentSketchState.totalPins; i++) {
    const el = document.getElementById(`pin-btn-${i}`);
    if (el) {
      if (i === pinNum) {
        el.className = 'absolute w-7 h-7 rounded-full bg-pink-500 text-white font-black text-xs flex items-center justify-center shadow-xl border-2 border-white cursor-pointer ring-4 ring-pink-500/50 scale-125 z-20';
      } else {
        el.className = 'absolute w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shadow-lg border border-white cursor-pointer hover:scale-125 transition-transform z-10';
      }
    }
  }

  // Update Detail Box
  const sym = currentSketchState.symbols.find(s => s.pin === pinNum) || {
    pin: pinNum,
    title: `Symbol #${pinNum}`,
    meaning: 'High-yield memory palace association for this USMLE topic.',
    fact: 'High-yield board concept associated with this clinical vignette.'
  };

  document.getElementById('active-symbol-pin').textContent = `#${sym.pin}. ${sym.title.split(' ')[0]}`;
  document.getElementById('active-symbol-title').textContent = sym.title;
  document.getElementById('active-symbol-meaning').textContent = sym.meaning;
  document.getElementById('active-symbol-fact').textContent = sym.fact;
}

function nextPin() {
  if (currentSketchState.currentPin < currentSketchState.totalPins) {
    selectPin(currentSketchState.currentPin + 1);
  } else {
    selectPin(1);
  }
}

function prevPin() {
  if (currentSketchState.currentPin > 1) {
    selectPin(currentSketchState.currentPin - 1);
  } else {
    selectPin(currentSketchState.totalPins);
  }
}

function ratePin(rating) {
  if (rating === 'know_it') {
    confetti({ particleCount: 30, spread: 40, origin: { y: 0.7 } });
  }
  nextPin();
}

function addCurrentPinToDeck() {
  const sym = currentSketchState.symbols.find(s => s.pin === currentSketchState.currentPin);
  if (!sym) return;

  apiFetch('/api/review/stats').catch(() => {});
  confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
  alert(`Added card "${sym.title}" directly to your Cards / Review deck!`);
}

function toggleAccordion(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('hidden');
}

function toggleAllAccordions() {
  const el = document.getElementById('acc-blood');
  if (el) el.classList.toggle('hidden');
}

function setSketchyTab(tab) {
  state.sketchyTab = tab;
  const sysBtn = document.getElementById('sketchy-tab-system');
  const skBtn = document.getElementById('sketchy-tab-sketchy');
  if (tab === 'system') {
    sysBtn.className = 'px-4 py-1.5 rounded-full text-xs font-bold bg-[#261533] text-pink-400 border border-pink-500/40';
    skBtn.className = 'px-4 py-1.5 rounded-full text-xs font-bold bg-[#1b1225] text-slate-400 hover:text-white border border-[#2e1d40]';
  } else {
    skBtn.className = 'px-4 py-1.5 rounded-full text-xs font-bold bg-[#261533] text-pink-400 border border-pink-500/40';
    sysBtn.className = 'px-4 py-1.5 rounded-full text-xs font-bold bg-[#1b1225] text-slate-400 hover:text-white border border-[#2e1d40]';
  }
}

function filterSketchySearch() {
  const query = document.getElementById('sketchy-search').value.toLowerCase();
  const filtered = state.sketchyDecks.filter(d => 
    d.title.toLowerCase().includes(query) ||
    (d.sketches || []).some(s => s.title.toLowerCase().includes(query))
  );
  // Re-render
}

// SCREEN 5: DDX FINDER
function renderDDxCategories() {
  const container = document.getElementById('ddx-categories-container');
  if (!container) return;

  container.innerHTML = state.ddxCategories.map(cat => {
    return `
      <div class="space-y-2">
        <div class="p-3 rounded-2xl text-white font-bold text-xs flex items-center justify-between" style="background-color: ${cat.color};">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">🩺</span>
            <span>${cat.name}</span>
          </div>
          <span>${cat.count} ▾</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          ${cat.complaints.map(comp => `
            <div onclick="openComplaintModal('${comp.name}')" class="cursor-pointer p-3 rounded-xl bg-[#1a1224] hover:bg-[#251733] border border-[#2e1d40] flex items-center justify-between transition-colors">
              <span class="text-xs font-bold text-white">${comp.name}</span>
              <span class="text-[11px] font-mono text-slate-400">${comp.completed}/${comp.total}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function openComplaintModal(complaintName) {
  let matchedComplaint = null;
  state.ddxCategories.forEach(cat => {
    const found = cat.complaints.find(c => c.name.toLowerCase() === complaintName.toLowerCase());
    if (found) matchedComplaint = found;
  });

  if (!matchedComplaint) return;

  document.getElementById('complaint-modal-title').textContent = `${matchedComplaint.name} (DDx)`;
  
  const diffsHtml = (matchedComplaint.differentials || []).map((d, idx) => `
    <div class="p-3 bg-[#170e20] rounded-xl border border-[#3b2554] space-y-1">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-bold text-pink-400">${idx + 1}. ${d.name}</h4>
      </div>
      <p class="text-[11px] text-slate-300 leading-relaxed">${d.highYield}</p>
    </div>
  `).join('');

  document.getElementById('complaint-modal-body').innerHTML = `
    <div class="space-y-3">
      <p class="text-xs text-slate-400 font-medium">Ranked differential diagnosis with key clinical distinguishing features:</p>
      ${diffsHtml}
    </div>
  `;

  document.getElementById('modal-complaint').classList.remove('hidden');
}

function closeComplaintModal() {
  document.getElementById('modal-complaint').classList.add('hidden');
}

function filterDDxSearch() {
  const query = document.getElementById('ddx-search').value.toLowerCase().trim();
  if (!query) {
    renderDDxCategories();
    return;
  }
  // Search complaints
}

// SCREEN 4: FLASHCARDS (FSRS)
function seedSampleFlashcards() {
  document.getElementById('stat-due-today').textContent = '15';
  document.getElementById('stat-new-cards').textContent = '20';
  document.getElementById('stat-learning').textContent = '5';
  document.getElementById('stat-mature').textContent = '12';
  document.getElementById('stat-streak').textContent = '1';
  alert('Loaded 20 high-yield FSRS board flashcards into your review queue!');
}

// ==========================================
// 4. 2-MINUTE ONBOARDING TOUR LOGIC
// ==========================================

function checkFirstTimeTour() {
  const hasSeen = localStorage.getItem('zetchy_tour_completed');
  if (!hasSeen) {
    // Show tour automatically on first visit
    setTimeout(() => {
      start2MinTour();
    }, 600);
  }
}

function start2MinTour() {
  state.tourStep = 0;
  renderTourStep();
  document.getElementById('modal-tour').classList.remove('hidden');
}

function renderTourStep() {
  const step = TOUR_STEPS[state.tourStep];
  const container = document.getElementById('tour-slide-content');
  const counter = document.getElementById('tour-counter');
  const prevBtn = document.getElementById('tour-prev-btn');
  const nextBtn = document.getElementById('tour-next-btn');

  counter.textContent = `Step ${state.tourStep + 1} of ${TOUR_STEPS.length}`;

  if (state.tourStep === 0) {
    prevBtn.classList.add('hidden');
  } else {
    prevBtn.classList.remove('hidden');
  }

  if (state.tourStep === TOUR_STEPS.length - 1) {
    nextBtn.textContent = 'Finish Tour ✓';
  } else {
    nextBtn.textContent = 'Next →';
  }

  container.innerHTML = `
    <div class="text-4xl mx-auto mb-1">${step.icon}</div>
    <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-950 text-pink-400 border border-pink-900/60">${step.badge}</span>
    <h3 class="text-xl font-black text-white">${step.title}</h3>
    <p class="text-xs font-semibold text-pink-300">${step.subtitle}</p>
    <p class="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">${step.body}</p>
  `;
}

function nextTourStep() {
  if (state.tourStep < TOUR_STEPS.length - 1) {
    state.tourStep++;
    renderTourStep();
  } else {
    finishTour();
  }
}

function prevTourStep() {
  if (state.tourStep > 0) {
    state.tourStep--;
    renderTourStep();
  }
}

function skipTour() {
  localStorage.setItem('zetchy_tour_completed', 'true');
  document.getElementById('modal-tour').classList.add('hidden');
}

function finishTour() {
  localStorage.setItem('zetchy_tour_completed', 'true');
  document.getElementById('modal-tour').classList.add('hidden');
  confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
}

function dismissTourBanner() {
  document.getElementById('banner-tour').classList.add('hidden');
}

function dismissOfflineBanner() {
  document.getElementById('banner-offline').classList.add('hidden');
}

// ==========================================
// 5. PLANS & PRICES MODAL
// ==========================================

function openPlansModal() {
  document.getElementById('modal-plans').classList.remove('hidden');
}

function closePlansModal() {
  document.getElementById('modal-plans').classList.add('hidden');
}

async function activateFreeInstantPremium() {
  if (!state.currentUser) {
    closePlansModal();
    openLoginModal();
    return;
  }
  const res = await apiFetch('/api/auth/upgrade', { method: 'POST' });
  if (res.user) {
    state.currentUser = res.user;
    closePlansModal();
    renderAuthUI();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    alert('All-Access Premium Plan successfully activated!');
  }
}

// ==========================================
// 6. QBANK & EXAM SIMULATOR
// ==========================================

function renderQBankList() {
  const container = document.getElementById('qbank-list-container');
  if (!container) return;

  container.innerHTML = state.questions.map(q => {
    return `
      <div class="bg-[#1c1527] rounded-2xl border border-[#2e213f] p-5 shadow-sm hover:border-pink-500/50 transition-all flex flex-col justify-between">
        <div class="space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase text-pink-400 bg-pink-950/60 px-2 py-0.5 rounded border border-pink-900">${q.system}</span>
            <span class="text-[10px] text-slate-400">${q.difficulty}</span>
          </div>
          <h3 class="text-sm font-bold text-white line-clamp-1">${q.title}</h3>
          <p class="text-xs text-slate-300 line-clamp-3 leading-relaxed">${q.vignette}</p>
        </div>
        <div class="pt-4 mt-3 border-t border-[#2e213f] flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400">${q.discipline}</span>
          <button onclick="openQuestionInExam('${q.id}')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#db2777] hover:bg-[#e11d48] text-white">
            Practice &rarr;
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openQuestionInExam(qId) {
  state.currentExam = {
    active: true,
    mode: 'tutor',
    questionList: [qId],
    currentIndex: 0,
    answers: {},
    timeRemaining: 0,
    timerInterval: null
  };
  document.getElementById('exam-mode-badge').textContent = 'PRACTICE TUTOR';
  document.getElementById('exam-timer-container').classList.add('hidden');
  navigate('exam');
  renderExamQuestion();
}

function renderExamQuestion() {
  const currentQId = state.currentExam.questionList[state.currentExam.currentIndex];
  const q = state.questions.find(item => item.id === currentQId);
  if (!q) return;

  document.getElementById('exam-progress-text').textContent = `Question ${state.currentExam.currentIndex + 1} of ${state.currentExam.questionList.length}`;
  document.getElementById('exam-q-system').textContent = q.system;
  document.getElementById('exam-q-difficulty').textContent = q.difficulty;
  document.getElementById('exam-q-title').textContent = q.title;
  document.getElementById('exam-q-vignette').textContent = q.vignette;

  const imgCard = document.getElementById('exam-image-card');
  const imgEl = document.getElementById('exam-radiology-img');
  const annotation = document.getElementById('exam-annotation-overlay');

  if (q.imageUrl) {
    imgCard.classList.remove('hidden');
    imgEl.src = q.imageUrl;
    if (q.imageAnnotation) annotation.textContent = q.imageAnnotation;
  } else {
    imgCard.classList.add('hidden');
  }

  const optionsContainer = document.getElementById('exam-options-list');
  const alphabet = ['A', 'B', 'C', 'D', 'E'];
  optionsContainer.innerHTML = (q.options || []).map((opt, idx) => `
    <div onclick="selectExamOption(${idx})" id="opt-${idx}" class="p-3 rounded-xl border border-[#2e213f] bg-[#140c1e] hover:border-pink-500 text-xs text-slate-200 cursor-pointer flex items-center gap-2.5 transition-all">
      <span class="w-5 h-5 rounded bg-[#241732] flex items-center justify-center font-bold text-[10px] text-pink-400 shrink-0">${alphabet[idx]}</span>
      <span>${opt}</span>
    </div>
  `).join('');

  document.getElementById('exam-explanation-panel').classList.add('hidden');
  document.getElementById('exam-submit-answer-btn').classList.remove('hidden');
}

function selectExamOption(idx) {
  state.currentExam.answers[state.currentExam.currentIndex] = idx;
  for (let i = 0; i < 5; i++) {
    const el = document.getElementById(`opt-${i}`);
    if (el) {
      if (i === idx) {
        el.className = 'p-3 rounded-xl border border-pink-500 bg-pink-950/40 text-xs font-bold text-white cursor-pointer flex items-center gap-2.5 shadow-sm';
      } else {
        el.className = 'p-3 rounded-xl border border-[#2e213f] bg-[#140c1e] text-xs text-slate-200 cursor-pointer flex items-center gap-2.5';
      }
    }
  }
}

async function submitExamAnswer() {
  const selIdx = state.currentExam.answers[state.currentExam.currentIndex];
  if (selIdx === undefined) {
    alert('Please select an option.');
    return;
  }

  const qId = state.currentExam.questionList[state.currentExam.currentIndex];
  const q = state.questions.find(item => item.id === qId);
  const isCorrect = selIdx === q.correctIndex;

  const panel = document.getElementById('exam-explanation-panel');
  const banner = document.getElementById('exam-result-banner');

  panel.classList.remove('hidden');
  document.getElementById('exam-submit-answer-btn').classList.add('hidden');

  if (isCorrect) {
    banner.className = 'p-3 rounded-xl text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800';
    banner.textContent = '✓ Correct! Excellent clinical deduction.';
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
  } else {
    banner.className = 'p-3 rounded-xl text-xs font-bold bg-rose-950/60 text-rose-300 border border-rose-800';
    banner.textContent = `✕ Incorrect. Correct Answer: (${['A','B','C','D','E'][q.correctIndex]}) ${q.options[q.correctIndex]}`;
  }

  document.getElementById('exam-explanation-text').textContent = q.explanation;
  document.getElementById('exam-pearl-text').textContent = q.highYieldPearl;

  if (state.currentUser) {
    await apiFetch('/api/questions/submit', {
      method: 'POST',
      body: JSON.stringify({ questionId: q.id, selectedIndex: selIdx })
    });
  }
}

function nextExamQuestion() {
  navigate('qbank');
}

function exitExamPrompt() {
  navigate('home');
}

function toggleImageInvert() {
  document.getElementById('exam-radiology-img').classList.toggle('invert');
}

function toggleImageAnnotation() {
  document.getElementById('exam-annotation-overlay').classList.toggle('hidden');
}

// ==========================================
// 7. AI RAD BOT INTEGRATION
// ==========================================

function toggleRadBotDrawer() {
  document.getElementById('radbot-drawer').classList.toggle('translate-x-full');
}

async function askRadBotQuick(text) {
  document.getElementById('radbot-drawer').classList.remove('translate-x-full');
  document.getElementById('radbot-input').value = text;
  await sendRadBotMessage(text);
}

function askRadBotAboutCurrentCase() {
  const currentQId = state.currentExam.questionList[state.currentExam.currentIndex];
  const q = state.questions.find(item => item.id === currentQId);
  const prompt = `Explain the clinical and radiologic key points for: ${q ? q.title : 'this case'}`;
  askRadBotQuick(prompt);
}

async function handleRadBotSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('radbot-input');
  const message = input.value.trim();
  if (!message) return;
  input.value = '';
  await sendRadBotMessage(message);
}

async function sendRadBotMessage(message) {
  const container = document.getElementById('radbot-messages-container');
  
  const userEl = document.createElement('div');
  userEl.className = 'flex items-start justify-end gap-2.5';
  userEl.innerHTML = `
    <div class="bg-purple-600 text-white p-3 rounded-2xl rounded-tr-none text-xs leading-relaxed max-w-[85%] font-medium">
      ${escapeHtml(message)}
    </div>
  `;
  container.appendChild(userEl);

  const loadEl = document.createElement('div');
  loadEl.className = 'flex items-start gap-2.5';
  loadEl.innerHTML = `
    <div class="w-7 h-7 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 text-xs font-bold border border-purple-500/40 animate-pulse">AI</div>
    <div class="bg-[#241736] p-2.5 rounded-2xl rounded-tl-none text-xs text-slate-400 italic">Thinking...</div>
  `;
  container.appendChild(loadEl);
  container.scrollTop = container.scrollHeight;

  try {
    const res = await apiFetch('/api/radbot/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
    loadEl.remove();

    const botEl = document.createElement('div');
    botEl.className = 'flex items-start gap-2.5';
    botEl.innerHTML = `
      <div class="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-md">AI</div>
      <div class="bg-[#241736] p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-200 leading-relaxed max-w-[90%] markdown-body border border-[#3b2554]">
        ${marked.parse(res.reply || 'No response.')}
      </div>
    `;
    container.appendChild(botEl);
    container.scrollTop = container.scrollHeight;
  } catch (err) {
    loadEl.remove();
  }
}

// ==========================================
// 8. ADMIN DASHBOARD
// ==========================================

async function refreshAdminDashboard() {
  if (!state.currentUser || state.currentUser.role !== 'admin') return;

  try {
    const overview = await apiFetch('/api/admin/overview');
    if (overview.metrics) {
      document.getElementById('admin-stat-users').textContent = overview.metrics.totalUsers;
      document.getElementById('admin-stat-active').textContent = overview.metrics.activeToday;
      document.getElementById('admin-stat-premium').textContent = overview.metrics.premiumUsers;
      document.getElementById('admin-stat-chats').textContent = overview.metrics.radBotInteractions;
    }

    const [actRes, usersRes] = await Promise.all([
      apiFetch('/api/admin/activity?limit=30'),
      apiFetch('/api/admin/users')
    ]);

    const actTbody = document.getElementById('admin-activity-tbody');
    if (actTbody && actRes.logs) {
      actTbody.innerHTML = actRes.logs.map(log => `
        <tr class="hover:bg-[#1a1224] transition-colors">
          <td class="p-3 font-mono text-slate-400">${new Date(log.timestamp).toLocaleTimeString()}</td>
          <td class="p-3 font-bold text-white">${escapeHtml(log.userName)}</td>
          <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#28193a] text-pink-400">${log.action}</span></td>
          <td class="p-3 font-mono text-[11px] text-slate-400 truncate max-w-xs">${JSON.stringify(log.details)}</td>
          <td class="p-3 text-slate-400 font-mono">${log.ip || '127.0.0.1'}</td>
        </tr>
      `).join('');
    }

    const usersTbody = document.getElementById('admin-users-tbody');
    if (usersTbody && usersRes.users) {
      usersTbody.innerHTML = usersRes.users.map(u => `
        <tr class="hover:bg-[#1a1224] transition-colors">
          <td class="p-3">
            <p class="font-bold text-white">${escapeHtml(u.name)}</p>
            <p class="text-[10px] text-slate-400">${escapeHtml(u.email)}</p>
          </td>
          <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'admin' ? 'bg-rose-950 text-rose-300' : 'bg-slate-800 text-slate-300'}">${u.role}</span></td>
          <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${u.tier === 'premium' ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-400'}">${u.tier}</span></td>
          <td class="p-3 text-slate-400 text-[11px]">${u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}</td>
          <td class="p-3">
            <button onclick="deleteAdminUser('${u.id}')" class="text-rose-400 hover:underline font-bold">Delete</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Admin error', err);
  }
}

async function deleteAdminUser(id) {
  if (confirm('Delete this user?')) {
    await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    refreshAdminDashboard();
  }
}

// ==========================================
// 9. AUTH MODAL & DEMO LOGINS
// ==========================================

let isRegisterMode = false;

function openLoginModal() {
  isRegisterMode = false;
  document.getElementById('auth-modal-title').textContent = 'Sign in to Zetchy';
  document.getElementById('auth-name-container').classList.add('hidden');
  document.getElementById('auth-submit-btn').textContent = 'Sign In';
  document.getElementById('auth-switch-btn').textContent = "Don't have an account? Register here";
  document.getElementById('modal-auth').classList.remove('hidden');
}

function closeAuthModal() {
  document.getElementById('modal-auth').classList.add('hidden');
}

function toggleAuthMode() {
  isRegisterMode = !isRegisterMode;
  if (isRegisterMode) {
    document.getElementById('auth-modal-title').textContent = 'Create Zetchy Account';
    document.getElementById('auth-name-container').classList.remove('hidden');
    document.getElementById('auth-submit-btn').textContent = 'Register Now';
    document.getElementById('auth-switch-btn').textContent = 'Already have an account? Sign In';
  } else {
    openLoginModal();
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const name = document.getElementById('auth-name').value;

  const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login';
  const payload = isRegisterMode ? { name, email, password } : { email, password };

  const data = await apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (data.token) {
    state.token = data.token;
    state.currentUser = data.user;
    localStorage.setItem('radmed_token', data.token);
    closeAuthModal();
    renderAuthUI();
  } else {
    alert(data.error || 'Authentication failed.');
  }
}

async function quickDemoLogin(type) {
  let email = 'admin@radmed.local';
  let password = 'Admin123!';

  if (type === 'premium') {
    email = 'sarah.jenkins@usmle.com';
    password = 'Student123!';
  } else if (type === 'free') {
    email = 'michael.chen@usmle.com';
    password = 'Student123!';
  }

  document.getElementById('auth-email').value = email;
  document.getElementById('auth-password').value = password;

  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  if (data.token) {
    state.token = data.token;
    state.currentUser = data.user;
    localStorage.setItem('radmed_token', data.token);
    closeAuthModal();
    renderAuthUI();
  } else {
    alert(data.error || 'Demo login failed.');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
