/**
 * READER OPTIONS MODULE — Zetchy-exact Reader Options & Search
 * =============================================================
 * Implements:
 *   1. 🔍 Floating Pill Search Overlay (searches headings, page numbers, topics across all sections)
 *   2. ⋮ Options Drawer Menu (PAGES, DARK PAGE, Toggles, SHOW IN FIRST AID, BAR COLOUR, THEME, APPEARANCE)
 *   3. ☰ Table of Contents toggle
 *
 * Persisted in localStorage ('synapse_reader_prefs').
 * Applies across ALL book readers (First Aid, Mehlman HY, etc.).
 */
'use strict';

const READER_PREFS_KEY = 'synapse_reader_prefs';

const DEFAULT_PREFS = {
  pageMode:          'scroll',    // 'swipe' | 'scroll'
  darkPage:          'auto',      // 'auto' | 'on' | 'off'
  autoBlanks:        false,
  blurInQuestions:   false,
  mehlmanTags:       true,        // M badges beside headings
  listView:          false,
  showUWorldTables:  true,
  showUWorldImages:  true,
  showAnKing:        true,
  showMnemosyne:     true,
  showMehlman:       true,
  barColour:         'theme',     // 'theme' | 'navy' | 'black'
};

let _readerPrefs = { ...DEFAULT_PREFS };

function loadReaderPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(READER_PREFS_KEY) || '{}');
    _readerPrefs = { ...DEFAULT_PREFS, ...saved };
  } catch (e) {
    _readerPrefs = { ...DEFAULT_PREFS };
  }
}

function saveReaderPrefs() {
  try {
    localStorage.setItem(READER_PREFS_KEY, JSON.stringify(_readerPrefs));
  } catch (e) {}
}

function getReaderPref(key) {
  return _readerPrefs[key];
}

// ============================================================
// PANEL OPEN / CLOSE / TOGGLE
// ============================================================
function toggleReaderOptionsPanel() {
  const panel = document.getElementById('reader-options-panel');
  if (!panel) return;
  if (panel.classList.contains('translate-x-[120%]')) {
    openReaderOptionsPanel();
  } else {
    closeReaderOptionsPanel();
  }
}

function openReaderOptionsPanel() {
  const panel = document.getElementById('reader-options-panel');
  const overlay = document.getElementById('reader-options-overlay');
  if (!panel) return;
  _syncOptionsPanelUI();
  panel.classList.remove('translate-x-[120%]');
  panel.classList.add('translate-x-0');
  if (overlay) overlay.classList.remove('hidden');
}

function closeReaderOptionsPanel() {
  const panel = document.getElementById('reader-options-panel');
  const overlay = document.getElementById('reader-options-overlay');
  if (panel) {
    panel.classList.remove('translate-x-0');
    panel.classList.add('translate-x-[120%]');
  }
  if (overlay) overlay.classList.add('hidden');
}

// ============================================================
// SEARCH OVERLAY (Pill Popup matching media_1793979136791_b0c4c215.png)
// ============================================================
function toggleReaderSearch() {
  const overlay = document.getElementById('reader-search-overlay');
  if (!overlay) return;
  if (overlay.classList.contains('hidden')) {
    openReaderSearch();
  } else {
    closeReaderSearch();
  }
}

function openReaderSearch() {
  const overlay = document.getElementById('reader-search-overlay');
  const input   = document.getElementById('reader-search-input');
  const results = document.getElementById('reader-search-results');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  if (results) results.classList.add('hidden');
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 50);
  }
}

function closeReaderSearch() {
  const overlay = document.getElementById('reader-search-overlay');
  const results = document.getElementById('reader-search-results');
  if (overlay) overlay.classList.add('hidden');
  if (results) results.classList.add('hidden');
  clearReaderSearchHighlights();
}

