// ==========================================
// FIRST AID RIGHT PANEL: Images, Notes, Tables & UWorld Features
// ==========================================

if (!window.state) window.state = {};
if (!state.currentFaImagesList) state.currentFaImagesList = [];
if (!state.currentFaImageIndex) state.currentFaImageIndex = 0;
if (!state.currentFaPanelTopic) state.currentFaPanelTopic = null;
if (!state.expandedTopics) state.expandedTopics = {};

// Cache of page topics for callout lookups
window._faPageTopics = [];
window._currentFaNoteKey = null;
window._activeUWorldIds = [];

// ==========================================
// TOPIC FINDER HELPER ACROSS ALL SYSTEMS
// ==========================================
function findFaTopicForHeading(hSlug, headingTitle, pageNum) {
  const cleanSlug = (hSlug || '').toLowerCase().trim();
  const rawTitle = (headingTitle || '').replace(/^Open:\s*/i, '');
  const cleanTitle = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
  const systems = (window.state && window.state.firstAidSystems) || [];
  const currSys = (window.state && window.state.currentFaSystem);

  function matches(t) {
    if (!t) return false;
    const tId = (t.id || '').toLowerCase();
    const tSlug = (t.slug || '').toLowerCase();
    if (cleanSlug && (tId === cleanSlug || tSlug === cleanSlug)) return true;
    if (cleanTitle) {
      const tTitle = (t.title || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
      if (tTitle === cleanTitle) return true;
    }
    return false;
  }

  // 1. Search current system first (fastest and most accurate)
  if (currSys && currSys.topics) {
    for (const t of currSys.topics) {
      if (matches(t)) return t;
      for (const s of (t.subs || [])) {
        if (matches(s)) {
          return {
            ...s,
            parentTopic: t,
            images: s.images || [],
            tables: s.tables || [],
            sketch: s.sketch || t.sketch
          };
        }
      }
    }
  }

  // 2. Search all systems in firstAidSystems
  for (const sys of systems) {
    for (const t of (sys.topics || [])) {
      if (matches(t)) return t;
      for (const s of (t.subs || [])) {
        if (matches(s)) {
          return {
            ...s,
            parentTopic: t,
            images: s.images || [],
            tables: s.tables || [],
            sketch: s.sketch || t.sketch
          };
        }
      }
    }
  }

  // 3. Search window._faPageTopics
  if (window._faPageTopics && window._faPageTopics.length > 0) {
    for (const t of window._faPageTopics) {
      if (matches(t)) return t;
    }
  }

  // 4. Exact page match in current system fallback
  if (pageNum && currSys && currSys.topics) {
    const pageTopics = currSys.topics.filter(t => t.page === pageNum);
    if (pageTopics.length === 1) return pageTopics[0];
  }

  return null;
}
window.findFaTopicForHeading = findFaTopicForHeading;

async function ensureFaSystemsForImagePanel() {
  if (window.state && window.state.firstAidSystems && window.state.firstAidSystems.length > 0) {
    return;
  }
  const token = typeof window.synapseGetToken === 'function'
    ? window.synapseGetToken()
    : localStorage.getItem('synapse_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch('/api/fa/systems', { cache: 'no-store', headers });
  if (!response.ok) throw new Error(`First Aid systems request failed (${response.status})`);
  const data = await response.json();
  if (!Array.isArray(data.systems)) throw new Error('First Aid systems response is invalid');
  if (data.systems.length === 0) throw new Error('First Aid systems data is empty');
  window.state.firstAidSystems = data.systems;
}

// ==========================================
// OPEN RIGHT PANEL FOR A SPECIFIC HEADING
// ==========================================
async function openFaRightPanelForHeading(headingTitle, hSlug, pageNum, tab) {
  const rawTitle = (headingTitle || '').replace(/^Open:\s*/i, '');
  if (!findFaTopicForHeading(hSlug, rawTitle, pageNum)) {
    try {
      await ensureFaSystemsForImagePanel();
    } catch (error) {
      console.error('[First Aid Images] Failed to load topic data:', error);
    }
  }
  let topic = findFaTopicForHeading(hSlug, rawTitle, pageNum);

  if (!topic) {
    topic = {
      id: hSlug || rawTitle,
      title: rawTitle || 'Topic',
      page: pageNum,
      images: [],
      tables: []
    };
  }

  const targetTab = tab || 'img';
  openFaRightPanel(topic, targetTab);

  if (targetTab === 'notes') {
    const key = topic.id || topic.title || hSlug || rawTitle;
    loadFaHeadingNote(key);
    setTimeout(() => {
      const textarea = document.getElementById('fa-heading-note-input');
      if (textarea) textarea.focus();
    }, 120);
  } else if (targetTab === 'img') {
    renderFaImageCarousel();
  }
}
window.openFaRightPanelForHeading = openFaRightPanelForHeading;

// Open the (...) callout action menu for a heading on the book page by index or ref
function openFaTopicActions(topicRef) {
  let topic = null;
  if (typeof topicRef === 'number') {
    topic = (window._faPageTopics && window._faPageTopics[topicRef]) || (window.state && window.state.currentFaTopic);
  } else if (typeof topicRef === 'string') {
    topic = findFaTopicForHeading(topicRef, topicRef);
  } else if (typeof topicRef === 'object' && topicRef !== null) {
    topic = topicRef;
  }
  if (topic) openFaRightPanel(topic);
}
window.openFaTopicActions = openFaTopicActions;

// Open the right-hand split panel with data for a specific topic or subtopic
function openFaRightPanel(topic, defaultTab) {
  if (!topic) return;
  state.currentFaPanelTopic = topic;

  const panel = document.getElementById('fa-right-panel');
  if (!panel) return;
  panel.classList.remove('hidden');
  document.getElementById('modal-fa-book')?.classList.add('fa-panel-open');

  // Update heading title
  const titleEl = document.getElementById('fa-right-panel-heading-title');
  if (titleEl) titleEl.textContent = topic.title || 'Topic';

  const tables = getFaPanelTables(topic);
  const tabTables = document.getElementById('fa-panel-tab-tables');
  if (tabTables) {
    tabTables.classList.toggle('hidden', tables.length === 0);
    tabTables.setAttribute('aria-hidden', String(tables.length === 0));
    tabTables.tabIndex = tables.length === 0 ? -1 : 0;
  }

  // Keep the carousel scoped to the heading whose image icon was clicked.
  const images = [];
  const addImages = candidate => {
    if (!candidate) return;
    for (const image of (candidate.images || [])) {
      const imageId = Array.isArray(image) ? image[0] : image && image.id;
      if (imageId && !images.some(existing => existing[0] === imageId)) {
        images.push(Array.isArray(image) ? image : [imageId, image.caption || image.title || '']);
      }
    }
  };
  addImages(topic);
  if (images.length === 0 && topic.subs && topic.subs.length > 0) {
    topic.subs.forEach(addImages);
  }
  state.currentFaImagesList = images;
  state.currentFaImageIndex = 0;

  // Set carousel title
  const carTitle = document.getElementById('fa-img-carousel-title');
  if (carTitle) carTitle.textContent = topic.title || 'Images';

  // Default tab selection
  switchFaPanelTab(defaultTab || 'img');

  // Load notes
  loadFaHeadingNote(topic.id || topic.title);

  // Render tables
  renderFaPanelTables(tables);

  // Trigger gutter resize/re-alignment so markers stay perfectly placed
  setTimeout(() => {
    if (typeof renderFaPageCallouts === 'function') renderFaPageCallouts();
  }, 60);
}
window.openFaRightPanel = openFaRightPanel;

// Close right panel
function closeFaRightPanel() {
  const panel = document.getElementById('fa-right-panel');
  if (panel) panel.classList.add('hidden');
  document.getElementById('modal-fa-book')?.classList.remove('fa-panel-open');
  state.currentFaPanelTopic = null;
  setTimeout(() => {
    if (typeof renderFaPageCallouts === 'function') renderFaPageCallouts();
  }, 60);
}
window.closeFaRightPanel = closeFaRightPanel;

// Switch between images / notes / tables tabs
function switchFaPanelTab(tab) {
  const imgView = document.getElementById('fa-panel-view-img');
  const notesView = document.getElementById('fa-panel-view-notes');
  const tablesView = document.getElementById('fa-panel-view-tables');
  const tabImg = document.getElementById('fa-panel-tab-img');
  const tabNotes = document.getElementById('fa-panel-tab-notes');
  const tabTables = document.getElementById('fa-panel-tab-tables');
  const hasTables = getFaPanelTables(state.currentFaPanelTopic).length > 0;

  // Hide all views
  [imgView, notesView, tablesView].forEach(v => { if (v) v.classList.add('hidden'); });

  // Reset tab button styles
  [tabImg, tabNotes, tabTables].forEach(t => {
    if (t) {
      t.className = 'p-1.5 rounded-lg text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-all';
    }
  });
  if (tabTables && !hasTables) tabTables.classList.add('hidden');

  // Activate selected tab
  if (tab === 'img') {
    if (imgView) imgView.classList.remove('hidden');
    if (tabImg) tabImg.className = 'p-1.5 rounded-lg text-pink-400 bg-pink-950/60 border border-pink-900/60 flex items-center gap-1.5 text-xs font-bold transition-all';
    renderFaImageCarousel();
  } else if (tab === 'notes') {
    if (notesView) notesView.classList.remove('hidden');
    if (tabNotes) tabNotes.className = 'p-1.5 rounded-lg text-pink-400 bg-pink-950/60 border border-pink-900/60 flex items-center gap-1.5 text-xs font-bold transition-all';
  } else if (tab === 'tables' && getFaPanelTables(state.currentFaPanelTopic).length > 0) {
    if (tablesView) tablesView.classList.remove('hidden');
    if (tabTables) tabTables.className = 'p-1.5 rounded-lg text-pink-400 bg-pink-950/60 border border-pink-900/60 flex items-center gap-1.5 text-xs font-bold transition-all';
  } else if (tab === 'tables') {
    switchFaPanelTab('img');
  }
}
window.switchFaPanelTab = switchFaPanelTab;

document.addEventListener('click', event => {
  if (!(event.target instanceof Element)) return;
  const tabButton = event.target.closest('[data-fa-panel-tab]');
  if (tabButton) {
    switchFaPanelTab(tabButton.dataset.faPanelTab);
    return;
  }
  if (event.target.closest('[data-fa-panel-close]')) closeFaRightPanel();
});

// Render the current image in the carousel
function renderFaImageCarousel() {
  const imgs = state.currentFaImagesList || [];
  const idx = state.currentFaImageIndex || 0;
  const countEl = document.getElementById('fa-img-carousel-count');
  const mainImg = document.getElementById('fa-carousel-main-img');
  const captionEl = document.getElementById('fa-carousel-caption');

  if (imgs.length === 0) {
    if (countEl) countEl.textContent = '0 / 0';
    if (mainImg) {
      mainImg.style.display = 'none';
      mainImg.removeAttribute('src');
    }
    if (captionEl) {
      captionEl.innerHTML = '<div class="py-12 flex flex-col items-center justify-center text-slate-400 text-center"><div class="text-3xl mb-2 text-slate-500">🖼️</div><p class="text-xs font-medium">No UWorld diagrams attached to this heading.</p><p class="text-[11px] text-slate-500 mt-1">Check subtopics or neighboring headings in the left sidebar.</p></div>';
    }
    return;
  }

  const safeIdx = Math.max(0, Math.min(idx, imgs.length - 1));
  state.currentFaImageIndex = safeIdx;
  const item = imgs[safeIdx];
  const imgId = Array.isArray(item) ? item[0] : item && item.id;
  const caption = Array.isArray(item) ? (item[1] || '') : ((item && (item.caption || item.title)) || '');

  if (countEl) countEl.textContent = (safeIdx + 1) + ' / ' + imgs.length;
  if (mainImg) {
    mainImg.style.display = 'block';
    mainImg.classList.remove('hidden');
    mainImg.src = '/uw-img/' + imgId + '.webp';
    mainImg.onerror = function() {
      this.onerror = null;
      this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220"><rect width="400" height="220" fill="%231b1026" rx="12" stroke="%2338234f" stroke-width="2"/><text x="50%" y="38%" text-anchor="middle" fill="%23f43f5e" font-family="sans-serif" font-weight="bold" font-size="13">UWorld Medical Diagram [' + imgId + ']</text><text x="50%" y="54%" text-anchor="middle" fill="%23cbd5e1" font-family="sans-serif" font-size="11">' + encodeURIComponent(caption.slice(0, 45)) + '</text><text x="50%" y="74%" text-anchor="middle" fill="%23a855f7" font-family="sans-serif" font-size="10">Local diagram file</text></svg>';
    };
  }
  if (captionEl) captionEl.textContent = caption;
}
window.renderFaImageCarousel = renderFaImageCarousel;

// Navigate carousel
function nextFaCarouselImg() {
  const imgs = state.currentFaImagesList || [];
  if (imgs.length === 0) return;
  state.currentFaImageIndex = (state.currentFaImageIndex + 1) % imgs.length;
  renderFaImageCarousel();
}
window.nextFaCarouselImg = nextFaCarouselImg;

function prevFaCarouselImg() {
  const imgs = state.currentFaImagesList || [];
  if (imgs.length === 0) return;
  state.currentFaImageIndex = (state.currentFaImageIndex - 1 + imgs.length) % imgs.length;
  renderFaImageCarousel();
}
window.prevFaCarouselImg = prevFaCarouselImg;

// Render UWorld tables in the right panel
function getFaPanelTables(topic) {
  if (!topic) return [];
  const tables = [];
  const seen = new Set();
  const addTables = candidate => {
    for (const table of candidate || []) {
      if (!Array.isArray(table)) continue;
      const key = table[0] || `${table[1] || ''}:${tables.length}`;
      if (seen.has(key)) continue;
      seen.add(key);
      tables.push(table);
    }
  };
  addTables(topic.tables);
  (topic.subs || []).forEach(subtopic => addTables(subtopic.tables));
  return tables;
}

function renderFaPanelTables(tables) {
  const container = document.getElementById('fa-panel-tables-list');
  if (!container) return;

  if (tables.length === 0) {
    container.replaceChildren();
    return;
  }

  container.innerHTML = tables.map(function(tb) {
    return '<div class="bg-[#1a0f26] border border-[#38234f] rounded-xl p-4 overflow-x-auto shadow-lg">' +
      '<h4 class="text-xs font-bold text-sky-400 mb-2 flex items-center gap-1.5">' +
        '<span>📊</span> ' + (tb[1] || 'UWorld Table') +
      '</h4>' +
      '<div class="fa-uworld-table text-xs text-slate-200">' + (tb[2] || '') + '</div>' +
    '</div>';
  }).join('');
}
window.renderFaPanelTables = renderFaPanelTables;

// Save personal notes to localStorage
function saveFaCurrentHeadingNote() {
  var topic = state.currentFaPanelTopic;
  var key = window._currentFaNoteKey || (topic ? (topic.id || topic.title) : null);
  if (!key) return;
  var storageKey = 'fa_note_' + key;
  var textarea = document.getElementById('fa-heading-note-input');
  if (!textarea) return;
  localStorage.setItem(storageKey, textarea.value);

  var status = document.getElementById('fa-note-save-status');
  if (status) {
    status.classList.remove('hidden');
    clearTimeout(window._noteSaveTimer);
    window._noteSaveTimer = setTimeout(function() { status.classList.add('hidden'); }, 2000);
  }
}
window.saveFaCurrentHeadingNote = saveFaCurrentHeadingNote;

// Load notes from localStorage
function loadFaHeadingNote(topicId) {
  if (!topicId) return;
  window._currentFaNoteKey = topicId;
  var storageKey = 'fa_note_' + topicId;
  var textarea = document.getElementById('fa-heading-note-input');
  if (!textarea) return;
  textarea.value = localStorage.getItem(storageKey) || '';
}
window.loadFaHeadingNote = loadFaHeadingNote;

// ==========================================
// UWORLD QUESTION IDS MODAL & DATA
// ==========================================
window.EXPLICIT_UWORLD_MAPPINGS = {
  'mean-arterial-pressure': ['1622', '6691', '19567'],
  'upper-extremity-nerves': ['1888', '23777', '25357', '25371'],
  'axillary-c5-c6': ['1888', '23778'],
  'musculocutaneous-c5-c7': ['23775', '25352'],
  'radial-c5-t1': ['1884', '25344', '61401'],
  'median-c5-t1': ['23776', '25348', '11504'],
  'ulnar-c8-t1': ['24762', '73775'],
  'heart-morphogenesis': ['1432', '24559', '24560', '28480'],
  'cardiac-looping': ['1432', '24561'],
  'outflow-tract-formation': ['24559', '24560'],
  'valve-development': ['28480'],
  'septation-of-the-chambers': ['121627', '14174', '47448'],
  'atria': ['24561', '69454'],
  'antiarrhythmics-potassium-channel-blockers-class-iii': ['19567', '44857', '103415'],
  'antiarrhythmics-calcium-channel-blockers-class-iv': ['1622', '22614', '22774'],
  'cardiac-output-variables': ['1622', '6691', '19567'],
  'cardiac-output-equations': ['21495', '100218', '14003']
};

function getUWorldIdsForHeading(headingTitle, hSlug, pageNum) {
  const rawTitle = (headingTitle || '').replace(/^Open:\s*/i, '');
  const slug = (hSlug || rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')).toLowerCase();
  
  // 1. Explicit mapping match
  if (window.EXPLICIT_UWORLD_MAPPINGS && window.EXPLICIT_UWORLD_MAPPINGS[slug]) {
    return window.EXPLICIT_UWORLD_MAPPINGS[slug];
  }

  // 2. Check title against explicit mapping
  const titleSlug = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (window.EXPLICIT_UWORLD_MAPPINGS && window.EXPLICIT_UWORLD_MAPPINGS[titleSlug]) {
    return window.EXPLICIT_UWORLD_MAPPINGS[titleSlug];
  }

  // 3. Extract IDs from real topic images (which are keyed by UWorld ID)
  const topic = findFaTopicForHeading(slug, rawTitle, pageNum);
  if (topic && topic.images && topic.images.length > 0) {
    const rawIds = topic.images.map(img => String(img[0]).replace(/^[LU]/, '')).filter(Boolean);
    if (rawIds.length > 0) return [...new Set(rawIds)];
  }

  return [];
}
window.getUWorldIdsForHeading = getUWorldIdsForHeading;

function openUWorldIdsModal(headingTitle, hSlug, pageNum) {
  const rawTitle = (headingTitle || '').replace(/^Open:\s*/i, '');
  const ids = getUWorldIdsForHeading(rawTitle, hSlug, pageNum);
  const modal = document.getElementById('modal-uworld-ids');
  if (!modal) return;

  const headingEl = document.getElementById('uworld-modal-heading-title');
  const subEl = document.getElementById('uworld-modal-subtitle');
  const idsTextEl = document.getElementById('uworld-modal-ids-text');

  if (headingEl) headingEl.textContent = rawTitle || 'UWorld Questions';
  if (subEl) subEl.textContent = ids.length
    ? `${ids.length} question${ids.length === 1 ? '' : 's'} (Step 1)`
    : 'No verified question IDs are linked to this heading.';
  if (idsTextEl) idsTextEl.textContent = ids.length ? ids.join(', ') : 'No verified IDs available.';
  const copyButton = document.getElementById('uworld-modal-copy-btn');
  if (copyButton) copyButton.disabled = ids.length === 0;

  window._activeUWorldIds = ids;
  modal.classList.remove('hidden');
}
window.openUWorldIdsModal = openUWorldIdsModal;

function closeUWorldIdsModal() {
  const modal = document.getElementById('modal-uworld-ids');
  if (modal) modal.classList.add('hidden');
}
window.closeUWorldIdsModal = closeUWorldIdsModal;

function copyUWorldModalIds() {
  const ids = window._activeUWorldIds || [];
  if (ids.length === 0) return;
  const text = ids.join(', ');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (typeof showFaToast === 'function') showFaToast(`Copied ${ids.length} UWorld IDs to clipboard`);
      const btn = document.getElementById('uworld-modal-copy-btn');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<span class="text-white font-bold">✓ Copied!</span>';
        setTimeout(() => { btn.innerHTML = orig; }, 1800);
      }
    }).catch(() => {
      prompt('Copy these UWorld IDs:', text);
    });
  } else {
    prompt('Copy these UWorld IDs:', text);
  }
}
window.copyUWorldModalIds = copyUWorldModalIds;

