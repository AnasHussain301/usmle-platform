const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Update 4 cards to 5 cards (replace the cards grid container)
const oldCardsStart = '<!-- 4. The 4 Main Big Cards (Screenshot 1) -->';
const oldCardsEnd = '<!-- Quick QBank Practice & AI Rad Bot Banner -->';

const startIndex = html.indexOf(oldCardsStart);
const endIndex = html.indexOf(oldCardsEnd);

if (startIndex === -1 || endIndex === -1) {
  console.error('Cards block not found!');
  process.exit(1);
}

const newCards = `<!-- 4. The 5 Main Big Cards (Screenshot 1 & 2) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-2">
        
        <!-- CARD 1: FIRST AID (Forest Green) -->
        <div onclick="navigate('fa')" class="cursor-pointer rounded-3xl p-5 bg-[#1b5e39] hover:bg-[#1f6d42] shadow-lg transition-all transform hover:-translate-y-1 flex flex-col justify-between min-h-[160px] group">
          <div class="flex items-start justify-between">
            <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </div>
            <span class="text-white/60 group-hover:text-white text-lg">&rsaquo;</span>
          </div>
          <div class="mt-4">
            <h3 class="text-xl font-black text-white">First Aid</h3>
            <p class="text-xs text-white/80 mt-1 font-medium">Book, headings and tables</p>
          </div>
        </div>

        <!-- CARD 2: SKETCHY (Plum / Maroon) -->
        <div onclick="navigate('sketchy')" class="cursor-pointer rounded-3xl p-5 bg-[#701a4e] hover:bg-[#801c59] shadow-lg transition-all transform hover:-translate-y-1 flex flex-col justify-between min-h-[160px] group">
          <div class="flex items-start justify-between">
            <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
            </div>
            <span class="text-white/60 group-hover:text-white text-lg">&rsaquo;</span>
          </div>
          <div class="mt-4">
            <h3 class="text-xl font-black text-white">Sketchy</h3>
            <p class="text-xs text-white/80 mt-1 font-medium">358 sketches &middot; not started</p>
            <div class="w-full bg-black/20 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div class="bg-white/40 h-full w-0"></div>
            </div>
          </div>
        </div>

        <!-- CARD 3: CARDS (Royal Blue) -->
        <div onclick="navigate('review')" class="cursor-pointer rounded-3xl p-5 bg-[#1d4ed8] hover:bg-[#2563eb] shadow-lg transition-all transform hover:-translate-y-1 flex flex-col justify-between min-h-[160px] group">
          <div class="flex items-start justify-between">
            <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            </div>
            <span class="text-white/60 group-hover:text-white text-lg">&rsaquo;</span>
          </div>
          <div class="mt-4">
            <h3 class="text-xl font-black text-white">Cards</h3>
            <p class="text-xs text-white/80 mt-1 font-medium">0 due today</p>
          </div>
        </div>

        <!-- CARD 4: MEHLMAN (Purple / Mauve - Screenshot 2) -->
        <div onclick="navigate('mehlman')" class="cursor-pointer rounded-3xl p-5 bg-[#54355f] hover:bg-[#664073] shadow-lg transition-all transform hover:-translate-y-1 flex flex-col justify-between min-h-[160px] group border border-purple-400/20">
          <div class="flex items-start justify-between">
            <div class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white font-black text-lg">
              M
            </div>
            <span class="text-white/60 group-hover:text-white text-lg">&rsaquo;</span>
          </div>
          <div class="mt-4">
            <h3 class="text-xl font-black text-white">Mehlman</h3>
            <p class="text-xs text-white/80 mt-1 font-medium">His HY PDFs, annotated</p>
          </div>
        </div>

        <!-- CARD 5: DDX FINDER (Burgundy) -->
        <div onclick="navigate('ddx')" class="cursor-pointer rounded-3xl p-5 bg-[#9f1239] hover:bg-[#b91c1c] shadow-lg transition-all transform hover:-translate-y-1 flex flex-col justify-between min-h-[160px] group">
          <div class="flex items-start justify-between">
            <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            </div>
            <span class="text-white/60 group-hover:text-white text-lg">&rsaquo;</span>
          </div>
          <div class="mt-4">
            <h3 class="text-xl font-black text-white">DDx finder</h3>
            <p class="text-xs text-white/80 mt-1 font-medium">Complaint to differentials</p>
          </div>
        </div>

      </div>

      `;

