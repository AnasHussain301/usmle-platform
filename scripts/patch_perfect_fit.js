/**
 * Comprehensive patch:
 * 1. Perfectly center Mehlman canvas and enable smooth vertical scrolling with slider
 * 2. Position bottom stepper in the exact middle of screen
 * 3. Update callout menu in fa_panel.js so the tick icon has the pink questions badge
 *    and clicking the tick icon opens the "Which questions?" modal (matching Image 2)
 */
const fs = require('fs');
const path = require('path');

const HTML_FILE = path.join(__dirname, '..', 'public', 'index.html');
const MEHLMAN_JS = path.join(__dirname, '..', 'public', 'js', 'mehlman.js');
const PANEL_JS = path.join(__dirname, '..', 'public', 'js', 'fa_panel.js');

// ── 1. INDEX.HTML: Center Mehlman layout and bottom stepper ─────────────────
let html = fs.readFileSync(HTML_FILE, 'utf8');

const OLD_CENTER_DIV = `<div id="mehlman-scroll-area" class="flex-1 overflow-y-auto flex flex-col items-center py-6 px-4 sm:px-8 bg-[#0a0510] relative">
        <div class="max-w-4xl w-full flex flex-col items-center">
          <div id="mehlman-page-canvas-wrapper" class="w-auto max-w-full bg-[#120a1a] rounded-2xl shadow-2xl relative flex flex-col items-center justify-center p-3 sm:p-4 min-h-[700px] border border-[#2b183d]">`;

const NEW_CENTER_DIV = `<div id="mehlman-scroll-area" class="flex-1 overflow-y-auto flex flex-col items-center py-6 px-2 sm:px-4 bg-[#0a0510] relative w-full h-full" style="scrollbar-width: thin; scrollbar-color: #522f73 #0c0612;">
        <div class="w-full flex flex-col items-center justify-start pb-24">
          <div id="mehlman-page-canvas-wrapper" class="w-auto flex flex-col items-center justify-center p-0 rounded-2xl shadow-2xl relative border border-[#2b183d] bg-white overflow-hidden mx-auto my-2">`;

if (html.includes(OLD_CENTER_DIV)) {
  html = html.replace(OLD_CENTER_DIV, NEW_CENTER_DIV);
  console.log('✅ Updated Mehlman scroll area and canvas wrapper in index.html');
} else {
  // Regex match
  const reg = /<div id="mehlman-scroll-area"[\s\S]*?<div id="mehlman-page-canvas-wrapper"[^>]*>/;
  if (reg.test(html)) {
    html = html.replace(reg, NEW_CENTER_DIV);
    console.log('✅ Replaced Mehlman scroll area via regex');
  }
}

// Center the bottom stepper
const OLD_STEPPER = `<div class="fixed bottom-6 z-30 flex items-center bg-[#251736]/90 backdrop-blur-md border border-[#432960] rounded-full px-4 py-1.5 shadow-2xl">`;
const NEW_STEPPER = `<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center bg-[#251736]/95 backdrop-blur-md border border-[#432960] rounded-full px-4 py-1.5 shadow-2xl">`;

if (html.includes(OLD_STEPPER)) {
  html = html.replace(OLD_STEPPER, NEW_STEPPER);
  console.log('✅ Centered floating bottom stepper in index.html');
}

fs.writeFileSync(HTML_FILE, html, 'utf8');

// ── 2. MEHLMAN.JS: Dynamic fit, centered margin, retina scaling ──────────────
let mehlman = fs.readFileSync(MEHLMAN_JS, 'utf8');

const OLD_FIT_CALC = `    // Calculate fit width based on viewer wrapper width
    const scrollContainer = document.getElementById('mehlman-scroll-area');
    const containerWidth = scrollContainer ? (scrollContainer.clientWidth - 48) : 800;
    const baseViewport = page.getViewport({ scale: 1.0 });
    
    // Fit to container width (min 600, max 950) scaled by mehlmanZoom
    const targetWidth = Math.max(500, Math.min(950, containerWidth)) * (mehlmanZoom / 100);
    const fitScale = targetWidth / baseViewport.width;
    
    const viewport = page.getViewport({ scale: fitScale });

    // Set physical pixel dimensions for high-DPI display
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);

    // Set CSS display dimensions
    canvas.style.width = Math.floor(viewport.width) + 'px';
    canvas.style.height = Math.floor(viewport.height) + 'px';`;