function handleReaderSearchInput(val) {
  const q = (val || '').trim();
  const resultsBox = document.getElementById('reader-search-results');
  if (!resultsBox) return;

  if (!q) {
    resultsBox.classList.add('hidden');
    resultsBox.innerHTML = '';
    clearReaderSearchHighlights();
    return;
  }

  const items = [];
  const qLower = q.toLowerCase();

  // 1. If user typed a number (or "p. 450", "p450", "450"): offer direct page jump
  const numMatch = q.match(/\b\d{1,3}\b/);
  if (numMatch) {
    const pageNum = parseInt(numMatch[0], 10);
    if (pageNum >= 1 && pageNum <= 844) {
      items.push(`
        <div onclick="jumpToReaderPage(${pageNum})" class="px-3 py-2 hover:bg-purple-50 rounded-xl cursor-pointer flex items-center justify-between text-purple-700 font-bold border-b border-slate-100">
          <span class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center text-xs">📖</span>
            <span>Jump to Page ${pageNum}</span>
          </span>
          <span class="text-[10px] font-mono text-purple-400">First Aid &rsaquo;</span>
        </div>
      `);
    }
  }

  // 2. Search in all headings data
  if (window.FA_HEADINGS_DATA) {
    let matchCount = 0;
    const currentSysName = (typeof state !== 'undefined' && state.currentFaSystem) ? state.currentFaSystem.name : '';

    // Search current section first, then other sections
    const sections = Object.keys(window.FA_HEADINGS_DATA);
    sections.sort((a, b) => (a === currentSysName ? -1 : (b === currentSysName ? 1 : 0)));

    for (const sec of sections) {
      const rows = window.FA_HEADINGS_DATA[sec] || [];
      for (const row of rows) {
        if (matchCount >= 8) break;
        const title = row.title || '';
        if (title.toLowerCase().includes(qLower)) {
          matchCount++;
          const p = row.page || (row.parentPage || '');
          const secSlug = (window.SECTION_TO_SYS_KEY || {})[sec] || 'cvs';
          items.push(`
            <div onclick="jumpToHeadingResult('${secSlug}', ${p || 'null'}, '${encodeURIComponent(title)}')" class="px-3 py-2 hover:bg-purple-50 rounded-xl cursor-pointer flex items-center justify-between text-slate-800 transition-colors">
              <div class="flex items-center gap-2 overflow-hidden">
                <span class="text-[10px] font-mono font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 shrink-0">p.${p || '-'}</span>
                <span class="font-medium truncate">${_escapeSearch(title)}</span>
              </div>
              <span class="text-[10px] text-slate-400 shrink-0 ml-2">${_escapeSearch(sec)}</span>
            </div>
          `);
        }
      }
      if (matchCount >= 8) break;
    }
  }

  if (items.length > 0) {
    resultsBox.innerHTML = items.join('');
    resultsBox.classList.remove('hidden');
  } else {
    resultsBox.innerHTML = `<div class="px-3 py-2 text-slate-400 italic text-center">No headings matching "${_escapeSearch(q)}"</div>`;
    resultsBox.classList.remove('hidden');
  }

  // Also highlight in the TOC if open
  handleReaderSearchTOCFilter(qLower);
}

function handleReaderSearchSubmit(val) {
  const q = (val || '').trim();
  if (!q) return;
  const numMatch = q.match(/\b\d{1,3}\b/);
  if (numMatch) {
    jumpToReaderPage(parseInt(numMatch[0], 10));
    return;
  }
  // Click first result
  const resultsBox = document.getElementById('reader-search-results');
  if (resultsBox && resultsBox.firstElementChild) {
    resultsBox.firstElementChild.click();
  }
}

function jumpToReaderPage(pageNum) {
  closeReaderSearch();
  if (typeof openFaBookPage === 'function') {
    openFaBookPage(pageNum);
  }
}

function jumpToHeadingResult(secSlug, pageNum, encodedTitle) {
  closeReaderSearch();
  const title = decodeURIComponent(encodedTitle || '');
  if (typeof openFaBookPage === 'function') {
    const sys = (state.firstAidSystems || []).find(s => s.id === secSlug);
    if (sys) state.currentFaSystem = sys;
    openFaBookPage(pageNum || 284, { title: title, page: pageNum });
  }
}

