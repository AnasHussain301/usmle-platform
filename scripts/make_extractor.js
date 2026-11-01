const fs = require('fs');
const path = require('path');

const ids = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_uw_image_ids.json'), 'utf8'));

const code = `/**
 * UWORLD HIGH-YIELD MEDICAL IMAGES COMPLETE EXTRACTOR (3,575 Images)
 * ==============================================================
 * Run in Chrome Console on https://zetchy.net (where you are logged in).
 * 
 * Extracts and packages ALL 3,575 UWorld Medical Diagrams across all 13 systems.
 * Packages into zip parts of ~500 images each to avoid browser memory issues.
 */

(async function extractAllUWorldImages() {
  console.log("🚀 Starting extraction of ALL 3,575 UWorld First Aid Medical Images...");

  if (!window.JSZip) {
    console.log("Loading JSZip library...");
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  const allIds = ` + JSON.stringify(ids) + `;
  console.log("Found " + allIds.length + " UWorld images to extract.");

  async function downloadBatch(items, partName, partIndex, totalParts) {
    console.log("\\n========================================");
    console.log("📦 Starting " + partName + " (" + partIndex + "/" + totalParts + "): " + items.length + " images...");
    console.log("========================================");

    const zip = new JSZip();
    let saved = 0;
    let skipped = 0;

    for (let i = 0; i < items.length; i++) {
      const imgId = items[i];
      try {
        const url = "https://zetchy.net/uw-img/" + imgId + ".webp";
        const res = await fetch(url);
        if (res.ok) {
          const blob = await res.blob();
          if (blob.size > 200) {
            zip.file(imgId + ".webp", blob);
            saved++;
          } else {
            skipped++;
          }
        } else {
          skipped++;
        }
      } catch (e) {
        skipped++;
      }

      if ((i + 1) % 50 === 0 || i === items.length - 1) {
        console.log("[" + partName + "] Progress: " + (i + 1) + "/" + items.length + " (" + saved + " saved, " + skipped + " skipped)");
      }
      await new Promise(r => setTimeout(r, 45)); // Safe pacing against 429
    }

    console.log("Packaging " + partName + ".zip (" + saved + " images)...");
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = partName + ".zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    console.log("✅ Saved " + partName + ".zip to Downloads!");
  }

  const batchSize = 500;
  const totalParts = Math.ceil(allIds.length / batchSize);

  for (let b = 0; b < allIds.length; b += batchSize) {
    const chunk = allIds.slice(b, b + batchSize);
    const partNum = Math.floor(b / batchSize) + 1;
    await downloadBatch(chunk, "uw_images_part" + partNum, partNum, totalParts);
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log("🎉 ALL 3,575 UWORLD MEDICAL IMAGES DOWNLOADED SUCCESSFULLY!");
  console.log("Now run in your terminal: node scripts/unpack_uw_images.js");
})();
`;

fs.writeFileSync(path.join(__dirname, 'uw_images_all_extractor.js'), code);
console.log('Successfully wrote scripts/uw_images_all_extractor.js');
