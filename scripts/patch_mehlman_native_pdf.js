/**
 * Update public/index.html to include local pdf.min.js and native canvas viewer
 */
const fs = require('fs');
const path = require('path');

const HTML_FILE = path.join(__dirname, '..', 'public', 'index.html');
let src = fs.readFileSync(HTML_FILE, 'utf8');

// 1. Add pdf.min.js script tag before mehlman.js if not already there
if (!src.includes('/js/pdf.min.js')) {
  src = src.replace('<script src="/js/mehlman.js"></script>', '<script src="/js/pdf.min.js"></script>\n  <script src="/js/mehlman.js"></script>');
  console.log('✅ Added /js/pdf.min.js script tag');
}

// 2. Remove external download PDF link from reader top bar
const OLD_TOP_DL = `<a id="mehlman-pdf-dl-btn" href="#" target="_blank"
           class="px-2.5 py-1 rounded-lg bg-pink-900/40 border border-pink-700/50 hover:bg-pink-800/60 text-pink-300 hover:text-white font-bold flex items-center gap-1 text-[11px] transition-colors" title="Download Official PDF">
          <span>?? Download PDF</span>
        </a>`;

const OLD_TOP_DL_ALT = /<a id="mehlman-pdf-dl-btn"[\s\S]*?<\/a>/;
if (OLD_TOP_DL_ALT.test(src)) {
  src = src.replace(OLD_TOP_DL_ALT, '');
  console.log('✅ Removed external download PDF link from top bar');
}

// 3. Update mehlman-page-canvas-wrapper with canvas and spinner
const OLD_WRAPPER_REGEX = /<div id="mehlman-page-canvas-wrapper"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<!-- Floating Bottom Page Stepper Control/;

const NEW_WRAPPER_CONTENT = `<div id="mehlman-page-canvas-wrapper" class="w-full bg-[#120a1a] rounded-2xl overflow-hidden shadow-2xl relative flex flex-col items-center justify-center p-2 min-h-[700px] border border-[#2b183d]">
            <!-- Loading Spinner -->
            <div id="mehlman-pdf-loading" class="hidden absolute inset-0 bg-[#0c0612]/85 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-3">
              <div class="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              <span class="text-xs text-pink-300 font-semibold tracking-wide">Rendering High-Yield PDF...</span>
            </div>

            <!-- PDF Page Canvas -->
            <canvas id="mehlman-pdf-canvas" class="max-w-full h-auto rounded-xl shadow-2xl bg-white"></canvas>

            <!-- Native In-App Fallback when PDF not yet extracted -->
            <div id="mehlman-reader-fallback" class="hidden p-8 w-full bg-[#140c1f] text-white flex flex-col items-center justify-center min-h-[500px] text-center space-y-4">
              <div class="w-16 h-16 rounded-full border-2 border-pink-500/40 bg-[#251536] flex items-center justify-center text-3xl shadow-2xl">
                📖
              </div>
              <div>
                <h3 id="mehlman-fallback-title" class="text-xl font-black text-white">MEHLMAN MEDICAL</h3>
                <p id="mehlman-fallback-page-num" class="text-xs text-pink-400 font-mono mt-1 font-bold">Page 1</p>
              </div>
              <div id="mehlman-fallback-topics" class="max-w-xl w-full text-left"></div>
            </div>
          </div>
        </div>

        <!-- Floating Bottom Page Stepper Control`;

if (OLD_WRAPPER_REGEX.test(src)) {
  src = src.replace(OLD_WRAPPER_REGEX, NEW_WRAPPER_CONTENT);
  console.log('✅ Replaced canvas wrapper with native PDF canvas');
} else {
  console.log('⚠️  Regex did not match mehlman-page-canvas-wrapper in index.html');
}

fs.writeFileSync(HTML_FILE, src, 'utf8');
console.log('✅ index.html updated');
