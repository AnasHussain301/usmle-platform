/**
 * FA HEADINGS MODULE — Zetchy-exact headings list & reader gutter
 * ================================================================
 * Source of truth: /api/fa/headings (zetchy_headings_all.json)
 * Mehlman Cards:   /api/mehlman/cards (mehlman_cards_mapped.json)
 */

'use strict';

// ============================================================
// STATE
// ============================================================
window.FA_HEADINGS_DATA = null;
window.MEHLMAN_CARDS_DATA = null;
window.FA_HEADINGS_SORT = 'book';
window.FA_HEADINGS_FILTER = '';
window.FA_HEADINGS_ALL_TEXT = false;

// Bottom sheet state
window.currentMehlmanSheet = {
  headingKey: '',
  sectionSlug: '',
  page: '',
  title: '',
  cards: [],
  currentIndex: 0,
  revealed: false,
  fontSize: 'normal' // 'normal' | 'large'
};

const SECTION_TO_SYS_KEY = {
  'Cardiovascular':        'cvs',
  'Endocrine':             'endo',
  'Gastrointestinal':      'gi',
  'Hematology & Oncology': 'heme',
  'Musculoskeletal & Skin':'msk',
  'Neurology':             'neuro',
  'Psychiatry':            'psych',
  'Renal':                 'renal',
  'Reproductive':          'repro',
  'Respiratory':           'resp',
  'Immunology':            'immuno',
  'General Principles':    'gen',
  'Microbiology':          'micro'
};

const SYS_KEY_TO_SECTION = Object.fromEntries(
  Object.entries(SECTION_TO_SYS_KEY).map(([k, v]) => [v, k])
);

// ============================================================
// DATA LOADERS
// ============================================================
async function loadFaHeadingsData() {
  if (window.FA_HEADINGS_DATA) return window.FA_HEADINGS_DATA;
  try {
    const res = await fetch('/api/fa/headings');
    const json = await res.json();
    if (json.success && json.headings) {
      window.FA_HEADINGS_DATA = json.headings;
    }
  } catch (e) {
    console.warn('[FA Headings] Failed to load headings:', e.message);
    window.FA_HEADINGS_DATA = {};
  }
  return window.FA_HEADINGS_DATA;
}

async function loadMehlmanCardsData() {
  if (window.MEHLMAN_CARDS_DATA) return window.MEHLMAN_CARDS_DATA;
  try {
    const res = await fetch('/api/mehlman/cards');
    const json = await res.json();
    if (json.success && json.cards) {
      window.MEHLMAN_CARDS_DATA = json.cards;
    }
  } catch (e) {
    console.warn('[Mehlman Cards] Failed to load cards:', e.message);
    window.MEHLMAN_CARDS_DATA = {};
  }
  return window.MEHLMAN_CARDS_DATA;
}

function getHeadingsForSection(sectionName) {
  if (!window.FA_HEADINGS_DATA) return [];
  return window.FA_HEADINGS_DATA[sectionName] || [];
}

function _hesc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
// SHARED COMPONENTS
// ============================================================
function renderGroupLabel(groupName) {
  return `<div class="fa-toc-group-label px-3 pt-4 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-500 select-none pointer-events-none border-b border-[#2d1b40]/40 mb-0.5">${_hesc(groupName)}</div>`;
}

