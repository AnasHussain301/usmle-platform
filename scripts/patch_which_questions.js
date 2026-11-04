/**
 * Patch index.html and fa_panel.js to integrate:
 * 1. "Which questions?" modal (Screenshot 1)
 * 2. Floating Flashcard Question player (Screenshot 2)
 * 3. M button next to every heading on First Aid book pages
 */
const fs = require('fs');
const path = require('path');

const HTML_FILE = path.join(__dirname, '..', 'public', 'index.html');
const PANEL_FILE = path.join(__dirname, '..', 'public', 'js', 'fa_panel.js');

let html = fs.readFileSync(HTML_FILE, 'utf8');

// 1. Add <script src="/js/fa_questions.js"></script> before </body>
if (!html.includes('/js/fa_questions.js')) {
  html = html.replace('</body>', '  <script src="/js/fa_questions.js"></script>\n</body>');
  console.log('✅ Added fa_questions.js script tag');
}

// 2. Add Modals into index.html if not present
if (!html.includes('id="modal-which-questions"')) {
  const MODALS_HTML = `
  <!-- ========================================== -->
  <!-- MODAL: WHICH QUESTIONS? (SCREENSHOT 1)      -->
  <!-- ========================================== -->
  <div id="modal-which-questions" class="hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-[#190f24] border border-[#3b2352] rounded-3xl max-w-sm w-full p-5 shadow-2xl text-white space-y-4 animate-in zoom-in-95">
      <div>
        <h3 class="text-base font-black text-white">Which questions?</h3>
        <p id="wq-topic-title" class="text-xs text-slate-400 mt-0.5">Autoregulation</p>
      </div>

      <div class="flex items-center bg-[#120a1a] p-1 rounded-2xl border border-[#2b183d]">
        <button id="wq-mode-test" onclick="setCardMode('test')" class="flex-1 py-1.5 rounded-xl text-xs font-bold bg-[#29173b] text-pink-400 border border-pink-500/50 transition-all">
          Test
        </button>
        <button id="wq-mode-prev" onclick="setCardMode('preview')" class="flex-1 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-all">
          Preview
        </button>
      </div>

      <div class="flex items-center gap-1.5 border-b border-[#2b183d] pb-3 text-xs">
        <button id="wq-tab-anking" onclick="setDeckSource('anking')" class="px-3 py-1 rounded-lg text-xs font-bold text-pink-400 bg-pink-950/60 border border-pink-900/60">
          AnKing 35
        </button>
        <button id="wq-tab-mnemo" onclick="setDeckSource('mnemosyne')" class="px-3 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white">
          Mnemosyne 9
        </button>
        <button id="wq-tab-mehlman" onclick="setDeckSource('mehlman')" class="px-3 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white">
          Mehlman 4
        </button>
      </div>

      <div class="space-y-1 text-xs">
        <div onclick="startHeadingQuestions('all')" class="p-2.5 rounded-xl hover:bg-[#251538] cursor-pointer flex items-center justify-between text-slate-200 transition-colors">
          <span class="font-bold">All</span>
          <span id="wq-count-all" class="font-mono text-slate-400">35</span>
        </div>
        <div onclick="startHeadingQuestions('again')" class="p-2.5 rounded-xl hover:bg-[#251538] cursor-pointer flex items-center justify-between text-slate-200 transition-colors">
          <span class="font-bold">Again (missed)</span>
          <span id="wq-count-again" class="font-mono text-slate-500">&#8856;</span>
        </div>
        <div onclick="startHeadingQuestions('good')" class="p-2.5 rounded-xl hover:bg-[#251538] cursor-pointer flex items-center justify-between text-slate-200 transition-colors">
          <span class="font-bold">Good</span>
          <span id="wq-count-good" class="font-mono text-slate-500">&#8856;</span>
        </div>
        <div onclick="startHeadingQuestions('not_done')" class="p-2.5 rounded-xl hover:bg-[#251538] cursor-pointer flex items-center justify-between text-slate-200 transition-colors font-bold text-pink-300 bg-pink-950/20 border border-pink-900/30">
          <span>Not done</span>
          <span id="wq-count-not-done" class="font-mono text-pink-400">35</span>
        </div>
      </div>

      <div class="pt-1 text-center">
        <button onclick="closeWhichQuestionsModal()" class="w-full py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
          Cancel
        </button>
      </div>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- MODAL: FLOATING CARD PLAYER (SCREENSHOT 2)  -->
  <!-- ========================================== -->
  <div id="modal-heading-card-player" class="hidden fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 max-w-xl w-full">
    <div class="bg-[#1b1129]/95 backdrop-blur-md border border-[#3b2352] rounded-3xl p-5 shadow-2xl text-white space-y-4">
      <div class="flex items-center justify-between text-xs text-slate-400 border-b border-[#2d1b40] pb-2">
        <div class="flex items-center gap-2 font-mono">
          <span id="hcp-counter" class="text-white font-bold">| 1 / 35</span>
          <span class="text-amber-400 text-xs">&#128993;</span>
        </div>

        <div class="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-500 overflow-hidden max-w-[200px]">
          <span onclick="prevHeadingCard()" class="cursor-pointer hover:text-white font-bold mr-1">&lsaquo;</span>
          <span id="hcp-dots-bar" class="truncate text-pink-400"></span>
          <span onclick="nextHeadingCard()" class="cursor-pointer hover:text-white font-bold ml-1">&rsaquo;</span>
        </div>

        <div class="flex items-center gap-2">
          <button class="px-2.5 py-1 rounded-lg bg-[#27173b] hover:bg-[#341e4f] text-[11px] font-bold text-slate-300 border border-[#442866] transition-colors">
            + Deck
          </button>
          <button onclick="closeHeadingCardPlayer()" class="p-1 hover:text-white text-slate-400 transition-colors">
            &#10005;
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-pink-500"></span>
        <span id="hcp-topic-tag" class="text-xs font-bold text-pink-300 truncate">Autoregulation</span>
      </div>

      <div class="py-2 min-h-[70px]">
        <p id="hcp-prompt-text" class="text-sm sm:text-base font-bold text-white leading-relaxed">
          ____ is the maintenance of a constant blood flow to an organ in the face of changing arterial pressures
        </p>
      </div>

      <div id="hcp-actions-bar" class="flex items-center justify-between border-t border-[#2d1b40] pt-3">
      </div>
    </div>
  </div>
`;
  html = html.replace('</body>', MODALS_HTML + '\n</body>');
  console.log('✅ Added modal HTML elements into index.html');
}

