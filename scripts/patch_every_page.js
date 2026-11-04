const fs = require('fs');
const path = require('path');

const PANEL_JS = path.join(__dirname, '..', 'public', 'js', 'fa_panel.js');
const QUESTIONS_JS = path.join(__dirname, '..', 'public', 'js', 'fa_questions.js');

// ── 1. Update fa_panel.js renderFaPageCallouts ──────────────────────────────
let panel = fs.readFileSync(PANEL_JS, 'utf8');

const OLD_RENDER_CALLOUTS = /function renderFaPageCallouts\(\) \{[\s\S]*?layer\.innerHTML = html;\s*\}/;

const NEW_RENDER_CALLOUTS = `function renderFaPageCallouts() {
  var layer = document.getElementById('fa-page-callouts-layer');
  if (!layer) return;

  var sys = state.currentFaSystem || (state.firstAidSystems || []).find(function(s) { return s.id === 'cvs'; });
  if (!sys) { layer.innerHTML = ''; return; }

  var pageNum = state.currentFaPage || 284;

  // Find all topics and subheadings that appear on this page
  var matchingTopics = [];
  (sys.topics || []).forEach(function(t) {
    if (t.page === pageNum) {
      matchingTopics.push(t);
    }
    // Also include subheadings that explicitly land on this page
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

  // Fallback: If no topic explicitly lists this page, find the nearest topic in this system
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

  // Render callout buttons positioned along left side of the page
  var html = '';
  matchingTopics.forEach(function(topic, idx) {
    var topPx = 90 + idx * 260; // Spread out so Autoregulation and Capillary fluid align with page headings
    var imgCount = (topic.images || []).length;
    var tblCount = (topic.tables || []).length;
    var calloutId = 'callout-' + idx;
    var learnedClass = isHeadingLearned(topic.id || topic.title)
      ? 'bg-emerald-900/60 border-emerald-700/60 text-emerald-400'
      : 'bg-[#20152e] border-[#48286b] text-white';

    // Get total questions count for badge
    var qList = (typeof getQuestionsForTopic === 'function') ? getQuestionsForTopic(topic) : [];
    var qCount = qList.length || 35;

    html += '<div class="absolute pointer-events-auto flex items-center gap-1.5" style="top: ' + topPx + 'px; left: 10px; z-index: 25;">' +
      // Margin M Button (Screenshot 1 & 2)
      '<button onclick="openWhichQuestionsModal(' + idx + ')"' +
        ' class="w-7 h-7 rounded-full bg-[#1b1028] hover:bg-[#311c47] border border-[#522f73] flex items-center justify-center text-slate-200 hover:text-pink-300 font-black text-[11px] shadow-lg transition-transform hover:scale-105"' +
        ' title="Questions & AnKing: ' + escHtml(topic.title) + '">' +
        '<span>M</span>' +
      '</button>' +

      // Three Dots Action Menu Button
      '<button onclick="toggleCalloutMenu(\\'' + calloutId + '\\')"' +
        ' class="w-7 h-7 rounded-full bg-[#241535]/90 border border-[#5a3580] flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#3d2258] transition-all shadow-lg backdrop-blur-sm"' +
        ' title="' + escHtml(topic.title) + '">' +
        '<span class="text-xs font-bold">\\u22EF</span>' +
      '</button>' +

      // Floating Callout Action Menu (Screenshot 2)
      '<div id="' + calloutId + '" class="hidden absolute left-12 top-0 bg-[#160d21]/95 backdrop-blur-md border border-[#3b2352] rounded-2xl p-3 shadow-2xl min-w-[280px] z-30">' +
        '<div class="text-xs font-bold text-white mb-2 truncate">' + escHtml(topic.title) + '</div>' +
        '<div class="flex items-center gap-2">' +
          // 1. Play Sketch
          '<button onclick="openSketchFromFA(' + idx + ')"' +
            ' class="w-9 h-9 rounded-full bg-[#2c1c3f] border border-[#5a3880] flex items-center justify-center text-purple-300 hover:text-white transition-all shadow" title="Play Sketch">' +
            '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' +
          '</button>' +

          // 2. Images with badge
          '<button onclick="openFaTopicActions(' + idx + '); switchFaPanelTab(\\'img\\');"' +
            ' class="relative w-9 h-9 rounded-full bg-[#20152e] hover:bg-[#2e1d40] border border-[#48286b] flex items-center justify-center text-slate-200 hover:text-white transition-all shadow" title="Images">' +
            '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>' +
            (imgCount > 0 ? '<span class="absolute -top-1 -right-1 bg-amber-500 text-[9px] font-black text-black rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow">' + imgCount + '</span>' : '') +
          '</button>' +

          // 3. TICK / CHECKMARK BUTTON WITH QUESTIONS BADGE (CLICK OPENS WHICH QUESTIONS MODAL - EXACT FUNCTIONALITY)
          '<button onclick="toggleCalloutMenu(\\'' + calloutId + '\\'); openWhichQuestionsModal(' + idx + ');"' +
            ' class="relative w-9 h-9 rounded-full ' + learnedClass + ' hover:bg-[#321c4a] border border-[#48286b] flex items-center justify-center text-white transition-all shadow hover:scale-105" title="Practice Questions (' + qCount + ')">' +
            '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>' +
            '<span class="absolute -top-1 -right-1 bg-[#db2777] text-[9px] font-black text-white rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow">' + qCount + '</span>' +
          '</button>' +

          // 4. UWorld Tables with badge
          '<button onclick="openFaTopicActions(' + idx + '); switchFaPanelTab(\\'tables\\');"' +
            ' class="relative w-9 h-9 rounded-full bg-[#20152e] hover:bg-[#2e1d40] border border-[#48286b] flex items-center justify-center text-sky-400 hover:text-white transition-all shadow" title="UWorld Tables">' +
            '<span class="text-[10px] font-bold">UW</span>' +
            (tblCount > 0 ? '<span class="absolute -top-1 -right-1 bg-[#db2777] text-[9px] font-black text-white rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow">' + tblCount + '</span>' : '') +
          '</button>' +

          // 5. Notes
          '<button onclick="openFaTopicActions(' + idx + '); switchFaPanelTab(\\'notes\\');"' +
            ' class="w-9 h-9 rounded-full bg-[#20152e] hover:bg-[#2e1d40] border border-[#48286b] flex items-center justify-center text-slate-300 hover:text-white transition-all shadow" title="Personal Notes">' +
            '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  });

  layer.innerHTML = html;
}`;

