/**
 * FIRST AID SCAN PAGES BATCH EXTRACTOR
 * ==============================================================
 * Run in Chrome Console on https://zetchy.net (where you are logged in).
 * 
 * Downloads high-yield First Aid book page scans directly into a zip file:
 * 'fa_pages_batch.zip'
 */

(async function extractFirstAidPages() {
  console.log("🚀 Starting First Aid Scanned Pages Extractor...");

  if (!window.JSZip) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  const zip = new JSZip();

  // High-yield page range based on all 13 systems (or customize range)
  // Let's download the core organ system pages (pp. 280 to 335 for Cardiovascular, etc.)
  // Or grab pages 280 to 450
  const pagesToDownload = [];
  
  // Default: Download current active system's pages (e.g. Cardiovascular 284 to 328, plus sample pages)
  for (let p = 284; p <= 330; p++) pagesToDownload.push(p);
  for (let p = 450; p <= 498; p++) pagesToDownload.push(p);

  console.log(`Downloading ${pagesToDownload.length} scanned book pages...`);

  let count = 0;
  for (const pageNum of pagesToDownload) {
    try {
      const url = `https://zetchy.net/fa-page/${pageNum}.webp`;
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        zip.file(`${pageNum}.webp`, blob);
        count++;
        console.log(`   [${count}/${pagesToDownload.length}] ✓ Page ${pageNum}.webp (${blob.size} bytes)`);
      } else {
        console.warn(`   Page ${pageNum} not available (${res.status})`);
      }
      await new Promise(r => setTimeout(r, 120)); // rate limit protection
    } catch (e) {
      console.error(e);
    }
  }

  console.log("📦 Packaging into fa_pages_batch.zip...");
  const zipBlob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(zipBlob);
  a.download = "fa_pages_batch.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);

  console.log("🎉 SUCCESS: Downloaded fa_pages_batch.zip!");
})();
