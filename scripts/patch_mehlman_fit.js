/**
 * Fix public/js/mehlman.js:
 * 1. Cancel running renderTask so page changes NEVER get stuck
 * 2. Calculate proper fit & high-DPI retina scale
 * 3. Support smooth page navigation to any page (1 to totalPages)
 * 4. Center canvas cleanly
 */
const fs = require('fs');
const path = require('path');

const MEHLMAN_JS = path.join(__dirname, '..', 'public', 'js', 'mehlman.js');
let src = fs.readFileSync(MEHLMAN_JS, 'utf8');

// Replace the PDF rendering section
const OLD_RENDER_BLOCK = `// PDF.js instance cache
let _mehlmanPdfDoc = null;
let _mehlmanPdfSysId = null;
let _mehlmanPageRendering = false;
let _mehlmanPageNumPending = null;`;

const NEW_RENDER_BLOCK = `// PDF.js instance cache
let _mehlmanPdfDoc = null;
let _mehlmanPdfSysId = null;
let _mehlmanRenderTask = null;
let _mehlmanIsRendering = false;
let _mehlmanPendingPage = null;`;

src = src.replace(OLD_RENDER_BLOCK, NEW_RENDER_BLOCK);

// Rewrite renderMehlmanPage & queueRenderMehlmanPage & openMehlmanBook
const OLD_FUNCTIONS_START = 'async function openMehlmanBook(systemId, pageNum = 1) {';
const OLD_FUNCTIONS_END = '// Table of Contents Drawer';

const NEW_FUNCTIONS = `async function openMehlmanBook(systemId, pageNum = 1) {
  const sys = (state.mehlmanSystems || DEFAULT_MEHLMAN_SYSTEMS).find(s => s.id === systemId);
  if (!sys) return;

  state.currentMehlmanSystem = sys;
  const p = Math.max(1, parseInt(pageNum, 10) || 1);
  state.currentMehlmanPage = p;

  // Open modal
  const modal = document.getElementById('modal-mehlman-reader');
  if (modal) modal.classList.remove('hidden');

  updateMehlmanHeaderIndicators();
  renderMehlmanTOC(sys);

  // If already loaded this document, jump straight to the page
  if (_mehlmanPdfDoc && _mehlmanPdfSysId === systemId) {
    goToMehlmanPage(state.currentMehlmanPage);
    return;
  }

  // Cancel any active render task
  if (_mehlmanRenderTask) {
    try { _mehlmanRenderTask.cancel(); } catch(e) {}
    _mehlmanRenderTask = null;
  }

  const loadingEl = document.getElementById('mehlman-pdf-loading');
  if (loadingEl) loadingEl.classList.remove('hidden');

  const pdfUrl = '/pdf/' + sys.id + '.pdf';

  try {
    if (typeof pdfjsLib === 'undefined') {
      throw new Error('PDF.js library not ready');
    }
    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true
    });
    _mehlmanPdfDoc = await loadingTask.promise;
    _mehlmanPdfSysId = systemId;
    if (_mehlmanPdfDoc.numPages) {
      sys.totalPages = _mehlmanPdfDoc.numPages;
    }
    updateMehlmanHeaderIndicators();
    renderMehlmanTOC(sys);
    goToMehlmanPage(state.currentMehlmanPage);
  } catch (err) {
    console.error('PDF.js load error:', err);
    if (loadingEl) loadingEl.classList.add('hidden');
    showMehlmanFallback(sys, state.currentMehlmanPage);
  }
}

async function renderMehlmanPage(num) {
  if (!_mehlmanPdfDoc) return;

  // If a page is actively rendering, cancel it and queue this target
  if (_mehlmanIsRendering) {
    _mehlmanPendingPage = num;
    if (_mehlmanRenderTask) {
      try { _mehlmanRenderTask.cancel(); } catch(e) {}
      _mehlmanRenderTask = null;
    }
    return;
  }

  _mehlmanIsRendering = true;
  state.currentMehlmanPage = num;
  if (state.currentMehlmanSystem) {
    localStorage.setItem('mmb-' + state.currentMehlmanSystem.id + '-last', num);
  }

  const loadingEl = document.getElementById('mehlman-pdf-loading');
  if (loadingEl) loadingEl.classList.remove('hidden');

  try {
    const page = await _mehlmanPdfDoc.getPage(num);
    const canvas = document.getElementById('mehlman-pdf-canvas');
    if (!canvas) {
      _mehlmanIsRendering = false;
      return;
    }
    const ctx = canvas.getContext('2d', { alpha: false });

    // Device Pixel Ratio for sharp retina text rendering
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Calculate fit width based on viewer wrapper width
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
    canvas.style.height = Math.floor(viewport.height) + 'px';

    ctx.save();
    ctx.scale(dpr, dpr);

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    _mehlmanRenderTask = page.render(renderContext);
    await _mehlmanRenderTask.promise;
    _mehlmanRenderTask = null;

    ctx.restore();

    canvas.classList.remove('hidden');
    const fallback = document.getElementById('mehlman-reader-fallback');
    if (fallback) fallback.classList.add('hidden');
  } catch (err) {
    if (err && err.name !== 'RenderingCancelledException') {
      console.error('Error rendering Mehlman page:', err);
    }
  } finally {
    if (loadingEl) loadingEl.classList.add('hidden');
    _mehlmanIsRendering = false;

    // If another page was requested while rendering, process it now
    if (_mehlmanPendingPage !== null) {
      const nextNum = _mehlmanPendingPage;
      _mehlmanPendingPage = null;
      renderMehlmanPage(nextNum);
    }
  }

  updateMehlmanHeaderIndicators();
  renderMehlmanTOC(state.currentMehlmanSystem);
}

function goToMehlmanPage(pageNum) {
  const sys = state.currentMehlmanSystem;
  if (!sys) return;
  const max = (_mehlmanPdfDoc ? _mehlmanPdfDoc.numPages : sys.totalPages) || 999;
  const target = Math.max(1, Math.min(max, parseInt(pageNum, 10) || 1));
  renderMehlmanPage(target);

  // Scroll viewer to top on page flip
  const scrollArea = document.getElementById('mehlman-scroll-area');
  if (scrollArea) scrollArea.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextMehlmanPage() {
  if (!state.currentMehlmanSystem) return;
  goToMehlmanPage(state.currentMehlmanPage + 1);
}

function prevMehlmanPage() {
  if (!state.currentMehlmanSystem) return;
  goToMehlmanPage(state.currentMehlmanPage - 1);
}

`;

const regex = /async function openMehlmanBook[\s\S]*?\/\/ Table of Contents Drawer/;
if (regex.test(src)) {
  src = src.replace(regex, NEW_FUNCTIONS + '\n// Table of Contents Drawer');
  console.log('✅ Replaced openMehlmanBook, renderMehlmanPage, and navigation logic');
} else {
  console.log('⚠️  Regex did not match function block in mehlman.js');
}

fs.writeFileSync(MEHLMAN_JS, src, 'utf8');
console.log('✅ public/js/mehlman.js successfully patched');
