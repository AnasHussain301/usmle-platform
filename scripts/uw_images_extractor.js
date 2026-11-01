/**
 * UWORLD HIGH-YIELD IMAGES BATCH EXTRACTOR (/uw-img/<id>.webp)
 * ==============================================================
 * Run in Chrome Console on https://zetchy.net (where you are logged in).
 * 
 * Downloads high-yield UWorld medical diagrams & pictures for First Aid into zip parts:
 * 'uw_images_part1.zip', etc.
 */

(async function extractUWorldImages() {
  console.log("🚀 Starting extraction of UWorld First Aid Images...");

  if (!window.JSZip) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // Collect all image IDs from window.FA_IMAGES
  const imageIds = new Set();
  const systems = window.FA_SYSTEMS || Object.keys(window.FA_IMAGES || {});
  
  systems.forEach(sys => {
    const sysImages = (window.FA_IMAGES || {})[sys] || {};
    Object.values(sysImages).forEach(list => {
      (list || []).forEach(item => {
        if (item && item[0]) imageIds.add(item[0]);
      });
    });
  });

  const idList = Array.from(imageIds);
  console.log(`Found ${idList.length} unique UWorld medical images across First Aid!`);

  async function downloadBatch(items, partName) {
    console.log(`\n========================================`);
    console.log(`📦 Starting ${partName}: ${items.length} images...`);
    console.log(`========================================`);

    const zip = new JSZip();
    let saved = 0;

    for (let i = 0; i < items.length; i++) {
      const imgId = items[i];
      try {
        const url = `https://zetchy.net/uw-img/${imgId}.webp`;
        const res = await fetch(url);
        if (res.ok) {
          const blob = await res.blob();
          zip.file(`${imgId}.webp`, blob);
          saved++;
        }
      } catch (e) {}

      if ((i + 1) % 40 === 0 || i === items.length - 1) {
        console.log(`[${partName}] Progress: ${i + 1}/${items.length} (${saved} saved)`);
      }
      await new Promise(r => setTimeout(r, 45));
    }

    console.log(`Packaging ${partName}.zip...`);
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = `${partName}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    console.log(`✅ Saved ${partName}.zip to Downloads!`);
  }

  // Split into manageable batches of 500 images
  const batchSize = 500;
  for (let b = 0; b < idList.length; b += batchSize) {
    const chunk = idList.slice(b, b + batchSize);
    const partNum = Math.floor(b / batchSize) + 1;
    await downloadBatch(chunk, `uw_images_part${partNum}`);
  }

  console.log("🎉 ALL UWORLD FIRST AID IMAGES DOWNLOADED!");
})();
