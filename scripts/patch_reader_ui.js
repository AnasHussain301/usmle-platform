const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

// 1. FA reader top bar search & options buttons
const oldFaBar = '<button class="p-1.5 hover:bg-white/10 rounded-lg text-slate-300" title="Search">';
const targetFa = `<button onclick="toggleReaderSearch()" class="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors" title="Search">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </button>
        <button onclick="toggleReaderOptionsPanel()" class="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors text-base font-black leading-none" title="Reader Options">⋮</button>`;

// Replace from '<button class="p-1.5 hover:bg-white/10 rounded-lg text-slate-300" title="Search">' to the next '</button>\n        <button class="p-1.5 hover:bg-white/10 rounded-lg text-slate-300">⋮</button>'
const faSearchRegex = /<button class="p-1\.5 hover:bg-white\/10 rounded-lg text-slate-300" title="Search">[\s\S]*?<button class="p-1\.5 hover:bg-white\/10 rounded-lg text-slate-300">⋮<\/button>/;

if (faSearchRegex.test(html)) {
  html = html.replace(faSearchRegex, targetFa);
  console.log('✅ Replaced FA reader search & options buttons');
} else {
  console.log('⚠️ FA reader search regex did not match');
}

// 2. Mehlman reader top bar
const mehlmanRegex = /<button class="p-1\.5 hover:bg-white\/10 rounded-lg text-slate-300">&vellip;<\/button>/;
const targetMehlman = `<button onclick="toggleReaderSearch()" class="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors" title="Search">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </button>
        <button onclick="toggleReaderOptionsPanel()" class="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors text-base font-black leading-none" title="Reader Options">⋮</button>`;

if (mehlmanRegex.test(html)) {
  html = html.replace(mehlmanRegex, targetMehlman);
  console.log('✅ Replaced Mehlman reader options button');
} else {
  console.log('⚠️ Mehlman options regex did not match');
}

