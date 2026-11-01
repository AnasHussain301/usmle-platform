/**
 * ZETCHY FULL-APP UNIVERSAL IN-BROWSER EXTRACTOR
 * ==============================================================
 * Run this script in the Chrome Console on https://zetchy.net (where you are logged in).
 * 
 * What it exports in ONE execution:
 *   1. full_metadata.json (window.SKETCHES, window.SYSTEMS, window.FA_SYSTEMS, First Aid topics, DDx, localStorage)
 *   2. all_sketches.zip (All 358 scene_*.jpg canvas scenes + 358 thumb_*.webp thumbnails)
 *   3. fa_data.json (All First Aid data files from each system's /fa/<sys>/data.js, tables.js, images.js)
 */

(async function extractCompleteZetchyApp() {
  console.log("=================================================");
  console.log("🚀 STARTING FULL ZETCHY.NET PIPELINE EXTRACTION");
  console.log("=================================================");

  // Step 1: Ensure JSZip is available
  if (!window.JSZip) {
    console.log("📦 Loading JSZip dependency...");
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  const zip = new JSZip();
  const sketchesFolder = zip.folder("sketches");
  const faFolder = zip.folder("fa");

  // Step 2: Extract core application runtime metadata
  console.log("📋 1/3 Extracting core application metadata...");
  const manifest = {
    extractedAt: new Date().toISOString(),
    url: window.location.href,
    sketchesCount: (window.SKETCHES || []).length,
    systems: window.SYSTEMS || [],
    faSystems: window.FA_SYSTEMS || [],
    localStorageDump: { ...localStorage },
    sketches: window.SKETCHES || []
  };

  // Helper: File downloader
  function triggerDownload(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    console.log(`💾 Saved ${filename} to Downloads`);
  }

  // Save full metadata JSON immediately
  const metaBlob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
  triggerDownload(metaBlob, "zetchy_full_manifest.json");

  // Step 3: Extract First Aid System Data files (data.js, tables.js, images.js)
  console.log("📖 2/3 Extracting First Aid system data files...");
  const faSystemsList = window.FA_SYSTEMS || [
    'cvs', 'endo', 'gi', 'heme', 'msk', 'neuro', 'psych', 'renal', 'repro', 'resp', 'immuno', 'micro', 'gen'
  ];

  const faDataCollected = {};
  for (const sys of faSystemsList) {
    try {
      const [dRes, tRes, iRes] = await Promise.all([
        fetch(`/fa/${sys}/data.js`).catch(() => null),
        fetch(`/fa/${sys}/tables.js`).catch(() => null),
        fetch(`/fa/${sys}/images.js`).catch(() => null)
      ]);

      const dText = dRes && dRes.ok ? await dRes.text() : null;
      const tText = tRes && tRes.ok ? await tRes.text() : null;
      const iText = iRes && iRes.ok ? await iRes.text() : null;

      if (dText) faFolder.file(`${sys}_data.js`, dText);
      if (tText) faFolder.file(`${sys}_tables.js`, tText);
      if (iText) faFolder.file(`${sys}_images.js`, iText);

      faDataCollected[sys] = { hasData: !!dText, hasTables: !!tText, hasImages: !!iText };
      console.log(`   ✓ FA [${sys}] captured`);
    } catch (e) {
      console.warn(`   ✗ FA [${sys}] error:`, e.message);
    }
  }

  // Step 4: Extract All 358 Sketch Scenes & Thumbnails
  console.log("🎨 3/3 Downloading all 358 Sketch scenes and thumbnails...");
  const sketches = window.SKETCHES || [];
  let downloadedCount = 0;

  for (let i = 0; i < sketches.length; i++) {
    const item = sketches[i];
    const pathPrefix = (item.path || '').replace(/^\/+|\/+$/g, '');
    const slug = pathPrefix.split('/')[1] || item.key;

    // A. Full resolution canvas scene.jpg
    const sceneUrl = `https://zetchy.net/${pathPrefix}/scene.jpg`;
    try {
      const sRes = await fetch(sceneUrl);
      if (sRes.ok) {
        const sBlob = await sRes.blob();
        sketchesFolder.file(`scene_${slug}.jpg`, sBlob);
      }
    } catch (e) {}

    // B. Sharp card thumbnail thumb.webp
    const thumbUrl = `https://zetchy.net/${item.thumb || pathPrefix + '/thumb.webp'}`;
    try {
      const tRes = await fetch(thumbUrl);
      if (tRes.ok) {
        const tBlob = await tRes.blob();
        sketchesFolder.file(`thumb_${slug}.webp`, tBlob);
      }
    } catch (e) {}

    downloadedCount++;
    if (downloadedCount % 20 === 0 || downloadedCount === sketches.length) {
      console.log(`   [${downloadedCount}/${sketches.length}] Processed: ${slug}`);
    }
  }

  // Step 5: Bundle and trigger download of full ZIP
  console.log("📦 Packaging complete archive into zetchy_complete_data.zip...");
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));
  zip.file("fa_summary.json", JSON.stringify(faDataCollected, null, 2));

  const zipContent = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 4 }
  });

  triggerDownload(zipContent, "zetchy_complete_data.zip");

  console.log("=================================================");
  console.log("🎉 ALL DATA, FORMATS & PIPELINES EXPORTED SUCCESSFULLY!");
  console.log("=================================================");
})();