// ==========================================
// SKETCHY NAVIGATION FROM HEADING (ICON 1)
// ==========================================
function openSketchFromFA(topicIdx, hSlug, headingTitle) {
  let title = (headingTitle || '').replace(/^Open:\s*/i, '');
  let slug = hSlug;

  if (!title && typeof topicIdx === 'number' && window._faPageTopics && window._faPageTopics[topicIdx]) {
    title = window._faPageTopics[topicIdx].title;
    slug = window._faPageTopics[topicIdx].id;
  }
  if (!title && state.currentFaPanelTopic) {
    title = state.currentFaPanelTopic.title;
    slug = state.currentFaPanelTopic.id;
  }
  if (!title) title = 'Topic';

  const topic = findFaTopicForHeading(slug, title);
  const targetSketchSlug = (topic && topic.sketch) ? topic.sketch : null;

  // Gather all sketches across Pathology, Micro, and Pharm
  const allSketches = [];
  if (state.sketchyPathData) {
    (state.sketchyPathData.systems || []).forEach(sys => {
      (sys.subcategories || []).forEach(sub => {
        (sub.sketches || []).forEach(sk => allSketches.push({ ...sk, source: 'path', systemName: sys.name }));
      });
    });
  }
  (state.sketchyDecks || []).forEach(deck => {
    (deck.sketches || []).forEach(sk => allSketches.push({ ...sk, source: deck.id, deckTitle: deck.name }));
  });

  let bestSketch = null;

  // 1. Direct match by topic.sketch tag (e.g. cardio-5-2 matches cardio-5-2-right-to-left-shunts)
  if (targetSketchSlug) {
    bestSketch = allSketches.find(sk => sk.id === targetSketchSlug || sk.id.startsWith(targetSketchSlug));
  }

  // 2. Exact match by slug
  if (!bestSketch && slug) {
    bestSketch = allSketches.find(sk => sk.id === slug || sk.id.includes(slug) || slug.includes(sk.id));
  }

  // 3. Semantic / keyword match
  if (!bestSketch && title) {
    const qClean = title.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
    const qWords = qClean.split(/\s+/).filter(w => w.length > 2 && !['and', 'the', 'with', 'for', 'from', 'class'].includes(w));
    let bestScore = 0;

    for (const sk of allSketches) {
      const skTitle = (sk.title || '').toLowerCase();
      const skClean = skTitle.replace(/[^a-z0-9 ]/g, ' ');
      let score = 0;
      if (skClean.includes(qClean) || qClean.includes(skClean)) score += 50;
      for (const w of qWords) {
        if (skClean.includes(w)) score += 15;
        if (sk.symbols && sk.symbols.some(sym => (sym.name || sym.title || '').toLowerCase().includes(w))) score += 8;
      }
      if (score > bestScore && score >= 15) {
        bestScore = score;
        bestSketch = sk;
      }
    }
  }

  // Hide First Aid book reader modal so sketch canvas is in full view
  const faModal = document.getElementById('modal-fa-book');
  if (faModal) faModal.classList.add('hidden');

  if (bestSketch) {
    if (typeof openInteractiveSketch === 'function') {
      openInteractiveSketch(bestSketch.id);
      if (typeof showFaToast === 'function') showFaToast('Opened Sketch: ' + (bestSketch.title || bestSketch.id));
    } else if (typeof openSketchDetail === 'function') {
      openSketchDetail(bestSketch.id);
    }
  } else {
    // Navigate to sketchy section
    if (typeof navigate === 'function') navigate('sketchy');
    if (typeof showFaToast === 'function') showFaToast('No direct sketch for "' + title + '" — opened Sketchy');
  }
}
window.openSketchFromFA = openSketchFromFA;

