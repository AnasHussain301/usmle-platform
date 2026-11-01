// ==========================================
// FIRST AID RIGHT PANEL: Images, Notes, Tables
// ==========================================

// State for carousel
if (!state.currentFaImagesList) state.currentFaImagesList = [];
if (!state.currentFaImageIndex) state.currentFaImageIndex = 0;
if (!state.currentFaPanelTopic) state.currentFaPanelTopic = null;

// Cache of page topics for callout lookups
window._faPageTopics = [];

// Open the (...) callout action menu for a heading on the book page by index
function openFaTopicActions(topicIdx) {
  const topic = window._faPageTopics[topicIdx];
  if (topic) openFaRightPanel(topic);
}

// Open the right-hand split panel with data for a specific topic
function openFaRightPanel(topic) {
  if (!topic) return;
  state.currentFaPanelTopic = topic;

  const panel = document.getElementById('fa-right-panel');
  if (!panel) return;
  panel.classList.remove('hidden');

  // Update heading title
  const titleEl = document.getElementById('fa-right-panel-heading-title');
  if (titleEl) titleEl.textContent = topic.title || 'Topic';

  // Set up images list
  state.currentFaImagesList = (topic.images || []);
  state.currentFaImageIndex = 0;

  // Set carousel title
  const carTitle = document.getElementById('fa-img-carousel-title');
  if (carTitle) carTitle.textContent = topic.title || 'Images';

  // Default to images tab
  switchFaPanelTab('img');

  // Load notes
  loadFaHeadingNote(topic.id || topic.title);

  // Render tables
  renderFaPanelTables(topic);
}

// Close right panel
function closeFaRightPanel() {
  const panel = document.getElementById('fa-right-panel');
  if (panel) panel.classList.add('hidden');
  state.currentFaPanelTopic = null;
}

// Switch between images / notes / tables tabs
function switchFaPanelTab(tab) {
  const imgView = document.getElementById('fa-panel-view-img');
  const notesView = document.getElementById('fa-panel-view-notes');
  const tablesView = document.getElementById('fa-panel-view-tables');
  const tabImg = document.getElementById('fa-panel-tab-img');
  const tabNotes = document.getElementById('fa-panel-tab-notes');
  const tabTables = document.getElementById('fa-panel-tab-tables');

  // Hide all views
  [imgView, notesView, tablesView].forEach(v => { if (v) v.classList.add('hidden'); });

  // Reset all tab styles
  const activeStyles = ['text-pink-400', 'bg-pink-950/60', 'border-pink-900/60'];
  const inactiveStyles = ['text-slate-400'];
  [tabImg, tabNotes, tabTables].forEach(t => {
    if (!t) return;
    activeStyles.forEach(cls => t.classList.remove(cls));
    inactiveStyles.forEach(cls => t.classList.add(cls));
  });

  // Activate selected tab
  let activeTab, activeView;
  if (tab === 'img') { activeTab = tabImg; activeView = imgView; }
  else if (tab === 'notes') { activeTab = tabNotes; activeView = notesView; }
  else if (tab === 'tables') { activeTab = tabTables; activeView = tablesView; }

  if (activeView) activeView.classList.remove('hidden');
  if (activeTab) {
    inactiveStyles.forEach(cls => activeTab.classList.remove(cls));
    activeStyles.forEach(cls => activeTab.classList.add(cls));
  }

  if (tab === 'img') renderFaImageCarousel();
}

// Render the current image in the carousel
function renderFaImageCarousel() {
  const imgs = state.currentFaImagesList || [];
  const idx = state.currentFaImageIndex || 0;
  const countEl = document.getElementById('fa-img-carousel-count');
  const mainImg = document.getElementById('fa-carousel-main-img');
  const captionEl = document.getElementById('fa-carousel-caption');

  if (imgs.length === 0) {
    if (countEl) countEl.textContent = '0 / 0';
    if (mainImg) mainImg.src = '';
    if (captionEl) captionEl.textContent = 'No images available for this topic.';
    return;
  }

  const item = imgs[idx];
  const imgId = item[0]; // e.g., "L46131"
  const caption = item[1] || '';

  if (countEl) countEl.textContent = (idx + 1) + ' / ' + imgs.length;
  if (mainImg) {
    mainImg.src = '/uw-img/' + imgId + '.webp';
    mainImg.onerror = function() {
      this.onerror = null;
      this.src = 'https://zetchy.net/uw-img/' + imgId + '.webp';
    };
  }
  if (captionEl) captionEl.textContent = caption;
}