if (OLD_RENDER_CALLOUTS.test(panel)) {
  panel = panel.replace(OLD_RENDER_CALLOUTS, NEW_RENDER_CALLOUTS);
  console.log('✅ Updated renderFaPageCallouts in fa_panel.js for all pages');
} else {
  console.log('⚠️ Could not regex match renderFaPageCallouts in fa_panel.js');
}

fs.writeFileSync(PANEL_JS, panel, 'utf8');

// ── 2. Update fa_questions.js openWhichQuestionsModal ─────────────────────────
let questions = fs.readFileSync(QUESTIONS_JS, 'utf8');

const OLD_MODAL_OPEN = /function openWhichQuestionsModal\(topicIdx\) \{[\s\S]*?modal\.classList\.remove\('hidden'\);\s*\}/;

const NEW_MODAL_OPEN = `function openWhichQuestionsModal(topicRef) {
  let topic = null;
  if (typeof topicRef === 'number') {
    topic = (window._faPageTopics && window._faPageTopics[topicRef]) || state.currentFaTopic;
  } else if (typeof topicRef === 'string') {
    const sys = state.currentFaSystem || (state.firstAidSystems || []).find(s => (s.topics || []).some(t => t.id === topicRef));
    topic = (sys && sys.topics && sys.topics.find(t => t.id === topicRef)) || { id: topicRef, title: topicRef };
  } else if (typeof topicRef === 'object' && topicRef !== null) {
    topic = topicRef;
  } else {
    topic = state.currentFaTopic || (window._faPageTopics && window._faPageTopics[0]);
  }

  if (!topic) return;

  currentCardTopic = topic;
  currentDeckSource = 'anking';
  currentCardMode = 'test';

  const modal = document.getElementById('modal-which-questions');
  if (!modal) return;

  // Set topic title
  const titleEl = document.getElementById('wq-topic-title');
  if (titleEl) titleEl.textContent = topic.title || 'Practice Questions';

  renderWhichQuestionsCounts();
  modal.classList.remove('hidden');
}`;

if (OLD_MODAL_OPEN.test(questions)) {
  questions = questions.replace(OLD_MODAL_OPEN, NEW_MODAL_OPEN);
  console.log('✅ Updated openWhichQuestionsModal in fa_questions.js to support any topic reference');
} else {
  console.log('⚠️ Could not regex match openWhichQuestionsModal in fa_questions.js');
}

fs.writeFileSync(QUESTIONS_JS, questions, 'utf8');
console.log('✅ Patch complete');