// 3. Reader Options Menu & Search Overlay HTML
const readerUIHtml = `
  <!-- ========================================== -->
  <!-- READER OPTIONS BACKDROP & MENU PANEL       -->
  <!-- ========================================== -->
  <div id="reader-options-overlay" onclick="closeReaderOptionsPanel()" class="hidden fixed inset-0 z-[65] bg-black/25 backdrop-blur-[1px]"></div>

  <div id="reader-options-panel" class="fixed top-12 right-2 sm:right-6 z-[70] w-[340px] max-w-[calc(100vw-16px)] max-h-[calc(100vh-64px)] overflow-y-auto bg-white text-slate-800 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] border border-slate-200/90 p-4 space-y-3.5 select-none transition-transform duration-200 translate-x-[120%]">
    <!-- 1. PAGES -->
    <div>
      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">PAGES</div>
      <div class="bg-[#f3f0f7] p-1 rounded-2xl flex gap-1">
        <button id="opt-pagemode-swipe" onclick="setReaderPageMode('swipe')" class="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-slate-600 hover:text-slate-900">
          <span class="text-sm font-bold text-purple-600">&harr;</span> <span>Swipe</span>
        </button>
        <button id="opt-pagemode-scroll" onclick="setReaderPageMode('scroll')" class="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold bg-white text-purple-700 shadow-sm flex items-center justify-center gap-1.5 transition-all">
          <span class="text-sm font-bold text-purple-600">&varr;</span> <span>Scroll</span>
        </button>
      </div>
    </div>

    <!-- 2. DARK PAGE -->
    <div>
      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">DARK PAGE</div>
      <div class="bg-[#f3f0f7] p-1 rounded-2xl flex gap-1">
        <button id="opt-darkpage-auto" onclick="setDarkPage('auto')" class="flex-1 py-1.5 rounded-xl text-xs font-bold bg-white text-purple-700 shadow-sm transition-all">Auto</button>
        <button id="opt-darkpage-on" onclick="setDarkPage('on')" class="flex-1 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all">On</button>
        <button id="opt-darkpage-off" onclick="setDarkPage('off')" class="flex-1 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all">Off</button>
      </div>
    </div>

    <!-- 3. TOGGLES & ACTIONS LIST -->
    <div class="space-y-2 pt-1 border-t border-slate-100">
      <!-- Auto blanks (Toggle) -->
      <div class="flex items-center justify-between py-1">
        <div class="flex items-center gap-2.5 text-xs font-medium text-slate-700">
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>
          <span>Auto blanks</span>
        </div>
        <button id="opt-toggle-auto-blanks" onclick="toggleAutoBlanks()" class="w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out bg-slate-300 focus:outline-none flex items-center cursor-pointer">
          <div class="toggle-dot w-5 h-5 rounded-full bg-white shadow-md transform translate-x-0 transition-transform duration-200 ease-in-out"></div>
        </button>
      </div>

      <!-- Blur page in questions (Toggle) -->
      <div class="flex items-center justify-between py-1">
        <div class="flex items-center gap-2.5 text-xs font-medium text-slate-700">
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          <span>Blur page in questions</span>
        </div>
        <button id="opt-toggle-blur-questions" onclick="toggleBlurInQuestions()" class="w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out bg-slate-300 focus:outline-none flex items-center cursor-pointer">
          <div class="toggle-dot w-5 h-5 rounded-full bg-white shadow-md transform translate-x-0 transition-transform duration-200 ease-in-out"></div>
        </button>
      </div>

      <!-- Test this page (Action) -->
      <button onclick="readerTestThisPage()" class="w-full flex items-center gap-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-purple-700 text-left transition-colors">
        <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
        <span>Test this page</span>
      </button>

      <!-- UWorld incorrects (Action) -->
      <button onclick="readerUWorldIncorrects()" class="w-full flex items-center gap-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-purple-700 text-left transition-colors">
        <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="2"/><circle cx="12" cy="12" r="5" stroke-width="2"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>
        <span>UWorld incorrects</span>
      </button>

      <!-- Mehlman questions (Action) -->
      <button onclick="readerMehlmanQuestions()" class="w-full flex items-center gap-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-purple-700 text-left transition-colors">
        <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
        <span>Mehlman questions</span>
      </button>

      <!-- Mehlman tags beside headings (Toggle) -->
      <div class="flex items-center justify-between py-1">
        <div class="flex items-center gap-2.5 text-xs font-medium text-slate-700">
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          <span>Mehlman tags beside headings</span>
        </div>
        <button id="opt-toggle-mehlman-tags" onclick="toggleMehlmanTags()" class="w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out bg-purple-600 focus:outline-none flex items-center cursor-pointer">
          <div class="toggle-dot w-5 h-5 rounded-full bg-white shadow-md transform translate-x-5 transition-transform duration-200 ease-in-out"></div>
        </button>
      </div>

      <!-- List view (Action) -->
      <button onclick="toggleListView()" class="w-full flex items-center gap-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-purple-700 text-left transition-colors">
        <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
        <span>List view</span>
      </button>
    </div>

    <!-- 4. SHOW IN FIRST AID -->
    <div class="space-y-2 pt-2 border-t border-slate-100">
      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">SHOW IN FIRST AID</div>

      <!-- UWorld tables -->
      <div class="flex items-center justify-between py-1">
        <div class="flex items-center gap-2.5 text-xs font-medium text-slate-700">
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <span>UWorld tables</span>
        </div>
        <button id="opt-toggle-uworld-tables" onclick="toggleShowInFA('showUWorldTables')" class="w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out bg-purple-600 focus:outline-none flex items-center cursor-pointer">
          <div class="toggle-dot w-5 h-5 rounded-full bg-white shadow-md transform translate-x-5 transition-transform duration-200 ease-in-out"></div>
        </button>
      </div>

      <!-- UWorld images -->
      <div class="flex items-center justify-between py-1">
        <div class="flex items-center gap-2.5 text-xs font-medium text-slate-700">
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <span>UWorld images</span>
        </div>
        <button id="opt-toggle-uworld-images" onclick="toggleShowInFA('showUWorldImages')" class="w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out bg-purple-600 focus:outline-none flex items-center cursor-pointer">
          <div class="toggle-dot w-5 h-5 rounded-full bg-white shadow-md transform translate-x-5 transition-transform duration-200 ease-in-out"></div>
        </button>
      </div>

      <!-- AnKing questions -->
      <div class="flex items-center justify-between py-1">
        <div class="flex items-center gap-2.5 text-xs font-medium text-slate-700">
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          <span>AnKing questions</span>
        </div>
        <button id="opt-toggle-anking" onclick="toggleShowInFA('showAnKing')" class="w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out bg-purple-600 focus:outline-none flex items-center cursor-pointer">
          <div class="toggle-dot w-5 h-5 rounded-full bg-white shadow-md transform translate-x-5 transition-transform duration-200 ease-in-out"></div>
        </button>
      </div>

      <!-- Mnemosyne questions -->
      <div class="flex items-center justify-between py-1">
        <div class="flex items-center gap-2.5 text-xs font-medium text-slate-700">
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          <span>Mnemosyne questions</span>
        </div>
        <button id="opt-toggle-mnemosyne" onclick="toggleShowInFA('showMnemosyne')" class="w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out bg-purple-600 focus:outline-none flex items-center cursor-pointer">
          <div class="toggle-dot w-5 h-5 rounded-full bg-white shadow-md transform translate-x-5 transition-transform duration-200 ease-in-out"></div>
        </button>
      </div>

      <!-- Mehlman (questions, tables, M tags) -->
      <div class="flex items-center justify-between py-1">
        <div class="flex items-center gap-2.5 text-xs font-medium text-slate-700">
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
          <span>Mehlman (questions, tables, M tags)</span>
        </div>
        <button id="opt-toggle-mehlman-full" onclick="toggleShowInFA('showMehlman')" class="w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out bg-purple-600 focus:outline-none flex items-center cursor-pointer">
          <div class="toggle-dot w-5 h-5 rounded-full bg-white shadow-md transform translate-x-5 transition-transform duration-200 ease-in-out"></div>
        </button>
      </div>
    </div>

    <!-- 5. BAR COLOUR -->
    <div class="pt-2 border-t border-slate-100">
      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">BAR COLOUR</div>
      <div class="bg-[#f3f0f7] p-1 rounded-2xl flex gap-1">
        <button id="opt-barcolour-theme" onclick="setReaderBarColour('theme')" class="flex-1 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-900 shadow-sm transition-all">Theme</button>
        <button id="opt-barcolour-navy" onclick="setReaderBarColour('navy')" class="flex-1 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all">Navy</button>
        <button id="opt-barcolour-black" onclick="setReaderBarColour('black')" class="flex-1 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all">Black</button>
      </div>
    </div>

    <!-- 6. THEME / APPEARANCE -->
    <div class="pt-2 border-t border-slate-100 space-y-3">
      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">APPEARANCE</div>

      <!-- Theme 4-segment -->
      <div class="bg-[#f3f0f7] p-1 rounded-2xl flex gap-1">
        <button onclick="setTheme('light')" id="opt-theme-light" class="flex-1 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all">Light</button>
        <button onclick="setTheme('dark')" id="opt-theme-dark" class="flex-1 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all">Dark</button>
        <button onclick="setTheme('black')" id="opt-theme-black" class="flex-1 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all">Black</button>
        <button onclick="setTheme('auto')" id="opt-theme-auto" class="flex-1 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all">Auto</button>
      </div>

      <!-- Colour Swatches -->
      <div>
        <div class="text-xs font-bold text-slate-700 mb-1.5">Colour</div>
        <div class="flex items-center gap-2.5">
          <button onclick="setAccentColor('#f43f5e', 0)" class="color-swatch w-7 h-7 rounded-full bg-[#f43f5e] ring-2 ring-purple-600 ring-offset-2 transition-all hover:scale-110" title="Rose / Magenta"></button>
          <button onclick="setAccentColor('#3b82f6', 1)" class="color-swatch w-7 h-7 rounded-full bg-[#2563eb] transition-all hover:scale-110" title="Blue"></button>
          <button onclick="setAccentColor('#16a34a', 2)" class="color-swatch w-7 h-7 rounded-full bg-[#16a34a] transition-all hover:scale-110" title="Green"></button>
          <button onclick="setAccentColor('#9333ea', 3)" class="color-swatch w-7 h-7 rounded-full bg-[#9333ea] transition-all hover:scale-110" title="Purple"></button>
          <button onclick="setAccentColor('#d97706', 4)" class="color-swatch w-7 h-7 rounded-full bg-[#d97706] transition-all hover:scale-110" title="Amber"></button>
          <button onclick="setAccentColor('#334155', 5)" class="color-swatch w-7 h-7 rounded-full bg-[#334155] transition-all hover:scale-110" title="Charcoal"></button>
        </div>
      </div>

      <!-- Font Grid (6 pills) -->
      <div>
        <div class="text-xs font-bold text-slate-700 mb-1.5">Font</div>
        <div class="grid grid-cols-3 gap-1.5">
          <button onclick="setFontFamily('Synapse')" id="opt-font-Synapse" class="py-2 px-1 rounded-xl bg-[#f5f2f8] border border-slate-200 text-slate-800 text-xs font-semibold hover:border-purple-500 transition-all text-center">Zetchy</button>
          <button onclick="setFontFamily('Inter')" id="opt-font-Inter" class="py-2 px-1 rounded-xl bg-[#f5f2f8] border border-slate-200 text-slate-800 text-xs font-semibold hover:border-purple-500 transition-all text-center">Inter</button>
          <button onclick="setFontFamily('Plus Jakarta')" id="opt-font-Plus-Jakarta" class="py-2 px-1 rounded-xl bg-[#f5f2f8] border border-slate-200 text-slate-800 text-xs font-semibold hover:border-purple-500 transition-all text-center leading-tight">Plus Jakarta</button>
          <button onclick="setFontFamily('Lexend')" id="opt-font-Lexend" class="py-2 px-1 rounded-xl bg-[#f5f2f8] border border-slate-200 text-slate-800 text-xs font-semibold hover:border-purple-500 transition-all text-center">Lexend</button>
          <button onclick="setFontFamily('Outfit')" id="opt-font-Outfit" class="py-2 px-1 rounded-xl bg-[#f5f2f8] border border-slate-200 text-slate-800 text-xs font-semibold hover:border-purple-500 transition-all text-center">Outfit</button>
          <button onclick="setFontFamily('Fraunces')" id="opt-font-Fraunces" class="py-2 px-1 rounded-xl bg-[#f5f2f8] border border-slate-200 text-slate-800 text-xs font-serif font-bold hover:border-purple-500 transition-all text-center">Fraunces</button>
        </div>
      </div>

      <!-- All text Scaler -->
      <div class="flex items-center justify-between pt-1">
        <span class="text-xs font-bold text-slate-700">All text</span>
        <div class="flex items-center gap-2">
          <button onclick="adjustFontSize(-5)" class="px-2.5 py-1 rounded-lg bg-[#f3f0f7] hover:bg-[#e9e4f0] text-xs font-bold text-slate-800 transition-all">A&minus;</button>
          <span id="opt-font-scale-label" class="px-1 text-xs font-mono font-bold text-purple-700 min-w-[40px] text-center">100%</span>
          <button onclick="adjustFontSize(5)" class="px-2.5 py-1 rounded-lg bg-[#f3f0f7] hover:bg-[#e9e4f0] text-xs font-bold text-slate-800 transition-all">A+</button>
        </div>
      </div>

      <button onclick="showReaderToast('Font fine-tuning active.')" class="w-full text-left py-1 text-xs text-slate-600 hover:text-slate-900 flex items-center justify-between">
        <span>Fine-tune text sizes</span>
        <span class="text-slate-400">&rsaquo;</span>
      </button>
    </div>

    <!-- 7. ACTION BUTTONS -->
    <div class="pt-2 border-t border-slate-100 space-y-2">
      <button onclick="openPlansModal(); closeReaderOptionsPanel();" class="w-full py-2.5 px-3.5 rounded-2xl bg-[#fbf9fe] hover:bg-[#f4effc] border border-purple-200 flex items-center justify-between text-purple-700 font-bold text-xs transition-all">
        <span>Earn with Synapse: get your code</span>
        <span class="text-purple-500">&rsaquo;</span>
      </button>
      <button onclick="openFeedbackModal(); closeReaderOptionsPanel();" class="w-full py-2.5 px-3.5 rounded-2xl bg-[#fbf9fe] hover:bg-[#f4effc] border border-purple-200 flex items-center justify-between text-purple-700 font-bold text-xs transition-all">
        <span>Send feedback</span>
        <span class="text-purple-500">&rsaquo;</span>
      </button>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- READER FLOATING SEARCH PILL POPUP          -->
  <!-- ========================================== -->
  <div id="reader-search-overlay" class="hidden fixed top-14 right-4 sm:right-20 z-[70]">
    <div class="flex items-center bg-white rounded-full px-3.5 py-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.3)] border-2 border-purple-600">
      <input id="reader-search-input" type="text" placeholder="Search headings, pages, topics..."
             class="bg-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-semibold outline-none w-56 sm:w-80"
             oninput="handleReaderSearchInput(this.value)"
             onkeydown="if(event.key==='Enter') handleReaderSearchSubmit(this.value); if(event.key==='Escape') closeReaderSearch();">
      <button onclick="closeReaderSearch()" class="ml-2 text-slate-400 hover:text-slate-800 p-1 font-bold text-xs rounded-full hover:bg-slate-100">
        &#10005;
      </button>
    </div>
    <!-- Live Search Results Dropdown -->
    <div id="reader-search-results" class="hidden mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-80 overflow-y-auto text-slate-800 text-xs p-1 space-y-0.5"></div>
  </div>

  <script src="/js/reader_options.js"></script>
`;

// Insert before </body>
if (!html.includes('id="reader-options-panel"')) {
  html = html.replace('</body>', `${readerUIHtml}\n</body>`);
  console.log('✅ Injected Reader Options & Search HTML before </body>');
} else {
  console.log('ℹ️ reader-options-panel already present');
}

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Done!');