function renderMehlmanBadge(show, sectionSlug, page, title) {
  if (show) {
    const escTitle = _hesc(title).replace(/'/g, "&#39;");
    return `<button onclick="event.stopPropagation(); openMehlmanSheet('${sectionSlug}', '${page || ''}', '${escTitle}')" class="fa-toc-m-badge inline-flex items-center justify-center w-5 h-5 rounded bg-pink-600 hover:bg-pink-500 text-white text-[9px] font-black shrink-0 select-none transition-all active:scale-95 cursor-pointer shadow-sm" title="Mehlman HY content for ${_hesc(title)}">M</button>`;
  }
  return `<span class="fa-toc-m-placeholder inline-block w-5 h-5 shrink-0"></span>`;
}

function renderMenuButton(rowIdx, pageNum, titleEsc, isLevel1, parentPageNum) {
  const navPage = isLevel1 ? (parentPageNum || pageNum) : pageNum;
  return `<button class="fa-toc-menu-btn w-6 h-6 rounded-full border border-[#4b2d6b] bg-[#1e1030]/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#3d2258] hover:border-pink-500/60 transition-all shrink-0 text-[12px] font-black leading-none active:scale-95"
    onclick="event.stopPropagation(); faHeadingMenuAction(${rowIdx}, ${navPage || 'null'}, '${_hesc(titleEsc).replace(/'/g, "&#39;")}', event)"
    title="Options for ${_hesc(titleEsc)}">⋯</button>`;
}

function renderHeadingRow(row, rowIdx, isCurrentPage, currentPageNum, sectionSlug) {
  const isLevel1 = row.level === 1;
  const pageNum = row.page ? parseInt(row.page, 10) : null;
  const parentPageNum = row.parentPage ? parseInt(row.parentPage, 10) : null;
  const navPage = isLevel1 ? (parentPageNum || currentPageNum) : pageNum;

  const isCurrent = isCurrentPage && (
    (!isLevel1 && pageNum === currentPageNum) ||
    (isLevel1 && parentPageNum === currentPageNum)
  );

  const titleColor = isCurrent
    ? 'text-pink-400 font-semibold'
    : (isLevel1 ? 'text-slate-400' : 'text-slate-200 font-medium');

  const rowBg = isCurrent
    ? 'bg-[#2a1038] border border-pink-600/30 rounded-xl'
    : 'hover:bg-[#1a0f27] rounded-xl';

  const pageLabel = (!isLevel1 && pageNum)
    ? `<span class="text-[10px] font-mono text-slate-500 w-9 shrink-0 text-right pr-1">${pageNum}</span>`
    : `<span class="w-9 shrink-0"></span>`;

  const mBadge = renderMehlmanBadge(row.hasM === true, sectionSlug, navPage, row.title);
  const menuBtn = renderMenuButton(rowIdx, navPage, row.title, isLevel1, parentPageNum);

  const clickFn = navPage
    ? `onclick="faHeadingRowClick(${navPage}, '${_hesc(row.title).replace(/'/g, "&#39;")}')" tabindex="0" role="button"`
    : '';

  return `<div class="fa-toc-row flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors ${rowBg}" data-row-idx="${rowIdx}" data-page="${navPage || ''}" data-level="${row.level}" data-has-m="${row.hasM}" ${clickFn}>
  ${pageLabel}
  <span class="fa-toc-title flex-1 text-xs leading-snug truncate ${titleColor}">${_hesc(row.title)}</span>
  ${mBadge}
  <span class="fa-toc-menu-slot w-7 flex items-center justify-center shrink-0">${menuBtn}</span>
</div>`;
}

// ============================================================
// RENDER TOC
// ============================================================
function renderFaHeadingsTOC(sectionNameOrSysKey, currentPageNum, sortMode, filterQuery, allText) {
  let sectionName = sectionNameOrSysKey;
  if (SECTION_TO_SYS_KEY[sectionNameOrSysKey] === undefined && SYS_KEY_TO_SECTION[sectionNameOrSysKey]) {
    sectionName = SYS_KEY_TO_SECTION[sectionNameOrSysKey];
  }

  const secSlug = SECTION_TO_SYS_KEY[sectionName] || 'cvs';
  let rows = getHeadingsForSection(sectionName);
  if (!rows || rows.length === 0) return '<div class="p-4 text-slate-500 text-xs">Loading headings...</div>';

  const q = (filterQuery || '').toLowerCase().trim();
  if (q) {
    rows = rows.filter(r => (r.title || '').toLowerCase().includes(q));
  }

  if ((sortMode || 'book') === 'book') {
    rows = rows.slice().sort((a, b) => a.order - b.order);
  }

  let html = '';
  let lastGroup = null;

  html += `<div class="fa-toc-uworld-pill flex items-center gap-2 px-3 py-2 mb-1">
    <button onclick="copyUWorldIds('${_hesc(sectionName)}')" class="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 text-[11px] font-semibold transition-colors">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
      Copy UWorld IDs · headings under 50%
    </button>
  </div>`;

  rows.forEach((row, idx) => {
    if (!q && row.group && row.group !== lastGroup) {
      lastGroup = row.group;
      html += renderGroupLabel(row.group);
    }
    html += renderHeadingRow(row, row.order, currentPageNum !== null, currentPageNum, secSlug);
  });

  return html;
}

// ============================================================
// READER GUTTER MARKERS (RESERVED COLUMN, NO OVERLAP)
// Two columns inside #fa-page-gutter:
//   Column 1 (outer/left): level-0 M badge
//   Column 2 (inner/right, next to page): level-0 "..." button OR level-1 M badge
// ============================================================
function renderFaGutterMarkers(sectionName, pageNum, matchingTopics) {
  const col1 = document.getElementById('fa-page-gutter-col1');
  const col2 = document.getElementById('fa-page-gutter-col2');
  const gutter = document.getElementById('fa-page-gutter');
  if (!col1 || !col2 || !gutter) return;

  const secSlug = SECTION_TO_SYS_KEY[sectionName] || 'cvs';
  const rows = getHeadingsForSection(sectionName);
  if (!rows || rows.length === 0) return;

  // Find all headings that belong on this page:
  // - level 0 where page == pageNum
  // - level 1 where parentPage == pageNum
  const pageRows = rows.filter(r => {
    if (r.level === 0 && parseInt(r.page, 10) === pageNum) return true;
    if (r.level === 1 && parseInt(r.parentPage, 10) === pageNum) return true;
    return false;
  });

  if (pageRows.length === 0) {
    col1.innerHTML = '';
    col2.innerHTML = '';
    return;
  }

  const total = pageRows.length;
  let htmlCol1 = '';
  let htmlCol2 = '';

  pageRows.forEach((row, idx) => {
    let topPct;
    if (total === 1) {
      topPct = 12;
    } else if (total === 2) {
      topPct = idx === 0 ? 12 : 55;
    } else if (total === 3) {
      topPct = [12, 42, 72][idx];
    } else {
      // Multi-row page (like page 450 with 6 nerve rows)
      const startPct = 14;
      const spanPct = 68;
      topPct = Math.round(startPct + (idx / Math.max(1, total - 1)) * spanPct);
    }

    const escTitle = _hesc(row.title).replace(/'/g, "&#39;");
    const navPage = row.page || row.parentPage || pageNum;

    if (row.level === 0) {
      // Column 1 (outer): M badge for level-0
      if (row.hasM) {
        htmlCol1 += `<div class="absolute right-0 flex items-center justify-center pointer-events-auto" style="top: ${topPct}%; transform: translateY(-50%);">
          <button onclick="openMehlmanSheet('${secSlug}', '${navPage}', '${escTitle}')"
            class="w-7 h-7 rounded-full bg-[#1e1030] hover:bg-pink-700 border border-pink-500/80 flex items-center justify-center text-pink-300 hover:text-white text-[10px] font-black shadow-lg transition-transform hover:scale-110 active:scale-95"
            title="Mehlman: ${_hesc(row.title)}">M</button>
        </div>`;
      }

      // Column 2 (inner): "..." action button for level-0
      const calloutId = `callout-g-${idx}`;
      const matchedTopic = (matchingTopics || []).find(t =>
        (t.title || '').toLowerCase() === (row.title || '').toLowerCase()
      ) || (matchingTopics || [])[0] || null;
      const topicIdx = matchedTopic ? (window._faPageTopics || []).indexOf(matchedTopic) : idx;
      const qCount = matchedTopic && typeof getQuestionsForTopic === 'function' ? getQuestionsForTopic(matchedTopic).length : 0;
      const imgCount = matchedTopic ? (matchedTopic.images || []).length : 0;
      const tblCount = matchedTopic ? (matchedTopic.tables || []).length : 0;

      htmlCol2 += `<div class="absolute right-0 flex items-center justify-center pointer-events-auto" style="top: ${topPct}%; transform: translateY(-50%);">
        <button onclick="toggleCalloutMenu('${calloutId}')"
          class="w-7 h-7 rounded-full bg-[#1e102e]/95 hover:bg-[#3d2258] border border-[#6b3e94] flex items-center justify-center text-slate-200 hover:text-white transition-transform hover:scale-110 active:scale-95 shadow-lg"
          title="${_hesc(row.title)}">
          <span class="text-xs font-black select-none tracking-tighter">⋯</span>
        </button>
        <div id="${calloutId}" class="hidden absolute left-9 top-0 bg-[#160d21]/95 backdrop-blur-md border border-[#3b2352] rounded-2xl p-3 shadow-2xl min-w-[240px] z-30 pointer-events-auto text-left">
          <div class="text-xs font-bold text-white mb-2 truncate">${_hesc(row.title)}</div>
          <div class="flex items-center gap-2">
            <button onclick="openSketchFromFA(${topicIdx})" class="w-8 h-8 rounded-full bg-[#2c1c3f] border border-[#5a3880] flex items-center justify-center text-purple-300 hover:text-white" title="Play Sketch"><svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
            <button onclick="openFaTopicActions(${topicIdx}); switchFaPanelTab('img');" class="relative w-8 h-8 rounded-full bg-[#20152e] border border-[#48286b] flex items-center justify-center text-slate-200 hover:text-white" title="Images"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>${imgCount > 0 ? `<span class="absolute -top-1 -right-1 bg-amber-500 text-[8px] font-black text-black rounded-full px-1">${imgCount}</span>`:''}</button>
            <button onclick="toggleCalloutMenu('${calloutId}'); openWhichQuestionsModal(${topicIdx});" class="relative w-8 h-8 rounded-full bg-[#20152e] border border-[#48286b] flex items-center justify-center text-white" title="Practice Questions"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg><span class="absolute -top-1 -right-1 bg-[#db2777] text-[8px] font-black text-white rounded-full px-1">${qCount}</span></button>
            <button onclick="openFaTopicActions(${topicIdx}); switchFaPanelTab('tables');" class="relative w-8 h-8 rounded-full bg-[#20152e] border border-[#48286b] flex items-center justify-center text-sky-400 hover:text-white" title="UWorld Tables"><span class="text-[9px] font-bold">UW</span>${tblCount > 0 ? `<span class="absolute -top-1 -right-1 bg-[#db2777] text-[8px] font-black text-white rounded-full px-1">${tblCount}</span>`:''}</button>
            <button onclick="openFaTopicActions(${topicIdx}); switchFaPanelTab('notes');" class="w-8 h-8 rounded-full bg-[#20152e] border border-[#48286b] flex items-center justify-center text-slate-300 hover:text-white" title="Notes"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
          </div>
        </div>
      </div>`;
    } else {
      // Level-1 subheading: only Column 2 gets M badge if hasM is true
      if (row.hasM) {
        htmlCol2 += `<div class="absolute right-0 flex items-center justify-center pointer-events-auto" style="top: ${topPct}%; transform: translateY(-50%);">
          <button onclick="openMehlmanSheet('${secSlug}', '${navPage}', '${escTitle}')"
            class="w-7 h-7 rounded-full bg-[#1e1030] hover:bg-pink-700 border border-pink-500/80 flex items-center justify-center text-pink-300 hover:text-white text-[10px] font-black shadow-lg transition-transform hover:scale-110 active:scale-95"
            title="Mehlman: ${_hesc(row.title)}">M</button>
        </div>`;
      }
    }
  });

  col1.innerHTML = htmlCol1;
  col2.innerHTML = htmlCol2;
}

// ============================================================
// PART B: MEHLMAN BOTTOM SHEET LOGIC
// ============================================================
async function openMehlmanSheet(sectionSlug, page, title) {
  await loadMehlmanCardsData();

  const key = `${sectionSlug}|${page}|${title}`;
  const cards = (window.MEHLMAN_CARDS_DATA && window.MEHLMAN_CARDS_DATA[key]) || [];

  window.currentMehlmanSheet = {
    headingKey: key,
    sectionSlug,
    page,
    title,
    cards,
    currentIndex: 0,
    revealed: false,
    fontSize: window.currentMehlmanSheet.fontSize || 'normal'
  };

  const modal = document.getElementById('modal-mehlman-sheet');
  if (!modal) return;

  renderMehlmanSheetCard();
  modal.classList.remove('hidden');

  // Keyboard navigation
  window.addEventListener('keydown', handleMehlmanSheetKeydown);
}

function closeMehlmanSheet() {
  const modal = document.getElementById('modal-mehlman-sheet');
  if (modal) modal.classList.add('hidden');
  window.removeEventListener('keydown', handleMehlmanSheetKeydown);
}

function handleMehlmanBackdropClick(e) {
  if (e.target.id === 'modal-mehlman-sheet') {
    closeMehlmanSheet();
  }
}

function handleMehlmanSheetKeydown(e) {
  if (e.key === 'Escape') {
    closeMehlmanSheet();
  } else if (e.key === 'ArrowRight') {
    nextMehlmanCard();
  } else if (e.key === 'ArrowLeft') {
    prevMehlmanCard();
  } else if (e.key === ' ') {
    e.preventDefault();
    revealMehlmanAnswer();
  }
}

function renderMehlmanSheetCard() {
  const state = window.currentMehlmanSheet;
  const cards = state.cards || [];
  const total = cards.length;
  const idx = state.currentIndex;

  // Header elements
  const counterEl = document.getElementById('mehlman-sheet-counter');
  const progressEl = document.getElementById('mehlman-sheet-progress');
  const topicEl = document.getElementById('mehlman-sheet-topic');
  const questionEl = document.getElementById('mehlman-sheet-question');
  const tapHint = document.getElementById('mehlman-sheet-tap-hint');
  const revealedText = document.getElementById('mehlman-sheet-revealed-text');
  const showBtn = document.getElementById('mehlman-sheet-show-btn');
  const ratingBtns = document.getElementById('mehlman-sheet-rating-btns');
  const prevBtn = document.getElementById('mehlman-sheet-prev-btn');
  const nextBtn = document.getElementById('mehlman-sheet-next-btn');

  if (topicEl) topicEl.textContent = state.title;

  if (total === 0) {
    // EMPTY STATE: "No Mehlman cards linked yet"
    if (counterEl) counterEl.textContent = '0 / 0';
    if (progressEl) progressEl.style.width = '100%';
    if (questionEl) questionEl.textContent = 'No Mehlman cards linked yet';
    if (tapHint) tapHint.innerHTML = '<span class="text-slate-500 italic">No flashcards available for this heading</span>';
    if (revealedText) revealedText.classList.add('hidden');
    if (showBtn) showBtn.classList.add('hidden');
    if (ratingBtns) ratingBtns.classList.add('hidden');
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  // Update counter & progress bar
  if (counterEl) counterEl.textContent = `${idx + 1} / ${total}`;
  if (progressEl) progressEl.style.width = `${((idx + 1) / total) * 100}%`;

  const curCard = cards[idx];
  if (questionEl) {
    questionEl.textContent = curCard.q;
    questionEl.className = state.fontSize === 'large'
      ? 'text-base sm:text-lg font-bold text-white leading-relaxed min-h-[48px]'
      : 'text-sm sm:text-base font-bold text-white leading-relaxed min-h-[48px]';
  }

  // State: revealed vs unrevealed
  if (state.revealed) {
    if (tapHint) tapHint.classList.add('hidden');
    if (revealedText) {
      revealedText.classList.remove('hidden');
      revealedText.textContent = curCard.a;
      revealedText.className = state.fontSize === 'large'
        ? 'text-sm sm:text-base text-slate-100 leading-relaxed text-left w-full font-medium'
        : 'text-xs sm:text-sm text-slate-200 leading-relaxed text-left w-full';
    }
    // Show rating buttons, hide Show answer
    if (showBtn) showBtn.classList.add('hidden');
    if (ratingBtns) ratingBtns.classList.remove('hidden');
  } else {
    if (tapHint) tapHint.classList.remove('hidden');
    if (revealedText) revealedText.classList.add('hidden');
    if (showBtn) showBtn.classList.remove('hidden');
    if (ratingBtns) ratingBtns.classList.add('hidden');
  }

  // Prev / Next button states
  if (prevBtn) prevBtn.disabled = (idx === 0);
  if (nextBtn) nextBtn.disabled = (idx === total - 1);
}

function revealMehlmanAnswer() {
  if (window.currentMehlmanSheet.cards.length === 0) return;
  window.currentMehlmanSheet.revealed = true;
  renderMehlmanSheetCard();
}

function nextMehlmanCard() {
  const s = window.currentMehlmanSheet;
  if (s.currentIndex < s.cards.length - 1) {
    s.currentIndex++;
    s.revealed = false;
    renderMehlmanSheetCard();
  }
}

function prevMehlmanCard() {
  const s = window.currentMehlmanSheet;
  if (s.currentIndex > 0) {
    s.currentIndex--;
    s.revealed = false;
    renderMehlmanSheetCard();
  }
}

function toggleMehlmanFontSize() {
  const s = window.currentMehlmanSheet;
  s.fontSize = (s.fontSize === 'normal' ? 'large' : 'normal');
  renderMehlmanSheetCard();
}

// ============================================================
// PART C: SPACED REPETITION (EASY / FORGOT RATINGS)
// Stored in localStorage under 'mehlman_progress' and synced to db
// ============================================================
function getMehlmanProgress() {
  try {
    return JSON.parse(localStorage.getItem('mehlman_progress') || '{}');
  } catch(e) {
    return {};
  }
}

function saveMehlmanProgress(prog) {
  try {
    localStorage.setItem('mehlman_progress', JSON.stringify(prog));
    // Background sync to server
    fetch('/api/mehlman/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress: prog })
    }).catch(() => {});
  } catch(e) {}
}

function rateMehlmanCard(rating) {
  const s = window.currentMehlmanSheet;
  const key = s.headingKey;
  const prog = getMehlmanProgress();

  if (!prog[key]) {
    prog[key] = { easy: 0, forgetting: 0, lastRated: null };
  }

  if (rating === 'easy') {
    prog[key].easy = (prog[key].easy || 0) + 1;
  } else if (rating === 'forgot') {
    prog[key].forgetting = (prog[key].forgetting || 0) + 1;
  }
  prog[key].lastRated = new Date().toISOString();
  saveMehlmanProgress(prog);

  // Update current system counters in state so home grid reads real numbers
  updateSystemRatingCounters(s.sectionSlug);

  // Automatically advance to next card or close if last
  if (s.currentIndex < s.cards.length - 1) {
    nextMehlmanCard();
  } else {
    showFaToast(rating === 'easy' ? 'Marked as Easy! ✓' : 'Added to Review! 🔄');
    closeMehlmanSheet();
  }
}

function updateSystemRatingCounters(sectionSlug) {
  const prog = getMehlmanProgress();
  let totalEasy = 0;
  let totalForgetting = 0;

  for (const k in prog) {
    if (k.startsWith(sectionSlug + '|')) {
      totalEasy += (prog[k].easy || 0);
      totalForgetting += (prog[k].forgetting || 0);
    }
  }

  // Update in app state
  if (window.state && window.state.firstAidSystems) {
    const sys = window.state.firstAidSystems.find(s => s.id === sectionSlug);
    if (sys) {
      sys.easy = totalEasy;
      sys.forgetting = totalForgetting;
      if (typeof renderFirstAidGrid === 'function') renderFirstAidGrid();
    }
  }
}

// ============================================================
// NAVIGATION HANDLERS
// ============================================================
function faHeadingRowClick(pageNum, title) {
  if (pageNum && typeof openFaBookPage === 'function') {
    const sys = window.state && window.state.currentFaSystem;
    const topic = sys && (sys.topics || []).find(t =>
      t.title === title || (t.page === pageNum && !title)
    );
    openFaBookPage(pageNum, topic || null);
  }
}

function faHeadingMenuAction(rowIdx, pageNum, title, event) {
  faHeadingRowClick(pageNum, title);
  setTimeout(() => {
    const calloutId = `callout-g-${rowIdx}`;
    if (typeof toggleCalloutMenu === 'function') toggleCalloutMenu(calloutId);
  }, 100);
}

function copyUWorldIds(sectionName) {
  const rows = getHeadingsForSection(sectionName);
  if (!rows || rows.length === 0) return;
  const ids = rows.filter(r => r.level === 0).map(r => r.title).join('\n');
  navigator.clipboard.writeText(ids).then(() => {
    showFaToast('Copied ' + rows.filter(r => r.level === 0).length + ' heading IDs');
  }).catch(() => {
    prompt('Copy these IDs:', ids);
  });
}

function showFaToast(msg) {
  let toast = document.getElementById('fa-headings-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'fa-headings-toast';
    toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg z-[9999] transition-opacity duration-300';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

function setFaHeadingsSort(mode) {
  window.FA_HEADINGS_SORT = mode;
  refreshFaHeadingsTOC();
  document.querySelectorAll('.fa-sort-tab').forEach(btn => {
    const isActive = btn.dataset.sort === mode;
    btn.className = btn.className.replace(/bg-\[#\w+\]|text-pink-400|border|border-pink-900\/60|text-slate-400/g, '').trim();
    if (isActive) {
      btn.classList.add('bg-[#251736]', 'text-pink-400', 'border', 'border-pink-900/60');
    } else {
      btn.classList.add('text-slate-400');
    }
  });
}

function setFaHeadingsAllText(val) {
  window.FA_HEADINGS_ALL_TEXT = val;
  refreshFaHeadingsTOC();
}

function filterFaHeadingsTOC(query) {
  window.FA_HEADINGS_FILTER = query;
  refreshFaHeadingsTOC();
}

function refreshFaHeadingsTOC() {
  const tocList = document.getElementById('fa-reader-toc-list');
  if (!tocList) return;
  const sys = window.state && window.state.currentFaSystem;
  if (!sys) return;
  const sysKey = sys.id || '';
  const sectionName = SYS_KEY_TO_SECTION[sysKey] || sys.name || '';
  const currentPage = (window.state && window.state.currentFaPage) || null;

  tocList.innerHTML = renderFaHeadingsTOC(
    sectionName,
    currentPage,
    window.FA_HEADINGS_SORT,
    window.FA_HEADINGS_FILTER,
    window.FA_HEADINGS_ALL_TEXT
  );
}

async function initFaHeadings() {
  await Promise.all([loadFaHeadingsData(), loadMehlmanCardsData()]);
  console.log('[FA Headings] Module ready with Mehlman Cards!');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFaHeadings);
} else {
  initFaHeadings();
}
