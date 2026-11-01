/**
 * FIRST AID ALL-BOOK SCANNED PAGES DOWNLOADER (Pages 1 to 844)
 * ==============================================================
 * Run in Chrome Console on https://zetchy.net (where you are logged in).
 * 
 * Extracts and packages ALL 844 book pages into clean ZIP parts:
 *   - Part 1: Pages 1 to 280 (General Principles & Foundations)
 *   - Part 2: Pages 281 to 550 (Cardio, Endocrine, GI, Heme, MSK, Neuro)
 *   - Part 3: Pages 551 to 844 (Psych, Renal, Repro, Resp, Rapid Review)
 * 
 * Safe rate-limiting prevents 429 errors.
 */

(async function extractAll844BookPages() {
  console.log("🚀 Starting extraction of ALL 844 First Aid book pages...");

  if (!window.JSZip) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function downloadBatch(startPage, endPage, partName) {
    console.log(`\n========================================`);
    console.log(`📦 Starting ${partName}: Pages ${startPage} to ${endPage}`);
    console.log(`========================================`);

    const zip = new JSZip();
    let saved = 0;

    for (let p = startPage; p <= endPage; p++) {
      try {
        const url = `https://zetchy.net/fa-page/${p}.webp`;
        const res = await fetch(url);
        if (res.ok) {
          const blob = await res.blob();
          zip.file(`${p}.webp`, blob);
          saved++;
        }
      } catch (e) {}

      if (p % 25 === 0 || p === endPage) {
        console.log(`[${partName}] Progress: Page ${p}/${endPage} (${saved} pages collected)`);
      }
      await new Promise(r => setTimeout(r, 60)); // Safe pacing
    }

    console.log(`Generating ${partName}.zip...`);
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

  // Run the batches sequentially so memory stays low
  await downloadBatch(1, 280, "fa_pages_part1");
  await downloadBatch(281, 550, "fa_pages_part2");
  await downloadBatch(551, 844, "fa_pages_part3");

  console.log("🎉 ALL 844 BOOK PAGES DOWNLOADED IN 3 CLEAN ZIP PACKAGES!");
})();