// ==========================================
// IN-PAGE CALLOUT OVERLAYS (...) on book page
// ==========================================
function renderFaPageCallouts() {
  var layer = document.getElementById('fa-page-callouts-layer');
  if (!layer) return;

  // ── JSON-DRIVEN PATH (fa_headings.js) ──────────────────────────────────────
  if (typeof renderFaGutterMarkers === 'function' &&
      window.FA_HEADINGS_DATA && Object.keys(window.FA_HEADINGS_DATA).length > 0) {
    var sys2 = state && state.currentFaSystem;
    var sectionName2 = sys2 ? (sys2.name || '') : '';
    var pageNum2 = (state && state.currentFaPage) || 284;
    var matchingTopics2 = window._faPageTopics || (sys2 ? (sys2.topics || []).filter(function(t) { return t.page === pageNum2; }) : []);
    renderFaGutterMarkers(sectionName2, pageNum2, matchingTopics2);
    return;
  }

  // ── LEGACY PATH (fallback when headings data not yet loaded) ───────────────
  var sys = state.currentFaSystem || (state.firstAidSystems || []).find(function(s) { return s.id === 'cvs'; });
  if (!sys) { layer.innerHTML = ''; return; }

  var pageNum = state.currentFaPage || 284;

  var matchingTopics = [];
  (sys.topics || []).forEach(function(t) {
    if (t.page === pageNum) {
      matchingTopics.push(t);
    }
    (t.subs || []).forEach(function(sub) {
      if (sub.page === pageNum && !matchingTopics.some(function(m) { return m.id === sub.id; })) {
        matchingTopics.push({
          id: sub.id,
          title: sub.title || sub.id,
          page: pageNum,
          images: t.images || [],
          tables: t.tables || [],
          parentTopic: t
        });
      }
    });
  });

  if (matchingTopics.length === 0) {
    var nearest = null;
    (sys.topics || []).forEach(function(t) {
      if (t.page <= pageNum && (!nearest || t.page > nearest.page)) {
        nearest = t;
      }
    });
    if (nearest) {
      matchingTopics.push(nearest);
    } else if (state.currentFaTopic) {
      matchingTopics.push(state.currentFaTopic);
    } else if ((sys.topics || []).length > 0) {
      matchingTopics.push(sys.topics[0]);
    }
  }

  window._faPageTopics = matchingTopics;

  var html = '';
  var totalTopics = matchingTopics.length;
  matchingTopics.forEach(function(topic, idx) {
    var topPct = 12;
    if (totalTopics === 1) {
      topPct = 12;
    } else if (totalTopics === 2) {
      topPct = idx === 0 ? 12 : 52;
    } else if (totalTopics === 3) {
      topPct = [12, 42, 70][idx] || 12;
    } else {
      var startPct = 14;
      var spanPct = 68;
      topPct = Math.round(startPct + (idx / Math.max(1, totalTopics - 1)) * spanPct);
    }

    var imgCount = (topic.images || []).length;
    var calloutId = 'callout-' + idx;
    var learnedClass = isHeadingLearned(topic.id || topic.title)
      ? 'bg-emerald-900/60 border-emerald-700/60 text-emerald-400'
      : 'bg-[#20152e] border-[#48286b] text-white';

    var qList = (typeof getQuestionsForTopic === 'function') ? getQuestionsForTopic(topic) : [];
    var qCount = qList.length || 0;
    var uwIds = getUWorldIdsForHeading(topic.title, topic.id, pageNum);
    var uwIdsCount = uwIds.length;

    html += '<div class="absolute pointer-events-auto flex items-center gap-1.5" style="top: ' + topPct + '%; left: 8px; z-index: 25; transform: translateY(-50%);">' +
      // Three Dots (...) Action Menu Button
      '<button onclick="toggleCalloutMenu(\'' + calloutId + '\')"' +
        ' class="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#1e102e]/95 hover:bg-[#3d2258] border border-[#6b3e94] flex items-center justify-center text-slate-200 hover:text-white transition-all shadow-md backdrop-blur-sm hover:scale-110 active:scale-95"' +
        ' title="' + escHtml(topic.title) + '">' +
        '<span class="text-[11px] sm:text-xs font-black leading-none select-none tracking-tighter">\u22EF</span>' +
      '</button>' +

      // Floating Callout Action Menu (5 round buttons matching modern popover)
      '<div id="' + calloutId + '" class="hidden absolute left-11 top-0 bg-[#160d21]/95 backdrop-blur-md border border-[#3b2352] rounded-3xl p-3.5 shadow-2xl min-w-[270px] z-30 text-left animate-in zoom-in-95">' +
        '<div class="text-xs font-bold text-white mb-2.5 truncate max-w-[240px]">' + escHtml(topic.title) + '</div>' +
        '<div class="flex items-center gap-2.5 justify-between">' +
          // 1. Play Sketch
          '<button onclick="openSketchFromFA(null, \'' + escAttr(topic.id) + '\', \'' + escAttr(topic.title) + '\')"' +
            ' class="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95" title="Play Sketch for ' + escHtml(topic.title) + '">' +
            '<svg class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' +
          '</button>' +

          // 2. Images (Image icon)
          '<button onclick="openFaRightPanelForHeading(\'' + escAttr(topic.title) + '\', \'' + escAttr(topic.id) + '\', ' + pageNum + ', \'img\');"' +
            ' class="relative w-10 h-10 rounded-full bg-[#1b2b45] hover:bg-[#23385a] border border-sky-500/40 text-sky-300 flex items-center justify-center shadow transition-transform hover:scale-105 active:scale-95" title="Images">' +
            '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>' +
            (imgCount > 0 ? '<span class="absolute -top-1 -right-1 bg-pink-600 text-[9px] font-black text-white rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow">' + imgCount + '</span>' : '') +
          '</button>' +

          // 3. TICK / CHECKMARK (UNCHANGED)
          '<button onclick="toggleCalloutMenu(\'' + calloutId + '\'); openWhichQuestionsModal(\'' + escAttr(topic.title) + '\');"' +
            ' class="relative w-10 h-10 rounded-full ' + learnedClass + ' hover:bg-[#2b1c3e] border border-[#5a3880] flex items-center justify-center text-emerald-400 transition-transform hover:scale-105 active:scale-95 shadow" title="Practice Questions (' + qCount + ')">' +
            '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>' +
            '<span class="absolute -top-1 -right-1 bg-pink-600 text-[9px] font-black text-white rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow">' + qCount + '</span>' +
          '</button>' +

          // 4. UWorld Question IDs (UW)
          '<button onclick="openUWorldIdsModal(\'' + escAttr(topic.title) + '\', \'' + escAttr(topic.id) + '\', ' + pageNum + ');"' +
            ' class="relative w-10 h-10 rounded-full bg-[#201c36] hover:bg-[#2c264a] border border-indigo-400/40 text-indigo-300 flex items-center justify-center shadow transition-transform hover:scale-105 active:scale-95" title="UWorld Question IDs">' +
            '<span class="text-[11px] font-black">UW</span>' +
            '<span class="absolute -top-1 -right-1 bg-pink-600 text-[9px] font-black text-white rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow">' + uwIdsCount + '</span>' +
          '</button>' +

          // 5. Notes
          '<button onclick="openFaRightPanelForHeading(\'' + escAttr(topic.title) + '\', \'' + escAttr(topic.id) + '\', ' + pageNum + ', \'notes\');"' +
            ' class="w-10 h-10 rounded-full bg-[#332b1b] hover:bg-[#453922] border border-amber-400/40 text-amber-300 flex items-center justify-center shadow transition-transform hover:scale-105 active:scale-95" title="Personal Notes">' +
            '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  });

  layer.innerHTML = html;
}

// Select a topic from the TOC
function selectFaTopic(topicId, pageNum) {
  var sys = state.currentFaSystem;
  if (!sys) return;
  var topic = (sys.topics || []).find(function(t) { return t.id === topicId; });
  if (!topic) return;

  state.currentFaSubtopic = null;
  if (!state.expandedTopics) state.expandedTopics = {};
  state.expandedTopics[topicId] = !state.expandedTopics[topicId];

  openFaBookPage(pageNum || topic.page, topic);
  openFaRightPanel(topic);
}

// Select a subheading from the TOC
function selectFaSubtopic(topicId, subId, pageNum) {
  var sys = state.currentFaSystem;
  if (!sys) return;
  var topic = (sys.topics || []).find(function(t) { return t.id === topicId; });
  if (!topic) return;
  var sub = (topic.subs || []).find(function(s) { return s.id === subId; }) || {
    id: subId,
    title: subId,
    page: pageNum,
    images: topic.images,
    tables: topic.tables
  };

  state.currentFaSubtopic = sub;
  openFaBookPage(pageNum || sub.page || topic.page, topic);
  openFaRightPanel(sub);
}

// HTML escaping helpers
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escAttr(str) {
  if (!str) return '';
  return String(str).replace(/'/g,"\\'").replace(/"/g,'&quot;');
}

// Toggle callout action menu
function toggleCalloutMenu(id) {
  var menu = document.getElementById(id);
  if (!menu) return;

  document.querySelectorAll('[id^="callout-"]').forEach(function(el) {
    if (el.id !== id) el.classList.add('hidden');
  });

  menu.classList.toggle('hidden');
}

// Check if heading is learned
function isHeadingLearned(headingId) {
  return localStorage.getItem('fa_learned_' + headingId) === '1';
}

// Toggle learned state
function markFaHeadingLearned(headingId, btn) {
  var key = 'fa_learned_' + headingId;
  var current = localStorage.getItem(key) === '1';
  localStorage.setItem(key, current ? '0' : '1');

  if (btn) {
    if (!current) {
      btn.classList.add('bg-emerald-900/60', 'border-emerald-700/60', 'text-emerald-400');
      btn.classList.remove('bg-slate-800/60', 'border-slate-600/50', 'text-slate-400');
    } else {
      btn.classList.remove('bg-emerald-900/60', 'border-emerald-700/60', 'text-emerald-400');
      btn.classList.add('bg-slate-800/60', 'border-slate-600/50', 'text-slate-400');
    }
  }
}

// Close callout menus when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('[id^="callout-"]') && !e.target.closest('button[onclick*="toggleCalloutMenu"]')) {
    document.querySelectorAll('[id^="callout-"]').forEach(function(el) { el.classList.add('hidden'); });
  }
});

console.log('✅ FA Right Panel (Images/Notes/Tables) + Callout Overlays loaded');
