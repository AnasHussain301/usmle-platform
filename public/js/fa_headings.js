/**
 * FA HEADINGS MODULE — Zetchy-exact headings list & reader gutter
 * ================================================================
 * Source of truth:
 *   Headings: /api/fa/headings (zetchy_headings_all.json)
 *   Markers:  /api/fa/markers  (zetchy_reader_markers.json)
 *   Cards:    /api/mehlman/cards (mehlman_cards_mapped.json)
 */

'use strict';

// ============================================================
// STATE
// ============================================================
window.FA_HEADINGS_DATA = null;
window.FA_MARKERS_DATA = null;
window.MEHLMAN_CARDS_DATA = null;
window.FA_HEADINGS_SORT = 'book';
window.FA_HEADINGS_FILTER = '';
window.FA_HEADINGS_ALL_TEXT = false;

window.currentMehlmanSheet = {
  headingKey: '',
  sectionSlug: '',
  page: '',
  title: '',
  cards: [],
  currentIndex: 0,
  revealed: false,
  fontSize: 'normal'
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

// Slugify matching zetchy exactly
function slugify(title) {
  return String(title || '').toLowerCase()
    .replace(/[—–]/g, '-')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

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

async function loadFaMarkersData() {
  if (window.FA_MARKERS_DATA) return window.FA_MARKERS_DATA;
  try {
    const res = await fetch('/api/fa/markers');
    const json = await res.json();
    if (json.success && Array.isArray(json.markers)) {
      window.FA_MARKERS_DATA = json.markers;
    }
  } catch (e) {
    console.warn('[FA Markers] Failed to load markers:', e.message);
    window.FA_MARKERS_DATA = [];
  }
  return window.FA_MARKERS_DATA;
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
// PART 4: HEADINGS LIST ("Contents" drawer)
// ============================================================
function renderGroupLabel(groupName) {
  return `<div class="fa-toc-group-label px-3 pt-3.5 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-500 select-none pointer-events-none border-b border-[#2d1b40]/40 mb-0.5">${_hesc(groupName)}</div>`;
}

function renderMehlmanBadge(show, sectionSlug, page, title) {
  if (show) {
    const escTitle = _hesc(title).replace(/'/g, "&#39;");
    const hSlug = slugify(title);
    return `<button onclick="event.stopPropagation(); openMehlmanSheet('${sectionSlug}', '${page || ''}', '${escTitle}', '${hSlug}')" class="fa-toc-m-badge inline-flex items-center justify-center w-5 h-5 rounded bg-pink-600 hover:bg-pink-500 text-white text-[9px] font-black shrink-0 select-none transition-all active:scale-95 cursor-pointer shadow-sm" title="Mehlman HY content for ${_hesc(title)}">M</button>`;
  }
  return `<span class="fa-toc-m-placeholder inline-block w-5 h-5 shrink-0"></span>`;
}

// Circle button with "-" (minus) symbol on EVERY row
function renderMenuButton(rowIdx, pageNum, titleEsc, isLevel1, parentPageNum) {
  const navPage = isLevel1 ? (parentPageNum || pageNum) : pageNum;
  return `<button class="fa-toc-menu-btn w-6 h-6 rounded-full border border-[#4b2d6b] bg-[#1e1030]/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#3d2258] hover:border-pink-500/60 transition-all shrink-0 text-[12px] font-black leading-none active:scale-95"
    onclick="event.stopPropagation(); faHeadingMenuAction(${rowIdx}, ${navPage || 'null'}, '${_hesc(titleEsc).replace(/'/g, "&#39;")}', event)"
    title="Options for ${_hesc(titleEsc)}">&minus;</button>`;
}

function renderHeadingRow(row, rowIdx, currentPageNum, sectionSlug) {
  const isLevel1 = row.level === 1;
  const pageNum = row.page ? parseInt(row.page, 10) : null;
  const parentPageNum = row.parentPage ? parseInt(row.parentPage, 10) : null;
  const navPage = isLevel1 ? (parentPageNum || currentPageNum) : pageNum;

  // Highlight rule: exactly ONE current row at a time matching current reader page
  const isCurrent = currentPageNum !== null && (!isLevel1 && pageNum === currentPageNum);

  const titleColor = isCurrent
    ? 'text-pink-400 font-bold'
    : (isLevel1 ? 'text-slate-400 font-normal' : 'text-slate-100 font-semibold');

  const rowBg = isCurrent
    ? 'bg-[#2a1038] border border-pink-600/40 rounded-xl fa-toc-active-row'
    : 'hover:bg-[#1a0f27] rounded-xl';

  // Page number ONLY for level 0
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

  rows.forEach((row) => {
    if (!q && row.group && row.group !== lastGroup) {
      lastGroup = row.group;
      html += renderGroupLabel(row.group);
    }
    html += renderHeadingRow(row, row.order, currentPageNum, secSlug);
  });

  return html;
}

// ============================================================
// PART 1: READER PAGE + MARKER OVERLAY
// Markers overlay directly on page image container matching zetchy.net:
// - Exact coordinates from zetchy_reader_markers.json:
//   left: xRatio * 100%, top: yRatio * 100%, transform: translate(-50%, -50%)
// - Column 1 (xRatio ~0.0348, outer/left) vs Column 2 (xRatio ~0.065, inner/right)
// - Percentage coordinates scale with zoom and window resize
// ============================================================
function renderFaGutterMarkers(sectionName, pageNum, matchingTopics) {
  const container = document.getElementById('fa-page-markers-layer');
  if (!container) return;

  container.innerHTML = '';

  const secSlug = SECTION_TO_SYS_KEY[sectionName] || 'cvs';
  const allMarkers = window.FA_MARKERS_DATA || [];
  const pageMarkers = allMarkers.filter(m => m.page === pageNum);

  // If no marker data for this page: render nothing, NO ERRORS, NO FAKE MARKERS
  if (pageMarkers.length === 0) {
    return;
  }

  let html = '';

  pageMarkers.forEach((m, idx) => {
    // Exact percentage coordinates from zetchy.net
    const leftPct = (m.xRatio * 100).toFixed(3);
    const topPct = (m.yRatio * 100).toFixed(3);
    const hSlug = m.h;
    const titleEsc = _hesc(m.title || hSlug).replace(/'/g, "&#39;");

    if (m.kind === 'M') {
      const qCount = m.mehlmanCount || null;
      html += `
        <div class="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10"
             style="left: ${leftPct}%; top: ${topPct}%;">
          <button onclick="event.stopPropagation(); openMehlmanSheet('${secSlug}', '${pageNum}', '${titleEsc}', '${hSlug}', ${qCount || 'null'})"
            data-h="${_hesc(hSlug)}"
            class="w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] rounded-full bg-[#1b0f2a] hover:bg-pink-600 border border-pink-500/80 flex items-center justify-center text-white text-[10px] font-black shadow-lg transition-transform hover:scale-110 active:scale-95 pointer-events-auto cursor-pointer"
            title="${qCount ? qCount + ' Mehlman questions' : 'Mehlman: ' + titleEsc}">M</button>
        </div>`;
    } else if (m.kind === 'dots') {
      const popoverId = `popover-dots-${idx}`;
      html += `
        <div class="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10"
             style="left: ${leftPct}%; top: ${topPct}%;">
          <div class="relative flex items-center justify-center">
            <button onclick="event.stopPropagation(); toggleHeadingPopover('${popoverId}')"
              data-h="${_hesc(hSlug)}"
              class="w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] rounded-full bg-white/95 hover:bg-white text-[#180e22] border border-white/80 flex items-center justify-center text-xs font-black shadow-lg transition-transform hover:scale-110 active:scale-95 pointer-events-auto cursor-pointer"
              title="Actions: ${titleEsc}">
              <span class="tracking-tighter">⋯</span>
            </button>
            ${renderHeadingPopoverHtml(popoverId, m, secSlug, pageNum, matchingTopics)}
          </div>
        </div>`;
    }
  });

  container.innerHTML = html;
}

// Re-align gutter markers when window resizes or images panel toggles
window.addEventListener('resize', () => {
  if (window.state && window.state.currentFaPage) {
    const sys = window.state.currentFaSystem;
    renderFaGutterMarkers(sys ? sys.name : '', window.state.currentFaPage, window._faPageTopics);
  }
});

// ============================================================
// PART 3: HEADING ACTION POPOVER (5 round buttons)
// ============================================================
function renderHeadingPopoverHtml(popoverId, marker, secSlug, pageNum, matchingTopics) {
  const hSlug = marker.h;
  const rawTitle = marker.title ? marker.title.replace(/^Open:\s*/, '') : hSlug.replace(/-/g, ' ');
  const titleEsc = _hesc(rawTitle);

  // Find real topic in app data if exists
  const matchedTopic = (matchingTopics || []).find(t =>
    slugify(t.title) === hSlug || (t.title || '').toLowerCase().includes(rawTitle.toLowerCase())
  );
  const topicIdx = matchedTopic ? (window._faPageTopics || []).indexOf(matchedTopic) : 0;
  const realImgCount = matchedTopic ? (matchedTopic.images || []).length : 0;
  const realTblCount = matchedTopic ? (matchedTopic.tables || []).length : 0;
  const realQCount = (matchedTopic && typeof getQuestionsForTopic === 'function')
    ? getQuestionsForTopic(matchedTopic).length
    : 0;

  return `<div id="${popoverId}" class="hidden absolute left-9 top-0 bg-[#160d21]/95 backdrop-blur-md border border-[#3b2352] rounded-3xl p-4 shadow-2xl min-w-[280px] z-40 pointer-events-auto text-left animate-in zoom-in-95">
    <!-- Title row: single line, ellipsis, bold -->
    <div class="text-xs font-bold text-white mb-3 truncate max-w-[260px]">${titleEsc}</div>
    <!-- Row of 5 round icon buttons (~48-56px styled) -->
    <div class="flex items-center gap-2.5 justify-between">
      <!-- 1) Play review: big pink/red filled circle with white play triangle -->
      <button onclick="openSketchFromFA(${topicIdx}); closeAllHeadingPopovers();"
        class="w-11 h-11 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
        title="Start review for ${titleEsc}">
        <svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </button>

      <!-- 2) Table/grid icon: light blue circle with pink count badge -->
      <button onclick="openFaTopicActions(${topicIdx}); switchFaPanelTab('img'); closeAllHeadingPopovers();"
        class="relative w-11 h-11 rounded-full bg-[#1b2b45] hover:bg-[#23385a] border border-sky-500/40 text-sky-300 flex items-center justify-center shadow transition-transform hover:scale-105 active:scale-95"
        title="Images / Tables">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
        ${realImgCount > 0 ? `<span class="absolute -top-1 -right-1 bg-pink-600 text-[10px] font-black text-white rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow">${realImgCount}</span>` : ''}
      </button>

      <!-- 3) Check mark: dark circle with white check & pink count badge -->
      <button onclick="openWhichQuestionsModal(${topicIdx}); closeAllHeadingPopovers();"
        class="relative w-11 h-11 rounded-full bg-[#1e142b] hover:bg-[#2b1c3e] border border-[#5a3880] text-emerald-400 flex items-center justify-center shadow transition-transform hover:scale-105 active:scale-95"
        title="Practice Questions">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        ${realQCount > 0 ? `<span class="absolute -top-1 -right-1 bg-pink-600 text-[10px] font-black text-white rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow">${realQCount}</span>` : ''}
      </button>

      <!-- 4) UWorld questions: light circle with "UW" text & pink count badge -->
      <button onclick="openFaTopicActions(${topicIdx}); switchFaPanelTab('tables'); closeAllHeadingPopovers();"
        class="relative w-11 h-11 rounded-full bg-[#201c36] hover:bg-[#2c264a] border border-indigo-400/40 text-indigo-300 flex items-center justify-center shadow transition-transform hover:scale-105 active:scale-95"
        title="UWorld Tables">
        <span class="text-xs font-black">UW</span>
        ${realTblCount > 0 ? `<span class="absolute -top-1 -right-1 bg-pink-600 text-[10px] font-black text-white rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow">${realTblCount}</span>` : ''}
      </button>

      <!-- 5) Notes/edit: light yellow circle with pencil icon -->
      <button onclick="openFaTopicActions(${topicIdx}); switchFaPanelTab('notes'); closeAllHeadingPopovers();"
        class="w-11 h-11 rounded-full bg-[#332b1b] hover:bg-[#453922] border border-amber-400/40 text-amber-300 flex items-center justify-center shadow transition-transform hover:scale-105 active:scale-95"
        title="Notes">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
      </button>
    </div>
  </div>`;
}

function toggleHeadingPopover(id) {
  const pop = document.getElementById(id);
  if (!pop) return;
  const isHidden = pop.classList.contains('hidden');
  closeAllHeadingPopovers();
  if (isHidden) pop.classList.remove('hidden');
}

function closeAllHeadingPopovers() {
  document.querySelectorAll('[id^="popover-dots-"]').forEach(el => el.classList.add('hidden'));
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('[id^="popover-dots-"]') && !e.target.closest('button[data-h]')) {
    closeAllHeadingPopovers();
  }
});

// ============================================================
// PART 2: MEHLMAN BOTTOM SHEET
// ============================================================
async function openMehlmanSheet(sectionSlug, page, title, hSlug, expectedCount) {
  closeAllHeadingPopovers();
  await loadMehlmanCardsData();

  const slug = hSlug || slugify(title);
  const data = window.MEHLMAN_CARDS_DATA || {};

  // Lookup priority:
  // 1) exact slug + page key
  // 2) slug alone
  // 3) legacy key
  let cards = data[`${sectionSlug}|${page}|${slug}`] ||
              data[slug] ||
              data[`${sectionSlug}|${page}|${title}`] || [];

  window.currentMehlmanSheet = {
    headingKey: `${sectionSlug}|${page}|${slug}`,
    sectionSlug,
    page,
    title: title ? title.replace(/^Open:\s*/, '') : slug.replace(/-/g, ' '),
    cards,
    currentIndex: 0,
    revealed: false,
    expectedCount: expectedCount || (cards.length > 0 ? cards.length : null),
    fontSize: window.currentMehlmanSheet.fontSize || 'normal'
  };

  const modal = document.getElementById('modal-mehlman-sheet');
  if (!modal) return;

  renderMehlmanSheetCard();
  modal.classList.remove('hidden');
  window.addEventListener('keydown', handleMehlmanSheetKeydown);
}

function closeMehlmanSheet() {
  const modal = document.getElementById('modal-mehlman-sheet');
  if (modal) modal.classList.add('hidden');
  window.removeEventListener('keydown', handleMehlmanSheetKeydown);
}

function handleMehlmanBackdropClick(e) {
  if (e.target.id === 'modal-mehlman-sheet') closeMehlmanSheet();
}

function handleMehlmanSheetKeydown(e) {
  if (e.key === 'Escape') closeMehlmanSheet();
  else if (e.key === 'ArrowRight') nextMehlmanCard();
  else if (e.key === 'ArrowLeft') prevMehlmanCard();
  else if (e.key === ' ') {
    e.preventDefault();
    revealMehlmanAnswer();
  }
}

function renderMehlmanSheetCard() {
  const state = window.currentMehlmanSheet;
  const cards = state.cards || [];
  const total = cards.length;
  const idx = state.currentIndex;

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
    if (counterEl) counterEl.textContent = state.expectedCount ? `0 / ${state.expectedCount}` : '0 / 0';
    if (progressEl) progressEl.style.width = '100%';
    if (questionEl) questionEl.textContent = 'No Mehlman cards linked yet';
    if (tapHint) tapHint.innerHTML = '<span class="text-slate-500 italic">No Mehlman cards linked yet</span>';
    if (revealedText) revealedText.classList.add('hidden');
    if (showBtn) showBtn.classList.add('hidden');
    if (ratingBtns) ratingBtns.classList.add('hidden');
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  const displayTotal = state.expectedCount || total;
  if (counterEl) counterEl.textContent = `${idx + 1} / ${displayTotal}`;
  if (progressEl) progressEl.style.width = `${((idx + 1) / displayTotal) * 100}%`;

  const curCard = cards[idx];
  if (questionEl) {
    questionEl.textContent = curCard.q;
    questionEl.className = state.fontSize === 'large'
      ? 'text-base sm:text-lg font-bold text-white leading-relaxed min-h-[48px]'
      : 'text-sm sm:text-base font-bold text-white leading-relaxed min-h-[48px]';
  }

  if (state.revealed) {
    if (tapHint) tapHint.classList.add('hidden');
    if (revealedText) {
      revealedText.classList.remove('hidden');
      revealedText.textContent = curCard.a;
      revealedText.className = state.fontSize === 'large'
        ? 'text-sm sm:text-base text-slate-100 leading-relaxed text-left w-full font-medium'
        : 'text-xs sm:text-sm text-slate-200 leading-relaxed text-left w-full';
    }
    if (showBtn) showBtn.classList.add('hidden');
    if (ratingBtns) ratingBtns.classList.remove('hidden');
  } else {
    if (tapHint) tapHint.classList.remove('hidden');
    if (revealedText) revealedText.classList.add('hidden');
    if (showBtn) showBtn.classList.remove('hidden');
    if (ratingBtns) ratingBtns.classList.add('hidden');
  }

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
// SPACED REPETITION (EASY / FORGOT)
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

  updateSystemRatingCounters(s.sectionSlug);

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
// NAVIGATION & HEADER CONTROLS
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

// ============================================================
// INITIALIZATION
// ============================================================
async function initFaHeadings() {
  await Promise.all([loadFaHeadingsData(), loadFaMarkersData(), loadMehlmanCardsData()]);
  console.log('[FA Headings] Module ready with JSON markers & Mehlman cards!');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFaHeadings);
} else {
  initFaHeadings();
}
