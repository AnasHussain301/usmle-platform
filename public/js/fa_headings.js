/**
 * FA HEADINGS MODULE — Zetchy-exact headings list & reader gutter
 * ================================================================
 * Source of truth: /api/fa/headings (zetchy_headings_all.json)
 *
 * Shared component set for ALL 13 sections:
 *   HeadingRow, GroupLabel, MehlmanBadge, MenuButton, ReaderGutterMarkers
 *
 * Data model:
 *   level 0 = main heading (has page number)
 *   level 1 = subheading (page is null, parentPage is used for navigation)
 *   group   = uppercase subject label — render GroupLabel when it changes
 *   hasM    = show "M" badge (Mehlman content exists)
 *   hasDots = show "..." menu button (always true for all rows)
 */

'use strict';

// ============================================================
// STATE
// ============================================================
window.FA_HEADINGS_DATA = null;   // { "Cardiovascular": [...], ... }
window.FA_HEADINGS_SORT = 'book'; // 'book' | 'weakest' | 'strongest'
window.FA_HEADINGS_FILTER = '';   // current search query
window.FA_HEADINGS_ALL_TEXT = false; // "All text" toggle for search

// Section name → system key mapping (matches parse_fa.js SYS_NAMES)
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

// System key → section name (reverse)
const SYS_KEY_TO_SECTION = Object.fromEntries(
  Object.entries(SECTION_TO_SYS_KEY).map(([k, v]) => [v, k])
);

// ============================================================
// LOAD HEADINGS DATA
// ============================================================
async function loadFaHeadingsData() {
  if (window.FA_HEADINGS_DATA) return window.FA_HEADINGS_DATA;
  try {
    const res = await fetch('/api/fa/headings');
    const json = await res.json();
    if (json.success && json.headings) {
      window.FA_HEADINGS_DATA = json.headings;
      console.log('[FA Headings] Loaded', Object.keys(json.headings).join(', '));
    }
  } catch (e) {
    console.warn('[FA Headings] Failed to load headings data:', e.message);
    window.FA_HEADINGS_DATA = {};
  }
  return window.FA_HEADINGS_DATA;
}

// Get headings for a given system key (e.g. 'cvs')
function getHeadingsForSysKey(sysKey) {
  if (!window.FA_HEADINGS_DATA) return [];
  const sectionName = SYS_KEY_TO_SECTION[sysKey];
  if (!sectionName) return [];
  return window.FA_HEADINGS_DATA[sectionName] || [];
}

// Get headings for a section name (e.g. 'Cardiovascular')
function getHeadingsForSection(sectionName) {
  if (!window.FA_HEADINGS_DATA) return [];
  return window.FA_HEADINGS_DATA[sectionName] || [];
}

// ============================================================
// HTML ESCAPE HELPER
// ============================================================
function _hesc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
// SHARED COMPONENT: GroupLabel
// A small non-clickable uppercase muted row for subject sections
// ============================================================
function renderGroupLabel(groupName) {
  return `<div class="fa-toc-group-label px-3 pt-4 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-500 select-none pointer-events-none border-b border-[#2d1b40]/40 mb-0.5">${_hesc(groupName)}</div>`;
}

// ============================================================
// SHARED COMPONENT: MehlmanBadge
// Small pink rounded square with white "M"
// ============================================================
function renderMehlmanBadge(show) {
  if (show) {
    return `<span class="fa-toc-m-badge inline-flex items-center justify-center w-5 h-5 rounded bg-pink-600 text-white text-[9px] font-black shrink-0 select-none" title="Mehlman HY content available">M</span>`;
  }
  // Empty placeholder of same width to keep alignment
  return `<span class="fa-toc-m-placeholder inline-block w-5 h-5 shrink-0"></span>`;
}

// ============================================================
// SHARED COMPONENT: MenuButton (outlined circle with "⋯")
// ============================================================
function renderMenuButton(rowIdx, pageNum, titleEsc, isLevel1, parentPageNum) {
  const navPage = isLevel1 ? (parentPageNum || pageNum) : pageNum;
  return `<button class="fa-toc-menu-btn w-6 h-6 rounded-full border border-[#4b2d6b] bg-[#1e1030]/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#3d2258] hover:border-pink-500/60 transition-all shrink-0 text-[12px] font-black leading-none active:scale-95"
    onclick="event.stopPropagation(); faHeadingMenuAction(${rowIdx}, ${navPage || 'null'}, '${_hesc(titleEsc).replace(/'/g, "&#39;")}', event)"
    title="Options for ${_hesc(titleEsc)}">⋯</button>`;
}