// Navigate carousel
function nextFaCarouselImg() {
  const imgs = state.currentFaImagesList || [];
  if (imgs.length === 0) return;
  state.currentFaImageIndex = (state.currentFaImageIndex + 1) % imgs.length;
  renderFaImageCarousel();
}

function prevFaCarouselImg() {
  const imgs = state.currentFaImagesList || [];
  if (imgs.length === 0) return;
  state.currentFaImageIndex = (state.currentFaImageIndex - 1 + imgs.length) % imgs.length;
  renderFaImageCarousel();
}

// Render UWorld tables in the right panel
function renderFaPanelTables(topic) {
  const container = document.getElementById('fa-panel-tables-list');
  if (!container) return;

  const tables = (topic && topic.tables) || [];
  if (tables.length === 0) {
    container.innerHTML = '<div class="text-xs text-slate-400 p-4 text-center">No UWorld tables for this heading.</div>';
    return;
  }

  container.innerHTML = tables.map(function(tb) {
    return '<div class="bg-[#1a0f26] border border-[#38234f] rounded-xl p-4 overflow-x-auto">' +
      '<h4 class="text-xs font-bold text-sky-400 mb-2 flex items-center gap-1.5">' +
        '<span>\uD83D\uDCCA</span> ' + (tb[1] || 'UWorld Table') +
      '</h4>' +
      '<div class="fa-uworld-table text-xs text-slate-200">' + (tb[2] || '') + '</div>' +
    '</div>';
  }).join('');
}

// Save personal notes to localStorage
function saveFaCurrentHeadingNote() {
  var topic = state.currentFaPanelTopic;
  if (!topic) return;
  var key = 'fa_note_' + (topic.id || topic.title);
  var textarea = document.getElementById('fa-heading-note-input');
  if (!textarea) return;
  localStorage.setItem(key, textarea.value);

  // Show saved indicator briefly
  var status = document.getElementById('fa-note-save-status');
  if (status) {
    status.classList.remove('hidden');
    clearTimeout(window._noteSaveTimer);
    window._noteSaveTimer = setTimeout(function() { status.classList.add('hidden'); }, 2000);
  }
}

// Load notes from localStorage
function loadFaHeadingNote(topicId) {
  var key = 'fa_note_' + topicId;
  var textarea = document.getElementById('fa-heading-note-input');
  if (!textarea) return;
  textarea.value = localStorage.getItem(key) || '';
}

// ==========================================
// IN-PAGE CALLOUT OVERLAYS (...) on book page
// ==========================================

