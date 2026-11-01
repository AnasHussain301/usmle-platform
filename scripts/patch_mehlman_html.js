/**
 * Fix Mehlman grid loading issue + update HTML modal for iframe PDF viewer
 */
const fs = require('fs');
const path = require('path');

const HTML = path.join(__dirname, '..', 'public', 'index.html');
let src = fs.readFileSync(HTML, 'utf8');

// ─── PATCH 1: Fix canvas wrapper to be a proper height for iframe ─────────────
const OLD_WRAPPER = `<div id="mehlman-page-canvas-wrapper" class="w-full bg-white rounded-lg border border-[#2b183d] overflow-hidden shadow-2xl relative min-h-[700px] flex justify-center">`;
const NEW_WRAPPER = `<div id="mehlman-page-canvas-wrapper" class="w-full bg-white rounded-lg border border-[#2b183d] overflow-hidden shadow-2xl relative flex justify-center" style="min-height:85vh;">`;

if (src.includes(OLD_WRAPPER)) {
  src = src.replace(OLD_WRAPPER, NEW_WRAPPER);
  console.log('✅ Fixed canvas wrapper height for PDF iframe');
} else {
  console.log('⚠️  Canvas wrapper not found');
}

// ─── PATCH 2: Add scroll area styles for PDF iframe container ─────────────────
const OLD_CENTER = `      <!-- Center: Scanned Book Canvas & Interactive Overlay -->
      <div class="flex-1 overflow-y-auto flex flex-col items-center p-2 sm:p-6 bg-[#0a0510] relative">`;
const NEW_CENTER = `      <!-- Center: PDF Viewer & Fallback -->
      <div class="flex-1 overflow-hidden flex flex-col bg-[#0a0510] relative">`;

if (src.includes(OLD_CENTER)) {
  src = src.replace(OLD_CENTER, NEW_CENTER);
  console.log('✅ Updated center area class for full-height PDF');
} else {
  console.log('⚠️  Center area not found — trying partial match');
}

// ─── PATCH 3: Simplify the inner wrapper ─────────────────────────────────────
const OLD_INNER = `        <div class="max-w-4xl w-full flex flex-col items-center">`;
const NEW_INNER = `        <div class="w-full h-full flex flex-col" style="height:calc(100vh - 80px);">`;

if (src.includes(OLD_INNER)) {
  src = src.replace(OLD_INNER, NEW_INNER);
  console.log('✅ Fixed inner content wrapper');
}

fs.writeFileSync(HTML, src, 'utf8');
console.log('\n✅ index.html patched for PDF viewer');