// ============================================================
// SHARED COMPONENT: HeadingRow
// Fixed-column grid: [page ~40px] [title flex:1] [M slot ~28px] [menu slot ~36px]
// ============================================================
function renderHeadingRow(row, rowIdx, isCurrentPage, currentPageNum) {
  const isLevel1 = row.level === 1;
  const pageNum = row.page ? parseInt(row.page, 10) : null;
  const parentPageNum = row.parentPage ? parseInt(row.parentPage, 10) : null;
  const navPage = isLevel1 ? (parentPageNum || currentPageNum) : pageNum;

  // Determine highlight: current page matches this heading's page (level 0)
  // or this subheading's parentPage (level 1)
  const isCurrent = isCurrentPage && (
    (!isLevel1 && pageNum === currentPageNum) ||
    (isLevel1 && parentPageNum === currentPageNum)
  );

  // Title color: pink if current, else use JSON color (slate-200 for level 0, slate-400 for level 1)
  const titleColor = isCurrent
    ? 'text-pink-400 font-semibold'
    : (isLevel1 ? 'text-slate-400' : 'text-slate-200 font-medium');

  const rowBg = isCurrent
    ? 'bg-[#2a1038] border border-pink-600/30 rounded-xl'
    : 'hover:bg-[#1a0f27] rounded-xl';

  const pageLabel = (!isLevel1 && pageNum)
    ? `<span class="text-[10px] font-mono text-slate-500 w-9 shrink-0 text-right pr-1">${pageNum}</span>`
    : `<span class="w-9 shrink-0"></span>`;

  const mBadge = renderMehlmanBadge(row.hasM === true);

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
// RENDER FULL TOC FOR A SECTION
// ============================================================
function renderFaHeadingsTOC(sectionNameOrSysKey, currentPageNum, sortMode, filterQuery, allText) {
  // Resolve section name
  let sectionName = sectionNameOrSysKey;
  if (SECTION_TO_SYS_KEY[sectionNameOrSysKey] === undefined && SYS_KEY_TO_SECTION[sectionNameOrSysKey]) {
    sectionName = SYS_KEY_TO_SECTION[sectionNameOrSysKey];
  }

  let rows = getHeadingsForSection(sectionName);
  if (!rows || rows.length === 0) return '<div class="p-4 text-slate-500 text-xs">Loading headings...</div>';

  // Filter
  const q = (filterQuery || '').toLowerCase().trim();
  if (q) {
    rows = rows.filter(r => (r.title || '').toLowerCase().includes(q));
  }

  // Sort
  const sort = sortMode || 'book';
  if (sort === 'book') {
    rows = rows.slice().sort((a, b) => a.order - b.order);
  }
  // 'weakest' and 'strongest' would need score data — keep book order for now

  // Render
  let html = '';
  let lastGroup = null;

  // "Copy UWorld IDs" pill — always at top
  html += `<div class="fa-toc-uworld-pill flex items-center gap-2 px-3 py-2 mb-1">
    <button onclick="copyUWorldIds('${_hesc(sectionName)}')" class="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 text-[11px] font-semibold transition-colors">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
      Copy UWorld IDs · headings under 50%
    </button>
  </div>`;

  rows.forEach((row, idx) => {
    // Group label: render when group changes (only skip when filtering)
    if (!q && row.group && row.group !== lastGroup) {
      lastGroup = row.group;
      html += renderGroupLabel(row.group);
    }
    html += renderHeadingRow(row, row.order, currentPageNum !== null, currentPageNum);
  });

  return html;
}

// ============================================================
// READER GUTTER MARKERS — replace callout overlay system
// Uses JSON hasM/hasDots per heading matched to current page
// ============================================================

/**
 * Get the gutter markers for a given page number and section.
 * Returns array of { title, hasM, hasDots, topPct } objects.
 */
function getGutterMarkersForPage(sectionName, pageNum) {
  const rows = getHeadingsForSection(sectionName);
  if (!rows || rows.length === 0) return [];

  // Find level-0 rows on this exact page
  const pageRows = rows.filter(r => r.level === 0 && parseInt(r.page, 10) === pageNum);
  return pageRows;
}

/**
 * Render reader gutter markers for the current page.
 * Called instead of (or alongside) renderFaPageCallouts().
 *
 * Layout rules (from spec):
 *   - If hasM: dark circular "M" badge + "..." circle immediately to its right
 *   - If no M: only "..." circle at the SAME x-position as when M is present
 *   - Positioned absolutely, left side of #fa-page-stage
 *   - Only for headings in JSON; never guessed.
 */
function renderFaGutterMarkers(sectionName, pageNum, matchingTopics) {
  const layer = document.getElementById('fa-page-callouts-layer');
  if (!layer) return;

  const pageRows = getGutterMarkersForPage(sectionName, pageNum);

  // If no JSON data for this page, fall back to current topic-based callouts
  if (pageRows.length === 0) {
    // Use legacy renderFaPageCallouts if available
    if (typeof renderFaPageCallouts === 'function') renderFaPageCallouts();
    return;
  }

  const totalRows = pageRows.length;
  let html = '';

  pageRows.forEach((row, idx) => {
    // Vertical positioning: evenly distributed from ~12% to ~88%
    let topPct;
    if (totalRows === 1) {
      topPct = 12;
    } else if (totalRows === 2) {
      topPct = idx === 0 ? 12 : 55;
    } else if (totalRows === 3) {
      topPct = [12, 42, 72][idx];
    } else {
      const startPct = 12;
      const spanPct = 72;
      topPct = Math.round(startPct + (idx / Math.max(1, totalRows - 1)) * spanPct);
    }

    const calloutId = `callout-h-${idx}`;

    // M badge (always rendered as placeholder if hasM is false, to keep x-alignment)
    const mBadgeHtml = row.hasM
      ? `<div class="gutter-m-badge w-6 h-6 rounded-full bg-[#1e1030] border border-pink-600/80 flex items-center justify-center text-pink-300 text-[9px] font-black shadow-md shrink-0" title="Mehlman content available for ${_hesc(row.title)}">M</div>`
      : `<div class="gutter-m-placeholder w-6 h-6 shrink-0"></div>`;

    // "..." button (always rendered since hasDots is always true per spec)
    const dotsHtml = `<button class="gutter-dots-btn w-6 h-6 rounded-full bg-[#1e102e]/95 hover:bg-[#3d2258] border border-[#6b3e94] flex items-center justify-center text-slate-200 hover:text-white transition-all shadow-md hover:scale-110 active:scale-95"
        onclick="toggleCalloutMenu('${calloutId}')"
        title="${_hesc(row.title)}">
      <span class="text-[11px] font-black leading-none select-none tracking-tighter">⋯</span>
    </button>`;

    // Find matching topic for this row (to get question count etc.)
    const matchedTopic = (matchingTopics || []).find(t =>
      (t.title || '').toLowerCase() === (row.title || '').toLowerCase()
    ) || (matchingTopics || [])[idx] || null;

    const qCount = matchedTopic && typeof getQuestionsForTopic === 'function'
      ? getQuestionsForTopic(matchedTopic).length
      : 0;
    const imgCount = matchedTopic ? (matchedTopic.images || []).length : 0;
    const tblCount = matchedTopic ? (matchedTopic.tables || []).length : 0;
    const topicIdx = matchedTopic
      ? ((window._faPageTopics || []).indexOf(matchedTopic) >= 0
          ? (window._faPageTopics || []).indexOf(matchedTopic)
          : idx)
      : idx;

    const isLearned = typeof isHeadingLearned === 'function' && isHeadingLearned(row.title);
    const learnedClass = isLearned
      ? 'bg-emerald-900/60 border-emerald-700/60 text-emerald-400'
      : 'bg-[#20152e] border-[#48286b] text-white';

    // Action menu popup
    const menuHtml = `<div id="${calloutId}" class="hidden absolute left-14 top-0 bg-[#160d21]/95 backdrop-blur-md border border-[#3b2352] rounded-2xl p-3 shadow-2xl max-w-[calc(100vw-70px)] min-w-[260px] z-30">
        <div class="text-xs font-bold text-white mb-2 truncate">${_hesc(row.title)}</div>
        <div class="flex items-center gap-2">
          <button onclick="openSketchFromFA(${topicIdx})"
            class="w-9 h-9 rounded-full bg-[#2c1c3f] border border-[#5a3880] flex items-center justify-center text-purple-300 hover:text-white transition-all shadow" title="Play Sketch">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <button onclick="openFaTopicActions(${topicIdx}); switchFaPanelTab('img');"
            class="relative w-9 h-9 rounded-full bg-[#20152e] hover:bg-[#2e1d40] border border-[#48286b] flex items-center justify-center text-slate-200 hover:text-white transition-all shadow" title="Images">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            ${imgCount > 0 ? `<span class="absolute -top-1 -right-1 bg-amber-500 text-[9px] font-black text-black rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow">${imgCount}</span>` : ''}
          </button>
          <button onclick="toggleCalloutMenu('${calloutId}'); openWhichQuestionsModal(${topicIdx});"
            class="relative w-9 h-9 rounded-full ${learnedClass} hover:bg-[#321c4a] border flex items-center justify-center text-white transition-all shadow hover:scale-105" title="Practice Questions (${qCount})">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            <span class="absolute -top-1 -right-1 bg-[#db2777] text-[9px] font-black text-white rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow">${qCount}</span>
          </button>
          <button onclick="openFaTopicActions(${topicIdx}); switchFaPanelTab('tables');"
            class="relative w-9 h-9 rounded-full bg-[#20152e] hover:bg-[#2e1d40] border border-[#48286b] flex items-center justify-center text-sky-400 hover:text-white transition-all shadow" title="UWorld Tables">
            <span class="text-[10px] font-bold">UW</span>
            ${tblCount > 0 ? `<span class="absolute -top-1 -right-1 bg-[#db2777] text-[9px] font-black text-white rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow">${tblCount}</span>` : ''}
          </button>
          <button onclick="openFaTopicActions(${topicIdx}); switchFaPanelTab('notes');"
            class="w-9 h-9 rounded-full bg-[#20152e] hover:bg-[#2e1d40] border border-[#48286b] flex items-center justify-center text-slate-300 hover:text-white transition-all shadow" title="Personal Notes">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          </button>
        </div>
      </div>`;

    // The gutter marker row: M placeholder + dots button + action menu
    html += `<div class="absolute pointer-events-auto flex items-center gap-1" style="top:${topPct}%;left:6px;z-index:25;transform:translateY(-50%);">
      ${mBadgeHtml}
      <div class="relative flex items-center">
        ${dotsHtml}
        ${menuHtml}
      </div>
    </div>`;
  });

  layer.innerHTML = html;

  // Store topics for compatibility with existing action handlers
  if (!window._faPageTopics && matchingTopics) {
    window._faPageTopics = matchingTopics;
  }
}

// ============================================================
// NAVIGATION HANDLERS
// ============================================================
function faHeadingRowClick(pageNum, title) {
  if (pageNum && typeof openFaBookPage === 'function') {
    // Find matching topic from current system
    const sys = window.state && window.state.currentFaSystem;
    const topic = sys && (sys.topics || []).find(t =>
      t.title === title || (t.page === pageNum && !title)
    );
    openFaBookPage(pageNum, topic || null);
  }
}

function faHeadingMenuAction(rowIdx, pageNum, title, event) {
  // Navigate to page and open the action menu for this heading
  faHeadingRowClick(pageNum, title);
  // After nav, trigger callout menu for this index
  setTimeout(() => {
    const calloutId = `callout-h-${rowIdx}`;
    if (typeof toggleCalloutMenu === 'function') toggleCalloutMenu(calloutId);
  }, 100);
}

function copyUWorldIds(sectionName) {
  const rows = getHeadingsForSection(sectionName);
  if (!rows || rows.length === 0) {
    alert('No headings found for this section.');
    return;
  }
  // Collect level-0 heading titles as UWorld IDs (filtered to "under 50%" — all for now)
  const ids = rows
    .filter(r => r.level === 0)
    .map(r => r.title)
    .join('\n');
  navigator.clipboard.writeText(ids).then(() => {
    // Show brief toast
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

// ============================================================
// TOC SORT STATE MANAGEMENT
// ============================================================
function setFaHeadingsSort(mode) {
  window.FA_HEADINGS_SORT = mode;
  refreshFaHeadingsTOC();

  // Update sort tab UI
  document.querySelectorAll('.fa-sort-tab').forEach(btn => {
    const isActive = btn.dataset.sort === mode;
    btn.className = btn.className
      .replace(/bg-\[#\w+\]|text-pink-400|border|border-pink-900\/60|text-slate-400/g, '').trim();
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
// INIT — called on app startup
// ============================================================
async function initFaHeadings() {
  await loadFaHeadingsData();
  console.log('[FA Headings] Module ready');
}

// Auto-init when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFaHeadings);
} else {
  initFaHeadings();
}

console.log('📋 FA Headings Module (JSON-driven, all 13 sections) loaded');