html = html.slice(0, startIndex) + newCards + html.slice(endIndex);

// 2. Add #view-mehlman before <!-- VIEW 6: QBANK -->
const qbankStart = '<!-- VIEW 6: QBANK / EXAM (Interactive USMLE blocks) -->';
const mehlmanViewHtml = `<!-- VIEW: MEHLMAN (#mehlman - Screenshot 1) -->
    <div id="view-mehlman" class="hidden max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <!-- Back to Home -->
      <div>
        <button onclick="navigate('home')" class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#241732] hover:bg-[#2e1d40] text-slate-300 border border-[#3b2752] transition-colors">
          &larr; Home
        </button>
      </div>

      <!-- Header with Circular 'M' Icon -->
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-full border-2 border-slate-600 bg-[#1e1330] flex items-center justify-center text-2xl font-black text-white shadow-xl shrink-0">
          M
        </div>
        <div>
          <h1 class="text-3xl font-black text-white">Mehlman</h1>
          <p class="text-xs text-slate-400 mt-1 font-medium">His HY PDFs, page by page. Highlights here and on his cards are the same highlights.</p>
        </div>
      </div>

      <!-- Banner: Mehlman questions (Purple Gradient Capsule) -->
      <div onclick="openMehlmanQuestions()" class="cursor-pointer rounded-2xl p-5 bg-gradient-to-r from-[#9d174d] via-[#a21caf] to-[#be185d] text-white shadow-2xl flex items-center justify-between transition-all transform hover:-translate-y-0.5 border border-pink-400/30">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">
            📑
          </div>
          <div>
            <h3 class="text-lg font-black text-white">Mehlman questions</h3>
            <p class="text-xs text-white/80 mt-0.5">Pick a system: do all, shuffled, redo missed or by topic</p>
          </div>
        </div>
        <span class="text-white text-xl font-bold">&rsaquo;</span>
      </div>

      <!-- Section: HIS PDFS -->
      <div class="space-y-3 pt-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">HIS PDFS</span>
          <span class="text-xs text-slate-500 font-medium">18 High-Yield Books &middot; Official Downloads Available</span>
        </div>

        <!-- System Cards Grid (Cardio, Endocrine, GI, Heme/Onc, MSK, Neuro, Psych, Renal, etc.) -->
        <div id="mehlman-systems-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Rendered dynamically by renderMehlmanGrid() in mehlman.js -->
        </div>
      </div>
    </div>

    `;

html = html.replace(qbankStart, mehlmanViewHtml + qbankStart);

