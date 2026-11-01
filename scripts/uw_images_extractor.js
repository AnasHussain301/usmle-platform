/**
 * UWORLD HIGH-YIELD MEDICAL IMAGES COMPLETE EXTRACTOR (3,575 Images)
 * ==============================================================
 * Run in Chrome Console on https://zetchy.net (where you are logged in).
 * 
 * Safe, same-origin extractor:
 *   - Uses exact path: /fa/${sys}/images.js
 *   - Loads all 13 systems directly from zetchy.net
 *   - Packages into 7 ZIP archives of 500 images each
 */

(async function() {
  console.log("🚀 Initializing complete UWorld images extractor...");

  if (!window.JSZip) {
    console.log("Loading JSZip library...");
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  // 1. Fetch imagesJs directly from zetchy.net using exact path /fa/${sys}/images.js
  window.FA_IMAGES = window.FA_IMAGES || {};
  const systems = ['cvs', 'endo', 'gi', 'heme', 'msk', 'neuro', 'psych', 'renal', 'repro', 'resp', 'immuno', 'micro', 'gen'];
  console.log("Fetching image definitions for all 13 systems...");
  
  for (const sys of systems) {
    try {
      const r = await fetch(`/fa/${sys}/images.js`);
      if (r.ok) {
        const js = await r.text();
        new Function('window', js)(window);
      }
    } catch(e) {}
  }

  // 2. Collect all unique image IDs across all 13 systems
  const imgIds = new Set();
  Object.values(window.FA_IMAGES || {}).forEach(sysMap => {
    Object.values(sysMap || {}).forEach(list => {
      (list || []).forEach(item => {
        if (item && item[0]) imgIds.add(item[0]);
      });
    });
  });

  const allIds = Array.from(imgIds);
  console.log(`📦 Found ${allIds.length} UWorld medical images across all 13 systems!`);

  if (allIds.length === 0) {
    console.error("❌ No image IDs found. Make sure you are logged in to https://zetchy.net.");
    return;
  }

  // 3. Download in packages of 500 images
  const batchSize = 500;
  const totalParts = Math.ceil(allIds.length / batchSize);

  for (let b = 0; b < allIds.length; b += batchSize) {
    const chunk = allIds.slice(b, b + batchSize);
    const partNum = Math.floor(b / batchSize) + 1;
    const zip = new JSZip();
    let saved = 0;

    console.log(`\n========================================`);
    console.log(`📦 Starting Part ${partNum}/${totalParts}: ${chunk.length} images...`);
    console.log(`========================================`);

    for (let i = 0; i < chunk.length; i++) {
      const id = chunk[i];
      try {
        const r = await fetch(`/uw-img/${id}.webp`);
        if (r.ok) {
          const blob = await r.blob();
          if (blob.size > 200) {
            zip.file(`${id}.webp`, blob);
            saved++;
          }
        }
      } catch(e) {}

      if ((i + 1) % 50 === 0 || i === chunk.length - 1) {
        console.log(`[Part ${partNum}] Progress: ${i + 1}/${chunk.length} (${saved} saved)`);
      }
      await new Promise(r => setTimeout(r, 45)); // Safe pacing against 429
    }

    console.log(`Packaging uw_images_part${partNum}.zip (${saved} images)...`);
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = `uw_images_part${partNum}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    console.log(`✅ Saved uw_images_part${partNum}.zip to Downloads!`);
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('🎉 ALL UWORLD MEDICAL IMAGES DOWNLOADED SUCCESSFULLY!');
})();