fs.writeFileSync(HTML_FILE, html, 'utf8');

// 3. Update fa_panel.js to render M button next to each heading
let panel = fs.readFileSync(PANEL_FILE, 'utf8');

const OLD_CALLOUT_BUTTON = `    html += '<div class="absolute pointer-events-auto" style="top: ' + topPx + 'px; left: 12px; z-index: 20;">' +
      '<button onclick="toggleCalloutMenu(\\'' + calloutId + '\\')"' +
        ' class="w-8 h-8 rounded-full bg-[#2a1a3d]/90 border border-[#5a3580] flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#3d2258] transition-all shadow-lg backdrop-blur-sm"' +
        ' title="' + escHtml(topic.title) + '">' +
        '<span class="text-xs font-bold">\\u22EF</span>' +
      '</button>' +`;

const NEW_CALLOUT_BUTTON = `    html += '<div class="absolute pointer-events-auto flex items-center gap-1.5" style="top: ' + topPx + 'px; left: 10px; z-index: 20;">' +
      // M Button (Screenshot 1)
      '<button onclick="openWhichQuestionsModal(' + idx + ')"' +
        ' class="w-7 h-7 rounded-full bg-[#1e1330] hover:bg-[#311c47] border border-[#522f73] flex items-center justify-center text-slate-200 hover:text-pink-300 font-black text-[11px] shadow-lg transition-transform hover:scale-105"' +
        ' title="Questions & AnKing: ' + escHtml(topic.title) + '">' +
        '<span>M</span>' +
      '</button>' +
      // Three Dots Action Menu Button
      '<button onclick="toggleCalloutMenu(\\'' + calloutId + '\\')"' +
        ' class="w-7 h-7 rounded-full bg-[#2a1a3d]/90 border border-[#5a3580] flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#3d2258] transition-all shadow-lg backdrop-blur-sm"' +
        ' title="' + escHtml(topic.title) + '">' +
        '<span class="text-xs font-bold">\\u22EF</span>' +
      '</button>' +`;

if (panel.includes(OLD_CALLOUT_BUTTON)) {
  panel = panel.replace(OLD_CALLOUT_BUTTON, NEW_CALLOUT_BUTTON);
  console.log('✅ Updated callout button row with M icon in fa_panel.js');
} else {
  console.log('⚠️  Could not find OLD_CALLOUT_BUTTON in fa_panel.js');
}

// Also update checkmark inside callout menu to also trigger openWhichQuestionsModal
const OLD_CHECKMARK = `'<button onclick="markFaHeadingLearned(\\'`;
const NEW_CHECKMARK = `'<button onclick="openWhichQuestionsModal(' + idx + '); markFaHeadingLearned(\\'`;
if (panel.includes(OLD_CHECKMARK)) {
  panel = panel.replace(OLD_CHECKMARK, NEW_CHECKMARK);
  console.log('✅ Linked callout checkmark to openWhichQuestionsModal');
}

fs.writeFileSync(PANEL_FILE, panel, 'utf8');
console.log('✅ fa_panel.js updated');
