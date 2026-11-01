const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'public', 'js', 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

const targetStart = 'function openFaBookPage(pageNum, topic = null) {';
const targetEnd = 'function filterUWorldIncorrects() {';

const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd);

if (startIndex === -1 || endIndex === -1) {
  console.error('Target block not found!');
  process.exit(1);
}

const replacement = `function openFaBookPage(pageNum, topic = null) {
  state.currentFaPage = pageNum || 284;
  const sys = state.currentFaSystem || state.firstAidSystems.find(s => s.id === 'cvs');
  if (!topic && sys) {
    topic = (sys.topics || []).find(t => t.page === pageNum) || sys.topics[0];
  }
  state.currentFaTopic = topic;

  // Header breadcrumb update (System > Subject · Topic)
  const breadcrumb = document.getElementById('fa-reader-breadcrumb');
  const topIndicator = document.getElementById('fa-top-page-indicator');
  const bottomIndicator = document.getElementById('fa-bottom-page-indicator');
  const tocSysTitle = document.getElementById('fa-toc-system-title');

  if (breadcrumb && sys) {
    const subjObj = (sys.subjects || []).find(s => s.key === (topic && topic.subject));
    const subjName = subjObj ? subjObj.name : (topic && topic.subject ? topic.subject.toUpperCase() : '');
    const topicTitle = topic ? topic.title : '';
    breadcrumb.innerHTML = \`
      <span class="hover:text-pink-400 cursor-pointer font-bold" onclick="renderFaBookTOC()">\${sys.name}</span>
      \${subjName ? \`<span class="text-slate-500 font-normal mx-1">&rsaquo;</span><span class="text-slate-300 font-medium">\${subjName}</span>\` : ''}
      \${topicTitle ? \`<span class="text-slate-500 font-normal mx-1">&middot;</span><span class="text-white font-bold truncate max-w-[220px]">\${topicTitle}</span>\` : ''}
    \`;
  }
  if (tocSysTitle && sys) tocSysTitle.textContent = sys.name;
  if (topIndicator) topIndicator.textContent = \`p. \${state.currentFaPage}\`;
  if (bottomIndicator) bottomIndicator.textContent = \`< \${state.currentFaPage} / 844 >\`;

  // Try loading real book page scan
  const pageImg = document.getElementById('fa-reader-page-img');
  if (pageImg) {
    pageImg.src = \`/fa-page/\${state.currentFaPage}.webp\`;
  }

  // Fallback layout when raw image is offline
  const fallbackTitle = document.getElementById('fallback-page-title');
  const fallbackSecTag = document.getElementById('fallback-sec-tag');
  const fallbackPageNum = document.getElementById('fallback-page-num');
  const subtopicsList = document.getElementById('fallback-subtopics-list');
  const tablesArea = document.getElementById('fallback-tables-area');
  const imagesArea = document.getElementById('fallback-images-area');

  if (fallbackTitle && topic) fallbackTitle.textContent = topic.title;
  if (fallbackSecTag && sys) fallbackSecTag.textContent = \`\${sys.name.toUpperCase()} \\u203a \${(topic.subject || 'HIGH-YIELD').toUpperCase()}\`;
  if (fallbackPageNum) fallbackPageNum.textContent = state.currentFaPage;

  if (subtopicsList) {
    const subs = (topic && topic.subs) || [];
    if (subs.length > 0) {
      subtopicsList.innerHTML = subs.map(s => \`
        <div class="p-3 bg-[#170e20] rounded-xl border border-[#3b2452] flex items-center justify-between">
          <span class="text-xs font-bold text-slate-200">\${s.title}</span>
          <span class="text-[10px] font-mono text-pink-400">p.\${s.page || state.currentFaPage}</span>
        </div>
      \`).join('');
    } else {
      subtopicsList.innerHTML = \`<div class="p-4 bg-[#170e20] rounded-xl border border-[#3b2452] text-xs text-slate-300">\${topic.title} details and high-yield associations.</div>\`;
    }
  }

  // UWorld Tables
  if (tablesArea) {
    const tables = (topic && topic.tables) || [];
    if (tables.length > 0) {
      tablesArea.innerHTML = tables.map(tb => \`
        <div class="bg-[#170e20] border border-[#38234f] rounded-xl p-4 overflow-x-auto text-xs text-slate-200">
          <h4 class="font-bold text-sky-400 mb-2 flex items-center gap-1.5"><span>📊</span> \${tb[1] || 'Table'}</h4>
          <div class="fa-uworld-table">\${tb[2] || ''}</div>
        </div>
      \`).join('');
    } else {
      tablesArea.innerHTML = '';
    }
  }

  // UWorld Images
  if (imagesArea) {
    const images = (topic && topic.images) || [];
    if (images.length > 0) {
      imagesArea.innerHTML = images.map(im => \`
        <div class="bg-[#170e20] border border-[#38234f] rounded-xl p-3 flex items-center justify-between">
          <span class="text-xs text-slate-300 font-medium">\${im[1]}</span>
          <span class="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">\${im[0]}</span>
        </div>
      \`).join('');
    } else {
      imagesArea.innerHTML = '';
    }
  }

  // Render left sidebar TOC
  renderFaBookTOC();

  // Render callout overlays on the book page (defined in fa_panel.js)
  if (typeof renderFaPageCallouts === 'function') renderFaPageCallouts();

  // Show modal
  document.getElementById('modal-fa-book').classList.remove('hidden');
}

function renderFaBookTOC(topicsList = null) {
  const tocList = document.getElementById('fa-reader-toc-list');
  const sys = state.currentFaSystem;
  if (!tocList || !sys) return;

  const topics = topicsList || sys.topics || [];
  const subjectsMap = {};
  (sys.subjects || []).forEach(s => { subjectsMap[s.key] = s.name; });

  let html = '';
  let lastSubject = null;

  topics.forEach((t) => {
    const subjKey = t.subject || 'general';
    const subjName = subjectsMap[subjKey] || (subjKey ? subjKey.toUpperCase() : 'HIGH-YIELD');

    if (subjKey !== lastSubject && !topicsList) {
      lastSubject = subjKey;
      html += \`
        <div class="px-2 pt-4 pb-1.5 text-[10px] font-black uppercase tracking-wider text-pink-400/90 border-b border-[#2d1b40]/50 mb-1 flex items-center justify-between">
          <span>\${subjName}</span>
        </div>
      \`;
    }

    const isAct = state.currentFaTopic && (state.currentFaTopic.id === t.id || state.currentFaTopic.title === t.title);
    const hasSubs = (t.subs || []).length > 0;
    const isExpanded = isAct || (state.expandedTopics && state.expandedTopics[t.id]);
    const imgCount = (t.images || []).length;

    html += \`
      <div class="space-y-0.5">
        <div onclick="selectFaTopic('\${t.id}', \${t.page})" 
             class="p-2 rounded-xl cursor-pointer text-xs transition-colors flex items-center justify-between \${isAct ? 'bg-[#3b1d42] border border-pink-500/50 text-white font-bold' : 'hover:bg-[#1f132a] text-slate-300'}">
          <div class="flex items-center gap-2.5 truncate">
            <span class="text-[10px] text-slate-500 font-mono w-7 shrink-0">\${t.page || ''}</span>
            <span class="truncate \${isAct ? 'text-pink-300 font-bold' : 'text-slate-200'}">\${t.title}</span>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            \${imgCount > 0 ? \`<span class="text-[9px] px-1.5 py-0.5 bg-amber-950/60 text-amber-400 rounded-full border border-amber-900/40">\${imgCount}</span>\` : ''}
            <span class="text-slate-600 text-[10px] font-mono">\${hasSubs ? (isExpanded ? '&minus;' : '&plus;') : '&minus;'}</span>
          </div>
        </div>

        \${hasSubs ? \`
          <div class="pl-8 pr-1 space-y-0.5 \${isExpanded ? '' : 'hidden'}" id="subs-\${t.id}">
            \${t.subs.map(s => {
              const isSubAct = state.currentFaSubtopic && (state.currentFaSubtopic.id === s.id || state.currentFaSubtopic.title === s.title);
              const subImgCount = (s.images || []).length;
              return \`
                <div onclick="selectFaSubtopic('\${t.id}', '\${s.id}', \${s.page || t.page})"
                     class="py-1 px-2 rounded-lg cursor-pointer text-[11px] transition-colors flex items-center justify-between \${isSubAct ? 'text-pink-300 font-bold bg-pink-950/50 border border-pink-900/50' : 'text-slate-400 hover:text-white hover:bg-[#1c102a]'}">
                  <span class="truncate">\${s.title}</span>
                  <div class="flex items-center gap-1 shrink-0">
                    \${subImgCount > 0 ? \`<span class="text-[8px] px-1 bg-amber-950/60 text-amber-400 rounded">\${subImgCount}</span>\` : ''}
                    <span class="text-slate-600 text-[9px] font-mono">&minus;</span>
                  </div>
                </div>
              \`;
            }).join('')}
          </div>
        \` : ''}
      </div>
    \`;
  });

  tocList.innerHTML = html;
}

function filterFaTOC(query) {
  const q = (query || '').toLowerCase().trim();
  const sys = state.currentFaSystem;
  if (!sys) return;
  if (!q) { renderFaBookTOC(); return; }

  const filtered = (sys.topics || []).filter(t => {
    const matchTitle = (t.title || '').toLowerCase().includes(q);
    const matchSub = (t.subs || []).some(s => (s.title || '').toLowerCase().includes(q));
    return matchTitle || matchSub;
  });

  state.expandedTopics = {};
  filtered.forEach(t => { state.expandedTopics[t.id] = true; });
  renderFaBookTOC(filtered);
}

function toggleFaBookTableOfContents() {
  const toc = document.getElementById('fa-reader-toc');
  if (toc) toc.classList.toggle('hidden');
}

function closeFaBookReader() {
  const modal = document.getElementById('modal-fa-book');
  if (modal) modal.classList.add('hidden');
}

function nextFaBookPage() {
  const next = (state.currentFaPage || 284) + 1;
  if (next <= 844) openFaBookPage(next);
}

function prevFaBookPage() {
  const prev = (state.currentFaPage || 284) - 1;
  if (prev >= 1) openFaBookPage(prev);
}

`;

content = content.slice(0, startIndex) + replacement + content.slice(endIndex);
fs.writeFileSync(appJsPath, content, 'utf8');
console.log('Successfully updated app.js with section headings, subheadings, and breadcrumbs!');