// 3. Add #modal-mehlman-reader before </body>
const mehlmanModalHtml = `  <!-- ========================================== -->
  <!-- FULLSCREEN MEHLMAN HY PDF BOOK READER MODAL-->
  <!-- ========================================== -->
  <div id="modal-mehlman-reader" class="hidden fixed inset-0 z-50 bg-[#0c0612] flex flex-col text-white select-none">
    <!-- Top Bar matching Image 3 -->
    <div class="h-12 bg-[#170e20] border-b border-[#2d1b40] px-4 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3">
        <button onclick="closeMehlmanReader()" class="p-1.5 hover:bg-white/10 rounded-lg text-slate-300">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </button>
        <span id="mehlman-reader-title" class="text-sm font-bold text-white flex items-center gap-1.5">
          Mehlman &middot; HY Cardiovascular
        </span>
      </div>

      <div class="flex items-center gap-4 text-xs">
        <span id="mehlman-top-page-indicator" class="font-mono text-slate-300 font-bold">p. 74 / 74</span>
        <button onclick="toggleMehlmanTOC()" class="p-1.5 hover:bg-white/10 rounded-lg text-slate-300" title="Table of Contents">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <a id="mehlman-pdf-dl-btn" href="#" target="_blank"
           class="px-2.5 py-1 rounded-lg bg-pink-900/40 border border-pink-700/50 hover:bg-pink-800/60 text-pink-300 hover:text-white font-bold flex items-center gap-1 text-[11px] transition-colors" title="Download Official PDF">
          <span>📥 Download PDF</span>
        </a>
        <button class="p-1.5 hover:bg-white/10 rounded-lg text-slate-300">&vellip;</button>
      </div>
    </div>

    <!-- Main Body: Split Sidebar & Page View -->
    <div class="flex-1 flex overflow-hidden relative">
      <!-- Left Drawer: Table of Contents -->
      <div id="mehlman-reader-toc" class="hidden w-80 bg-[#140b1c] border-r border-[#261536] flex flex-col shrink-0 z-30">
        <div class="p-3 border-b border-[#261536] flex items-center justify-between">
          <h3 class="text-sm font-bold text-white">Table of Contents</h3>
          <button onclick="toggleMehlmanTOC()" class="text-slate-400 hover:text-white">&times;</button>
        </div>
        <div id="mehlman-toc-list" class="flex-1 overflow-y-auto p-2 space-y-1 text-xs"></div>
      </div>

      <!-- Center: Scanned Book Canvas & Interactive Overlay -->
      <div class="flex-1 overflow-y-auto flex flex-col items-center p-2 sm:p-6 bg-[#0a0510] relative">
        <div class="max-w-4xl w-full flex flex-col items-center">
          <div id="mehlman-page-canvas-wrapper" class="w-full bg-white rounded-lg border border-[#2b183d] overflow-hidden shadow-2xl relative min-h-[700px] flex justify-center">
            <!-- Scanned Page Image -->
            <img id="mehlman-reader-page-img" src="" alt="Mehlman Book Page"
                 class="w-full h-auto object-contain bg-white"
                 onerror="handleMehlmanImageError(this)"
                 onload="handleMehlmanImageSuccess(this)">

            <!-- Fallback Layout when raw scan image is offline -->
            <div id="mehlman-reader-fallback" class="p-8 w-full bg-[#140c1f] text-white flex flex-col items-center justify-center min-h-[600px] text-center space-y-6">
              <div class="w-20 h-20 rounded-full border-2 border-pink-500/40 bg-[#251536] flex items-center justify-center text-4xl shadow-2xl">
                📖
              </div>
              <div>
                <h3 id="mehlman-fallback-title" class="text-2xl font-black text-white">MEHLMAN MEDICAL</h3>
                <p id="mehlman-fallback-page-num" class="text-xs text-pink-400 font-mono mt-1 font-bold">Page 1 of 74</p>
              </div>
              <div id="mehlman-fallback-topics" class="max-w-xl w-full text-left"></div>
              <div class="flex items-center gap-3">
                <a id="mehlman-fallback-pdf-link" href="#" target="_blank"
                   class="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl transition-all">
                  <span>📄 Open / Download Official PDF</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Floating Bottom Page Stepper Control (< 74 / 74 >) -->
        <div class="fixed bottom-6 z-30 flex items-center bg-[#251736]/90 backdrop-blur-md border border-[#432960] rounded-full px-4 py-1.5 shadow-2xl">
          <button onclick="prevMehlmanPage()" class="text-slate-300 hover:text-white px-2 py-0.5 font-black text-base">&lsaquo;</button>
          <span id="mehlman-bottom-page-indicator" class="mx-3 font-mono font-bold text-xs text-slate-200">1 / 74</span>
          <button onclick="nextMehlmanPage()" class="text-slate-300 hover:text-white px-2 py-0.5 font-black text-base">&rsaquo;</button>
        </div>

        <!-- Zoom Control -->
        <div class="fixed bottom-6 right-6 z-30 flex items-center bg-[#251736]/90 backdrop-blur-md border border-[#432960] rounded-full px-3 py-1 text-xs text-slate-300 gap-2 shadow-2xl">
          <button onclick="zoomMehlmanPage(-10)" class="hover:text-white font-bold">&minus;</button>
          <span id="mehlman-zoom-label">100%</span>
          <button onclick="zoomMehlmanPage(10)" class="hover:text-white font-bold">&plus;</button>
        </div>
      </div>
    </div>
  </div>

  <script src="/js/mehlman.js"></script>
`;

html = html.replace('</body>', mehlmanModalHtml + '\n</body>');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('✅ Successfully updated index.html with Mehlman cards, view, and reader modal!');