function handleReaderSearchTOCFilter(qLower) {
  const tocList = document.getElementById('fa-reader-toc-list');
  if (!tocList) return;
  const rows = tocList.querySelectorAll('.fa-toc-row');
  let firstMatch = null;
  rows.forEach(row => {
    const title = (row.querySelector('.fa-toc-title') || {}).textContent || '';
    const matches = title.toLowerCase().includes(qLower);
    row.style.display = matches ? '' : 'none';
    if (matches && !firstMatch) firstMatch = row;
  });
  if (firstMatch) firstMatch.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function clearReaderSearchHighlights() {
  const tocList = document.getElementById('fa-reader-toc-list');
  if (!tocList) return;
  tocList.querySelectorAll('.fa-toc-row').forEach(r => { r.style.display = ''; });
}

function _escapeSearch(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============================================================
// SETTING 1: PAGE MODE (Swipe / Scroll)
// ============================================================
function setReaderPageMode(mode) {
  _readerPrefs.pageMode = mode;
  saveReaderPrefs();
  _syncOptionsPanelUI();
  const container = document.getElementById('fa-reader-center-container');
  if (container) {
    if (mode === 'swipe') {
      container.style.overflowY = 'hidden';
      _initSwipeGestures();
    } else {
      container.style.overflowY = 'auto';
    }
  }
  showReaderToast(mode === 'swipe' ? '↔ Swipe mode enabled' : '↕ Scroll mode enabled');
}

let _swipeStartX = 0;
function _initSwipeGestures() {
  const container = document.getElementById('fa-reader-center-container');
  if (!container || container._swipeInit) return;
  container._swipeInit = true;
  container.addEventListener('touchstart', e => {
    if (_readerPrefs.pageMode !== 'swipe') return;
    _swipeStartX = e.touches[0].clientX;
  }, { passive: true });
  container.addEventListener('touchend', e => {
    if (_readerPrefs.pageMode !== 'swipe') return;
    const dx = e.changedTouches[0].clientX - _swipeStartX;
    if (Math.abs(dx) > 50) {
      if (dx < 0 && typeof nextFaBookPage === 'function') nextFaBookPage();
      else if (dx > 0 && typeof prevFaBookPage === 'function') prevFaBookPage();
    }
  }, { passive: true });
}

// ============================================================
// SETTING 2: DARK PAGE (Auto / On / Off)
// ============================================================
function setDarkPage(mode) {
  _readerPrefs.darkPage = mode;
  saveReaderPrefs();
  _applyDarkPage();
  _syncOptionsPanelUI();
  showReaderToast(`Dark page: ${mode.toUpperCase()}`);
}

function _applyDarkPage() {
  const img = document.getElementById('fa-reader-page-img');
  const mehlmanCanvas = document.getElementById('mehlman-pdf-canvas');
  const mode = _readerPrefs.darkPage;

  let filterValue = 'none';
  if (mode === 'on') {
    filterValue = 'invert(1) hue-rotate(180deg)';
  } else if (mode === 'off') {
    filterValue = 'none';
  } else {
    // auto: dark by default, or check prefers-color-scheme
    filterValue = 'invert(1) hue-rotate(180deg)';
  }

  if (img) img.style.filter = filterValue;
  if (mehlmanCanvas) mehlmanCanvas.style.filter = filterValue;
}

// ============================================================
// SETTING 3: AUTO BLANKS
// ============================================================
function toggleAutoBlanks() {
  _readerPrefs.autoBlanks = !_readerPrefs.autoBlanks;
  saveReaderPrefs();
  _syncOptionsPanelUI();
  showReaderToast(_readerPrefs.autoBlanks ? 'Auto blanks: ON' : 'Auto blanks: OFF');
}

// ============================================================
// SETTING 4: BLUR PAGE IN QUESTIONS
// ============================================================
function toggleBlurInQuestions() {
  _readerPrefs.blurInQuestions = !_readerPrefs.blurInQuestions;
  saveReaderPrefs();
  _syncOptionsPanelUI();
  showReaderToast(_readerPrefs.blurInQuestions ? 'Blur page in questions: ON' : 'Blur page in questions: OFF');
}

// ============================================================
// SETTING 5: TEST THIS PAGE
// ============================================================
function readerTestThisPage() {
  closeReaderOptionsPanel();
  const page = (typeof state !== 'undefined' && state.currentFaPage) || null;
  const sys = (typeof state !== 'undefined' && state.currentFaSystem) || null;
  if (sys && window.FA_HEADINGS_DATA && sys.name) {
    const rows = (window.FA_HEADINGS_DATA[sys.name] || []).filter(r => r.hasM && r.page == page);
    if (rows.length > 0) {
      const r = rows[0];
      const sysSlug = (window.SECTION_TO_SYS_KEY || {})[sys.name] || 'cvs';
      if (typeof openMehlmanSheet === 'function') {
        openMehlmanSheet(sysSlug, page, r.title, r.title);
        return;
      }
    }
  }
  // Fallback: open first available card for this system
  if (sys && typeof openMehlmanSheet === 'function') {
    const rows = (window.FA_HEADINGS_DATA[sys.name] || []).filter(r => r.hasM);
    if (rows.length > 0) {
      const r = rows[0];
      const sysSlug = (window.SECTION_TO_SYS_KEY || {})[sys.name] || 'cvs';
      openMehlmanSheet(sysSlug, r.page, r.title, r.title);
      return;
    }
  }
  showReaderToast('No Mehlman questions linked for this page');
}

// ============================================================
// SETTING 6: UWORLD INCORRECTS
// ============================================================
function readerUWorldIncorrects() {
  closeReaderOptionsPanel();
  const input = document.getElementById('uworld-id-input');
  if (input) {
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input.focus();
    showReaderToast('Paste UWorld question IDs to highlight matching topics');
  } else {
    showReaderToast('UWorld Incorrects finder active');
  }
}

// ============================================================
// SETTING 7: MEHLMAN QUESTIONS
// ============================================================
function readerMehlmanQuestions() {
  closeReaderOptionsPanel();
  const sys = (typeof state !== 'undefined' && state.currentFaSystem) || null;
  const page = (typeof state !== 'undefined' && state.currentFaPage) || null;
  if (sys && window.FA_HEADINGS_DATA && sys.name) {
    const rows = (window.FA_HEADINGS_DATA[sys.name] || []).filter(r => r.hasM);
    if (rows.length > 0) {
      const nearest = rows.reduce((best, r) => {
        return Math.abs((r.page || 0) - (page || 0)) < Math.abs((best.page || 0) - (page || 0)) ? r : best;
      }, rows[0]);
      const sysSlug = (window.SECTION_TO_SYS_KEY || {})[sys.name] || 'cvs';
      if (typeof openMehlmanSheet === 'function') {
        openMehlmanSheet(sysSlug, nearest.page, nearest.title, nearest.title);
        return;
      }
    }
  }
  showReaderToast('No Mehlman cards found in this section');
}

// ============================================================
// SETTING 8: MEHLMAN TAGS BESIDE HEADINGS
// ============================================================
function toggleMehlmanTags() {
  _readerPrefs.mehlmanTags = !_readerPrefs.mehlmanTags;
  saveReaderPrefs();
  _syncOptionsPanelUI();
  _applyMehlmanTags();
}

function _applyMehlmanTags() {
  const show = _readerPrefs.mehlmanTags;
  document.querySelectorAll('.fa-toc-m-badge, .fa-toc-m-placeholder').forEach(el => {
    el.style.display = show ? '' : 'none';
  });
  const layer = document.getElementById('fa-page-markers-layer');
  if (layer) layer.style.display = show ? '' : 'none';
}

// ============================================================
// SETTING 9: LIST VIEW
// ============================================================
function toggleListView() {
  _readerPrefs.listView = !_readerPrefs.listView;
  saveReaderPrefs();
  _syncOptionsPanelUI();
  _applyListView();
}

function _applyListView() {
  const pageContainer = document.getElementById('fa-page-container');
  const toc = document.getElementById('fa-reader-toc');
  const fallback = document.getElementById('fa-reader-page-fallback');
  if (_readerPrefs.listView) {
    if (pageContainer) pageContainer.style.display = 'none';
    if (fallback) fallback.classList.remove('hidden');
    if (toc) toc.classList.remove('hidden');
    showReaderToast('List view: showing headings');
  } else {
    if (pageContainer) pageContainer.style.display = '';
    if (fallback) fallback.classList.add('hidden');
    showReaderToast('Page view: showing book scan');
  }
}

// ============================================================
// SETTING 10: SHOW IN FIRST AID TOGGLES
// ============================================================
function toggleShowInFA(key) {
  _readerPrefs[key] = !_readerPrefs[key];
  saveReaderPrefs();
  _syncOptionsPanelUI();
  _applyShowInFA();
  showReaderToast(`Updated: ${key}`);
}

function _applyShowInFA() {
  // UWorld tables
  const tablesPanel = document.getElementById('fa-panel-view-tables');
  const tabBtn = document.getElementById('fa-panel-tab-tables');
  if (tablesPanel) tablesPanel.style.display = _readerPrefs.showUWorldTables ? '' : 'none';
  if (tabBtn) tabBtn.style.display = _readerPrefs.showUWorldTables ? '' : 'none';

  // UWorld images
  const imgPanel = document.getElementById('fa-panel-view-img');
  const imgBtn = document.getElementById('fa-panel-tab-img');
  if (imgPanel) imgPanel.style.display = _readerPrefs.showUWorldImages ? '' : 'none';
  if (imgBtn) imgBtn.style.display = _readerPrefs.showUWorldImages ? '' : 'none';

  // Mehlman tags
  _applyMehlmanTags();
}

// ============================================================
// SETTING 11: BAR COLOUR
// ============================================================
function setReaderBarColour(colour) {
  _readerPrefs.barColour = colour;
  saveReaderPrefs();
  _applyBarColour();
  _syncOptionsPanelUI();
  showReaderToast(`Bar colour: ${colour.toUpperCase()}`);
}

function _applyBarColour() {
  const faBar = document.querySelector('#modal-fa-book .h-12');
  const mehlmanBar = document.querySelector('#modal-mehlman-reader .h-12');
  const c = _readerPrefs.barColour;
  const colourMap = {
    theme: '#170e20',
    navy:  '#0f172a',
    black: '#000000'
  };
  const bg = colourMap[c] || '#170e20';
  if (faBar) faBar.style.backgroundColor = bg;
  if (mehlmanBar) mehlmanBar.style.backgroundColor = bg;
}

// ============================================================
// SYNC UI: UPDATE ALL BUTTONS/SWITCHES IN OPTIONS PANEL
// ============================================================
function _syncOptionsPanelUI() {
  const p = _readerPrefs;
  _setToggle('opt-toggle-auto-blanks',     p.autoBlanks);
  _setToggle('opt-toggle-blur-questions',  p.blurInQuestions);
  _setToggle('opt-toggle-mehlman-tags',    p.mehlmanTags);
  _setToggle('opt-toggle-uworld-tables',   p.showUWorldTables);
  _setToggle('opt-toggle-uworld-images',   p.showUWorldImages);
  _setToggle('opt-toggle-anking',          p.showAnKing);
  _setToggle('opt-toggle-mnemosyne',       p.showMnemosyne);
  _setToggle('opt-toggle-mehlman-full',    p.showMehlman);

  // Page mode
  ['swipe','scroll'].forEach(m => {
    const btn = document.getElementById(`opt-pagemode-${m}`);
    if (!btn) return;
    const isAct = (p.pageMode === m);
    btn.className = isAct
      ? 'flex-1 py-1.5 px-3 rounded-xl text-xs font-bold bg-white text-purple-700 shadow-sm flex items-center justify-center gap-1.5 transition-all'
      : 'flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-slate-600 hover:text-slate-900';
  });

  // Dark page
  ['auto','on','off'].forEach(m => {
    const btn = document.getElementById(`opt-darkpage-${m}`);
    if (!btn) return;
    const isAct = (p.darkPage === m);
    btn.className = isAct
      ? 'flex-1 py-1.5 rounded-xl text-xs font-bold bg-white text-purple-700 shadow-sm transition-all'
      : 'flex-1 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all';
  });

  // Bar colour
  ['theme','navy','black'].forEach(m => {
    const btn = document.getElementById(`opt-barcolour-${m}`);
    if (!btn) return;
    const isAct = (p.barColour === m);
    btn.className = isAct
      ? 'flex-1 py-1.5 rounded-xl text-xs font-bold bg-white text-purple-700 shadow-sm transition-all'
      : 'flex-1 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all';
  });

  // Sync theme in options panel
  const currentTheme = localStorage.getItem('synapse_theme') || 'dark';
  ['light', 'dark', 'black', 'auto'].forEach(t => {
    const btn = document.getElementById('opt-theme-' + t);
    if (!btn) return;
    const isAct = (currentTheme === t);
    btn.className = isAct
      ? 'flex-1 py-1.5 rounded-xl text-xs font-bold bg-white text-purple-700 shadow-sm transition-all'
      : 'flex-1 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all';
  });

  // Sync font scale in options panel
  const currentFontScale = localStorage.getItem('synapse_font_scale') || '100';
  const scaleLabel = document.getElementById('opt-font-scale-label');
  if (scaleLabel) scaleLabel.textContent = currentFontScale + '%';

  // Sync active font pill in options panel
  const currentFont = localStorage.getItem('synapse_font') || 'Synapse';
  ['Synapse', 'Inter', 'Plus-Jakarta', 'Lexend', 'Outfit', 'Fraunces'].forEach(f => {
    const btn = document.getElementById('opt-font-' + f);
    if (!btn) return;
    const key = f.replace('-', ' ');
    const isAct = (currentFont === key);
    if (isAct) {
      btn.classList.add('border-purple-600', 'text-purple-700', 'bg-purple-50', 'font-bold');
      btn.classList.remove('border-slate-200', 'text-slate-800', 'bg-[#f5f2f8]');
    } else {
      btn.classList.remove('border-purple-600', 'text-purple-700', 'bg-purple-50', 'font-bold');
      btn.classList.add('border-slate-200', 'text-slate-800', 'bg-[#f5f2f8]');
    }
  });
}

function _setToggle(id, on) {
  const el = document.getElementById(id);
  if (!el) return;
  const dot = el.querySelector('.toggle-dot');
  if (on) {
    el.className = 'w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out bg-purple-600 focus:outline-none flex items-center cursor-pointer';
    if (dot) dot.className = 'toggle-dot w-5 h-5 rounded-full bg-white shadow-md transform translate-x-5 transition-transform duration-200 ease-in-out';
  } else {
    el.className = 'w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out bg-slate-300 focus:outline-none flex items-center cursor-pointer';
    if (dot) dot.className = 'toggle-dot w-5 h-5 rounded-full bg-white shadow-md transform translate-x-0 transition-transform duration-200 ease-in-out';
  }
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================
function showReaderToast(msg, duration = 1800) {
  let toast = document.getElementById('reader-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'reader-toast';
    toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 z-[250] px-4 py-2 bg-[#1f1030] border border-purple-500/60 text-white text-xs font-semibold rounded-full shadow-2xl pointer-events-none opacity-0 transition-opacity duration-200 flex items-center gap-2';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span><span>${_escapeSearch(msg)}</span>`;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, duration);
}

// ============================================================
// INITIALIZATION
// ============================================================
function applyAllReaderPrefs() {
  loadReaderPrefs();
  _applyDarkPage();
  _applyMehlmanTags();
  _applyShowInFA();
  _applyBarColour();
  if (_readerPrefs.listView) _applyListView();
  if (_readerPrefs.pageMode === 'swipe') {
    const container = document.getElementById('fa-reader-center-container');
    if (container) {
      container.style.overflowY = 'hidden';
      _initSwipeGestures();
    }
  }
}

// Run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyAllReaderPrefs);
} else {
  applyAllReaderPrefs();
}
