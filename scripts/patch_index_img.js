/**
 * Patch index.html to remove buggy inline onerror and add fa-img-card-wrapper
 */
const fs = require('fs');
const path = require('path');

const HTML_FILE = path.join(__dirname, '..', 'public', 'index.html');
let src = fs.readFileSync(HTML_FILE, 'utf8');

const OLD_IMG_HTML = `<div class="bg-white rounded-xl p-3 shadow-xl overflow-hidden flex flex-col items-center min-h-[300px]">
            <img id="fa-carousel-main-img" src="" alt="UWorld Diagram" class="w-full h-auto object-contain"
                 onerror="this.onerror=null; this.src='/assets/sketches/thumb_iron_deficiency.png';">
            <p id="fa-carousel-caption" class="text-xs text-slate-700 font-medium text-center mt-3 leading-relaxed"></p>
          </div>`;

const NEW_IMG_HTML = `<div id="fa-img-card-wrapper" class="bg-[#170e20] rounded-xl p-3 shadow-xl overflow-hidden flex flex-col items-center min-h-[260px] border border-[#2b183d]">
            <img id="fa-carousel-main-img" alt="UWorld Diagram" class="w-full h-auto object-contain rounded-lg hidden bg-white p-1">
            <div id="fa-carousel-caption" class="text-xs text-slate-300 font-medium text-center mt-3 leading-relaxed w-full"></div>
          </div>`;

if (src.includes(OLD_IMG_HTML)) {
  src = src.replace(OLD_IMG_HTML, NEW_IMG_HTML);
  fs.writeFileSync(HTML_FILE, src, 'utf8');
  console.log('✅ Patched image container in index.html');
} else {
  console.log('⚠️  Could not find OLD_IMG_HTML in index.html');
}
