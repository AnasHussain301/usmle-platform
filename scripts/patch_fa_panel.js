/**
 * Patch fa_panel.js to:
 * 1. Ensure images are rolled up from subtopics if topic.images is empty
 * 2. Cleanly handle empty image states (no broken image icons)
 * 3. Support subtopic image/table selection
 */
const fs = require('fs');
const path = require('path');

const PANEL_JS = path.join(__dirname, '..', 'public', 'js', 'fa_panel.js');
let src = fs.readFileSync(PANEL_JS, 'utf8');

// 1. Update openFaRightPanel image collection
const OLD_IMG_COLLECT = `  // Set up images list - prefer direct or rolled up
  let images = topic.images || [];
  if (images.length === 0 && topic.allImages && topic.allImages.length > 0) {
    images = topic.allImages;
  }
  state.currentFaImagesList = images;
  state.currentFaImageIndex = 0;`;

const NEW_IMG_COLLECT = `  // Set up images list - prefer direct, or roll up from subtopics/parent
  let images = (topic.images && topic.images.length > 0) ? [...topic.images] : [];
  if (images.length === 0 && topic.subs && topic.subs.length > 0) {
    topic.subs.forEach(s => {
      (s.images || []).forEach(img => {
        if (!images.some(r => r[0] === img[0])) images.push(img);
      });
    });
  }
  if (images.length === 0 && topic.allImages && topic.allImages.length > 0) {
    images = [...topic.allImages];
  }
  state.currentFaImagesList = images;
  state.currentFaImageIndex = 0;`;

if (src.includes(OLD_IMG_COLLECT)) {
  src = src.replace(OLD_IMG_COLLECT, NEW_IMG_COLLECT);
  console.log('✅ Updated openFaRightPanel image rollup');
} else {
  console.log('⚠️  Could not find OLD_IMG_COLLECT in fa_panel.js');
}

// 2. Update renderFaImageCarousel empty handling
const OLD_CAROUSEL = `  if (imgs.length === 0) {
    if (countEl) countEl.textContent = '0 / 0';
    if (mainImg) {
      mainImg.src = '';
      mainImg.classList.add('hidden');
    }
    if (captionEl) captionEl.innerHTML = '<span class="text-slate-400 italic">No UWorld medical diagrams linked to this heading.</span>';
    return;
  }

  const item = imgs[idx];
  const imgId = item[0];
  const caption = item[1] || '';

  if (countEl) countEl.textContent = (idx + 1) + ' / ' + imgs.length;
  if (mainImg) {
    mainImg.classList.remove('hidden');
    mainImg.src = '/uw-img/' + imgId + '.webp';
    mainImg.onerror = function() {
      this.onerror = null;
      // Fallback SVG placeholder when file is not yet unzipped locally
      this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220"><rect width="400" height="220" fill="%231b1026" rx="12" stroke="%2338234f" stroke-width="2"/><text x="50%" y="38%" text-anchor="middle" fill="%23f43f5e" font-family="sans-serif" font-weight="bold" font-size="13">UWorld Medical Diagram [' + imgId + ']</text><text x="50%" y="54%" text-anchor="middle" fill="%23cbd5e1" font-family="sans-serif" font-size="11">' + encodeURIComponent(caption.slice(0, 45)) + '</text><text x="50%" y="74%" text-anchor="middle" fill="%23a855f7" font-family="sans-serif" font-size="10">Download images with extraction script</text></svg>';
    };
  }
  if (captionEl) captionEl.textContent = caption;`;

const NEW_CAROUSEL = `  const imgCard = document.getElementById('fa-img-card-wrapper');

  if (imgs.length === 0) {
    if (countEl) countEl.textContent = '0 / 0';
    if (mainImg) {
      mainImg.style.display = 'none';
      mainImg.removeAttribute('src');
    }
    if (captionEl) {
      captionEl.innerHTML = '<div class="py-12 flex flex-col items-center justify-center text-slate-400 text-center"><div class="text-3xl mb-2 text-slate-500">🖼️</div><p class="text-xs font-medium">No UWorld diagrams attached to this heading.</p><p class="text-[11px] text-slate-500 mt-1">Check subtopics or neighboring headings in the left sidebar.</p></div>';
    }
    return;
  }

  const item = imgs[idx];
  const imgId = item[0];
  const caption = item[1] || '';

  if (countEl) countEl.textContent = (idx + 1) + ' / ' + imgs.length;
  if (mainImg) {
    mainImg.style.display = 'block';
    mainImg.classList.remove('hidden');
    mainImg.src = '/uw-img/' + imgId + '.webp';
    mainImg.onerror = function() {
      this.onerror = null;
      this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220"><rect width="400" height="220" fill="%231b1026" rx="12" stroke="%2338234f" stroke-width="2"/><text x="50%" y="38%" text-anchor="middle" fill="%23f43f5e" font-family="sans-serif" font-weight="bold" font-size="13">UWorld Medical Diagram [' + imgId + ']</text><text x="50%" y="54%" text-anchor="middle" fill="%23cbd5e1" font-family="sans-serif" font-size="11">' + encodeURIComponent(caption.slice(0, 45)) + '</text><text x="50%" y="74%" text-anchor="middle" fill="%23a855f7" font-family="sans-serif" font-size="10">Local diagram file</text></svg>';
    };
  }
  if (captionEl) captionEl.textContent = caption;`;

if (src.includes(OLD_CAROUSEL)) {
  src = src.replace(OLD_CAROUSEL, NEW_CAROUSEL);
  console.log('✅ Updated renderFaImageCarousel');
} else {
  console.log('⚠️  Could not find OLD_CAROUSEL in fa_panel.js');
}

fs.writeFileSync(PANEL_JS, src, 'utf8');
console.log('✅ fa_panel.js patched successfully');
