const fs = require('fs');
const path = require('path');

const HTML_FILE = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(HTML_FILE, 'utf8');

// 1. Add fa_questions_data.js script before fa_questions.js
if (!html.includes('/js/fa_questions_data.js')) {
  html = html.replace('<script src="/js/fa_questions.js"></script>', '<script src="/js/fa_questions_data.js"></script>\n  <script src="/js/fa_questions.js"></script>');
  console.log('✅ Added fa_questions_data.js script tag');
}

// 2. Update Mehlman scroll area and canvas wrapper
const OLD_CENTER_HTML = `      <!-- Center: PDF Viewer & Fallback -->
      <div class="flex-1 overflow-hidden flex flex-col bg-[#0a0510] relative">
        <div class="max-w-4xl w-full flex flex-col items-center">
          <div id="mehlman-page-canvas-wrapper" class="w-full bg-[#120a1a] rounded-2xl overflow-hidden shadow-2xl relative flex flex-col items-center justify-center p-2 min-h-[700px] border border-[#2b183d]">`;

const NEW_CENTER_HTML = `      <!-- Center: PDF Viewer & Fallback (Proper fit & centered) -->
      <div id="mehlman-scroll-area" class="flex-1 overflow-y-auto flex flex-col items-center py-6 px-4 sm:px-8 bg-[#0a0510] relative">
        <div class="max-w-4xl w-full flex flex-col items-center">
          <div id="mehlman-page-canvas-wrapper" class="w-auto max-w-full bg-[#120a1a] rounded-2xl shadow-2xl relative flex flex-col items-center justify-center p-3 sm:p-4 min-h-[700px] border border-[#2b183d]">`;

if (html.includes(OLD_CENTER_HTML)) {
  html = html.replace(OLD_CENTER_HTML, NEW_CENTER_HTML);
  console.log('✅ Updated Mehlman center area with scrollable container and centered canvas');
} else {
  console.log('⚠️  Could not find OLD_CENTER_HTML in index.html, trying regex');
  const reg = /<!-- Center: PDF Viewer[\s\S]*?<div id="mehlman-page-canvas-wrapper"[^>]*>/;
  if (reg.test(html)) {
    html = html.replace(reg, NEW_CENTER_HTML);
    console.log('✅ Replaced Mehlman center area via regex');
  }
}

fs.writeFileSync(HTML_FILE, html, 'utf8');
console.log('✅ index.html updated');
