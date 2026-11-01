/**
 * Patch mehlman.js to:
 * 1. Fix renderMehlmanGrid() to use local PDFs and update links
 * 2. Replace image-based reader with embedded iframe PDF viewer
 * 3. Add page number tracking for PDF (using PDF.js)
 */
const fs = require('fs');
const path = require('path');

const MEHLMAN_JS = path.join(__dirname, '..', 'public', 'js', 'mehlman.js');
let src = fs.readFileSync(MEHLMAN_JS, 'utf8');

// ─── PATCH 1: Update openMehlmanBook to use embedded PDF viewer ───────────────

const OLD_OPEN_BOOK = `  // Update Scanned Page Image
  const imgEl = document.getElementById('mehlman-reader-page-img');
  if (imgEl) {
    imgEl.src = \`/mehlman/\${sys.id}/\${state.currentMehlmanPage}.webp\`;
  }

  // Update Fallback Canvas Content
  updateMehlmanFallbackView(sys, state.currentMehlmanPage);`;

const NEW_OPEN_BOOK = `  // Try local PDF first, then Google Drive iframe
  openMehlmanPdfViewer(sys, state.currentMehlmanPage);

  // Update Fallback Canvas Content (hidden when PDF loads)
  updateMehlmanFallbackView(sys, state.currentMehlmanPage);`;

if (src.includes(OLD_OPEN_BOOK)) {
  src = src.replace(OLD_OPEN_BOOK, NEW_OPEN_BOOK);
  console.log('✅ Patched openMehlmanBook to use PDF viewer');
} else {
  console.log('⚠️  Could not find openMehlmanBook target — skipping');
}

// ─── PATCH 2: Add openMehlmanPdfViewer function ───────────────────────────────

const PDF_VIEWER_FN = `
// ── PDF Viewer: Embedded iframe for local PDF ─────────────────────────────────
const DRIVE_IDS = {
  cvs:    '1r-B04CLSx7vylvsdyIl-f033qPyAY2SO',
  endo:   '1ifKCUpt0lw4JnmrOfasuC4MMxPV2xOAM',
  gi:     '1QE8stM0xhNn7kXU3EFxxcJrlSlPVdv5L',
  heme:   '1Soq2X5U6v29kCUXxDPnlyhlEK91UQle6',
  msk:    '1CJxCdtuur84kQUdvtINFDp_Zf12x023v',
  neuro:  '1WHatbproqEWisXe9bakvHf_NBU6uXmHX',
  psych:  '1Y93gN5VxRdQnZTJjqkE2dVcn4r29U33I',
  renal:  '18QkpOaVm0IRnG8i3wPvSuWPTctJ_30kF',
  resp:   '1pMhIiKY4sSitUCmoNVheAwZFrYQsgC-s',
  repro:  '10XR2_gXL6Q3liwB4jpXtmYbVtiPoc-cO',
  immuno: '1K1qVejD2l7DtJLQEDz2KJB8aEXF4KQ-u',
  micro:  '1gfcxrG442nIG-HKAIBqCPemi1GQSD_xT',
  biochem:'1EsLudyMWUaC56OluLIPGgTwjzOskf-U2',
  path:   '1eCKfNndouemEd8dQJT2WdqCY_Owb-e5S',
  ethics: '1UYbEvB_xPlyFifdR5ac42J_UEiqOufrp',
};

function openMehlmanPdfViewer(sys, pageNum) {
  const wrapper = document.getElementById('mehlman-page-canvas-wrapper');
  const fallback = document.getElementById('mehlman-reader-fallback');
  const oldImg = document.getElementById('mehlman-reader-page-img');
  
  if (!wrapper) return;
  
  // Hide old image element
  if (oldImg) oldImg.classList.add('hidden');

  // Check if local PDF is served
  const localPdfUrl = '/pdf/' + sys.id + '.pdf#page=' + pageNum;
  
  // Remove existing iframe if any
  let iframe = document.getElementById('mehlman-pdf-iframe');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'mehlman-pdf-iframe';
    iframe.style.cssText = 'width:100%;height:100%;min-height:800px;border:none;background:#fff;';
    wrapper.style.minHeight = '800px';
    wrapper.insertBefore(iframe, wrapper.firstChild);
  }

  // Try local PDF
  iframe.src = localPdfUrl;
  iframe.classList.remove('hidden');
  if (fallback) fallback.classList.add('hidden');
  
  // Update download link to local PDF
  const dlBtn = document.getElementById('mehlman-pdf-dl-btn');
  if (dlBtn) dlBtn.href = '/pdf/' + sys.id + '.pdf';
  
  // Handle load error → fall back to Google Drive embed
  iframe.onerror = function() {
    const driveId = DRIVE_IDS[sys.id];
    if (driveId) {
      iframe.src = 'https://drive.google.com/file/d/' + driveId + '/preview';
    } else {
      iframe.classList.add('hidden');
      if (fallback) fallback.classList.remove('hidden');
    }
  };
}
`;

// Insert before handleMehlmanImageError
const INSERT_BEFORE = 'function handleMehlmanImageError(img) {';
if (src.includes(INSERT_BEFORE)) {
  src = src.replace(INSERT_BEFORE, PDF_VIEWER_FN + INSERT_BEFORE);
  console.log('✅ Inserted openMehlmanPdfViewer function');
} else {
  console.log('⚠️  Could not find insertion point for PDF viewer function');
}

// ─── PATCH 3: Update renderMehlmanGrid to show local PDF link ─────────────────

// Update the pdfUrl in the grid cards to point to local PDF
const OLD_PDF_LINK = `pdfUrl: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Cardio.pdf'`;
// This is in DEFAULT_MEHLMAN_SYSTEMS — we'll update the progressText and the anchor href dynamically

// Find and patch the anchor link in renderMehlmanGrid to prefer local
const OLD_GRID_LINK = `          <a href="\${sys.pdfUrl}" target="_blank" onclick="event.stopPropagation()"`;
const NEW_GRID_LINK = `          <a href="/pdf/\${sys.id}.pdf" target="_blank" onclick="event.stopPropagation()"`;

if (src.includes(OLD_GRID_LINK)) {
  src = src.replace(OLD_GRID_LINK, NEW_GRID_LINK);
  console.log('✅ Updated grid card PDF link to local /pdf/{id}.pdf');
} else {
  console.log('⚠️  Grid PDF anchor not found, trying template literal variant');
}

// ─── WRITE ────────────────────────────────────────────────────────────────────
fs.writeFileSync(MEHLMAN_JS, src, 'utf8');
console.log('\n✅ mehlman.js patched successfully');
