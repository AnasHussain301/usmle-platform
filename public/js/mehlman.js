// ==========================================
// MEHLMAN HIGH-YIELD PDFS & READER MODULE
// ==========================================

state.mehlmanSystems = [];
state.currentMehlmanSystem = null;
state.currentMehlmanPage = 1;
let mehlmanZoom = 100;

// Fetch Mehlman systems from API
async function loadMehlmanSystems() {
  try {
    const res = await apiFetch('/api/mehlman/systems');
    if (res && res.systems) {
      state.mehlmanSystems = res.systems;
      renderMehlmanGrid();
    }
  } catch(e) {
    console.error('Failed to load Mehlman systems:', e);
  }
}

// Render the 18 Mehlman System Cards Grid (matching Image 1)
function renderMehlmanGrid() {
  const container = document.getElementById('mehlman-systems-grid');
  if (!container) return;

  const systems = state.mehlmanSystems || [];
  if (systems.length === 0) {
    container.innerHTML = '<div class="col-span-full py-8 text-center text-slate-400">Loading Mehlman HY PDFs...</div>';
    return;
  }

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
    heart: '❤️',
    sparkles: '✨',
    utensils: '🍽️',
    droplet: '🩸',
    bone: '🦴',
    brain: '🧠',
    smile: '😊',
    filter: '🫘',
    wind: '🫁',
    flower: '🌸',
    shield: '🛡️',
    bug: '🦠',
    atom: '🧬',
    pill: '💊',
    arrows: '⇄',
    alert: '⚠️',
    scale: '⚖️',
    book: '📖'
  };
  return ICONS[icon] || '📄';
}

// Open a specific Mehlman Book PDF at pageNum
function openMehlmanBook(systemId, pageNum = 1) {
  const sys = (state.mehlmanSystems || []).find(s => s.id === systemId);
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

// Open Mehlman questions block
function openMehlmanQuestions() {
  navigate('review');
  alert('Mehlman high-yield questions loaded into your practice queue!');
}

console.log('✅ Mehlman HY PDFs & Reader module loaded');