function renderFaPageCallouts() {
  var layer = document.getElementById('fa-page-callouts-layer');
  if (!layer) return;

  var sys = state.currentFaSystem || (state.firstAidSystems || []).find(function(s) { return s.id === 'cvs'; });
  if (!sys) { layer.innerHTML = ''; return; }

  var pageNum = state.currentFaPage || 284;

  // Find all topics that match this page number
  var matchingTopics = [];
  (sys.topics || []).forEach(function(t) {
    if (t.page === pageNum) {
      matchingTopics.push(t);
    }
  });

  // Store for lookup by index
  window._faPageTopics = matchingTopics;

  if (matchingTopics.length === 0) {
    layer.innerHTML = '';
    return;
  }

  // Render callout buttons - positioned along left side of the page
  var html = '';
  matchingTopics.forEach(function(topic, idx) {
    var topPx = 80 + idx * 120; // Stagger vertically
    var imgCount = (topic.images || []).length;
    var tblCount = (topic.tables || []).length;
    var calloutId = 'callout-' + idx;
    var learnedClass = isHeadingLearned(topic.id || topic.title)
      ? 'bg-emerald-900/60 border-emerald-700/60 text-emerald-400'
      : 'bg-slate-800/60 border-slate-600/50 text-slate-400';

    html += '<div class="absolute pointer-events-auto" style="top: ' + topPx + 'px; left: 12px; z-index: 20;">' +
      '<button onclick="toggleCalloutMenu(\'' + calloutId + '\')"' +
        ' class="w-8 h-8 rounded-full bg-[#2a1a3d]/90 border border-[#5a3580] flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#3d2258] transition-all shadow-lg backdrop-blur-sm"' +
        ' title="' + escHtml(topic.title) + '">' +
        '<span class="text-xs font-bold">\u22EF</span>' +
      '</button>' +

      '<div id="' + calloutId + '" class="hidden absolute left-10 top-0 bg-[#1e1330]/95 backdrop-blur-md border border-[#432960] rounded-2xl p-3 shadow-2xl min-w-[280px] z-30">' +
        '<div class="text-xs font-bold text-white mb-2 truncate">' + escHtml(topic.title) + '</div>' +
        '<div class="flex items-center gap-2">' +
          // Play
          '<button onclick="openSketchFromFA(' + idx + ')"' +
            ' class="w-9 h-9 rounded-full bg-purple-900/60 border border-purple-700/60 flex items-center justify-center text-purple-300 hover:text-white transition-all" title="Play Sketch">' +
            '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' +
          '</button>' +
          // Images
          '<button onclick="openFaTopicActions(' + idx + '); switchFaPanelTab(\'img\');"' +
            ' class="relative w-9 h-9 rounded-full bg-amber-900/40 border border-amber-700/50 flex items-center justify-center text-amber-300 hover:text-white transition-all" title="Images">' +
            '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>' +
            (imgCount > 0 ? '<span class="absolute -top-1 -right-1 bg-amber-500 text-[9px] font-bold text-black rounded-full w-4 h-4 flex items-center justify-center">' + imgCount + '</span>' : '') +
          '</button>' +
          // Checkmark
          '<button onclick="markFaHeadingLearned(\'' + escAttr(topic.id || topic.title) + '\', this)"' +
            ' class="w-9 h-9 rounded-full ' + learnedClass + ' flex items-center justify-center hover:text-emerald-400 transition-all" title="Mark Learned">' +
            '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>' +
          '</button>' +
          // UWorld Tables
          '<button onclick="openFaTopicActions(' + idx + '); switchFaPanelTab(\'tables\');"' +
            ' class="relative w-9 h-9 rounded-full bg-sky-900/40 border border-sky-700/50 flex items-center justify-center text-sky-300 hover:text-white transition-all" title="UWorld Tables">' +
            '<span class="text-[10px] font-bold">UW</span>' +
            (tblCount > 0 ? '<span class="absolute -top-1 -right-1 bg-sky-500 text-[9px] font-bold text-black rounded-full w-4 h-4 flex items-center justify-center">' + tblCount + '</span>' : '') +
          '</button>' +
          // Notes
          '<button onclick="openFaTopicActions(' + idx + '); switchFaPanelTab(\'notes\');"' +
            ' class="w-9 h-9 rounded-full bg-slate-800/60 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:text-white transition-all" title="Notes">' +
            '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  });

  layer.innerHTML = html;
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

  // Close all other open callout menus first
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

// Helper: try opening associated sketchy sketch from FA topic
function openSketchFromFA(topicIdx) {
  var topic = window._faPageTopics[topicIdx];
  if (!topic || !topic.sketch) {
    // Try to find by title match
    if (topic) {
      fetch('/api/sketches').then(function(r){ return r.json(); }).then(function(sketches) {
        var match = sketches.find(function(sk) {
          return sk.title.toLowerCase().includes((topic.title || '').toLowerCase().split(' ')[0]);
        });
        if (match) {
          openSketchDetail(match.id);
        } else {
          alert('No matching sketch found for: ' + topic.title);
        }
      });
    }
    return;
  }
  fetch('/api/sketches').then(function(r){ return r.json(); }).then(function(sketches) {
    var match = sketches.find(function(sk) {
      return sk.slug === topic.sketch ||
        sk.title.toLowerCase().includes((topic.title || '').toLowerCase().split(' ')[0]);
    });
    if (match) {
      openSketchDetail(match.id);
    } else {
      alert('No matching sketch found for: ' + topic.title);
    }
  });
}

// Close callout menus when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('[id^="callout-"]') && !e.target.closest('button[onclick*="toggleCalloutMenu"]')) {
    document.querySelectorAll('[id^="callout-"]').forEach(function(el) { el.classList.add('hidden'); });
  }
});

console.log('\u2705 FA Right Panel (Images/Notes/Tables) + Callout Overlays loaded');