const NEW_FIT_CALC = `    // Calculate fit width based on screen width & zoom (centered & dynamic)
    const scrollContainer = document.getElementById('mehlman-scroll-area');
    const availWidth = scrollContainer && scrollContainer.clientWidth > 100 
      ? Math.min(scrollContainer.clientWidth - 40, 880) 
      : Math.min(window.innerWidth - 60, 880);

    const baseViewport = page.getViewport({ scale: 1.0 });
    const targetWidth = Math.max(480, availWidth) * (mehlmanZoom / 100);
    const fitScale = targetWidth / baseViewport.width;

    const viewport = page.getViewport({ scale: fitScale });

    // Set physical pixel dimensions for high-DPI display
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);

    // Set CSS display dimensions: centered with margin auto
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.width = Math.floor(viewport.width) + 'px';
    canvas.style.height = Math.floor(viewport.height) + 'px';`;

if (mehlman.includes(OLD_FIT_CALC)) {
  mehlman = mehlman.replace(OLD_FIT_CALC, NEW_FIT_CALC);
  console.log('✅ Updated Mehlman fit calculation for centered dynamic display');
}

fs.writeFileSync(MEHLMAN_JS, mehlman, 'utf8');

// ── 3. FA_PANEL.JS: Update callout menu checkmark button ─────────────────────
let panel = fs.readFileSync(PANEL_JS, 'utf8');

const OLD_CALLOUT_CODE_REGEX = /\/\/ Render callout buttons positioned along left side of the page[\s\S]*?layer\.innerHTML = html;/;

const NEW_CALLOUT_CODE = `// Render callout buttons positioned along left side of the page
  var html = '';
  matchingTopics.forEach(function(topic, idx) {
    var topPx = 90 + idx * 260; // Spread out so Autoregulation and Capillary fluid align with page headings
    var imgCount = (topic.images || []).length;
    var tblCount = (topic.tables || []).length;
    var calloutId = 'callout-' + idx;
    var learnedClass = isHeadingLearned(topic.id || topic.title)
      ? 'bg-emerald-900/60 border-emerald-700/60 text-emerald-400'
      : 'bg-[#20152e] border-[#48286b] text-white';

    // Get total questions count for badge (e.g. 48 for Autoregulation)
    var qList = (typeof getQuestionsForTopic === 'function') ? getQuestionsForTopic(topic) : [];
    var qCount = qList.length || 48;

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

          // 2. Images with pink badge
          '<button onclick="openFaTopicActions(' + idx + '); switchFaPanelTab(\\'img\\');"' +
            ' class="relative w-9 h-9 rounded-full bg-[#20152e] hover:bg-[#2e1d40] border border-[#48286b] flex items-center justify-center text-slate-200 hover:text-white transition-all shadow" title="Images">' +
            '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>' +
            (imgCount > 0 ? '<span class="absolute -top-1 -right-1 bg-[#db2777] text-[9px] font-black text-white rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow">' + imgCount + '</span>' : '') +
          '</button>' +

          // 3. TICK / CHECKMARK BUTTON WITH QUESTIONS BADGE (CLICK OPENS WHICH QUESTIONS MODAL - SCREENSHOT 2)
          '<button onclick="toggleCalloutMenu(\\'' + calloutId + '\\'); openWhichQuestionsModal(' + idx + ');"' +
            ' class="relative w-9 h-9 rounded-full ' + learnedClass + ' hover:bg-[#321c4a] border border-[#48286b] flex items-center justify-center text-white transition-all shadow hover:scale-105" title="Practice Questions (' + qCount + ')">' +
            '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>' +
            '<span class="absolute -top-1 -right-1 bg-[#db2777] text-[9px] font-black text-white rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow">' + qCount + '</span>' +
          '</button>' +

          // 4. UWorld Tables with pink badge
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

  layer.innerHTML = html;`;

if (OLD_CALLOUT_CODE_REGEX.test(panel)) {
  panel = panel.replace(OLD_CALLOUT_CODE_REGEX, NEW_CALLOUT_CODE);
  console.log('✅ Updated renderFaPageCallouts with checkmark question launcher & pink badges');
} else {
  console.log('⚠️  Regex did not match renderFaPageCallouts in fa_panel.js');
}

fs.writeFileSync(PANEL_JS, panel, 'utf8');
console.log('✅ All patches applied successfully');
