/**
 * FIRST AID DATA & SCRIPTS EXTRACTOR
 * ==============================================================
 * Run in Chrome Console on https://zetchy.net (where you are logged in).
 * 
 * Safely extracts:
 *   1. All First Aid topics & headings from data.js
 *   2. All First Aid UWorld high-yield tables from tables.js
 *   3. All First Aid UWorld images from images.js
 *   4. Full runtime manifest and settings
 * 
 * Downloads a single compact JSON file: 'fa_complete_dataset.json'
 */

(async function extractFirstAidData() {
  console.log("🚀 Extracting First Aid data and structures from zetchy.net...");

  const systems = window.FA_SYSTEMS || [
    'cvs', 'endo', 'gi', 'heme', 'msk', 'neuro', 'psych', 'renal', 'repro', 'resp', 'immuno', 'micro', 'gen'
  ];

  const fullData = {
    extractedAt: new Date().toISOString(),
    systems: window.SYSTEMS || [],
    faSystems: systems,
    faData: {},
    localStorage: { ...localStorage }
  };

  for (const sys of systems) {
    try {
      console.log(`⏳ Fetching First Aid: ${sys}...`);
      const [dRes, tRes, iRes] = await Promise.all([
        fetch(`/fa/${sys}/data.js`).catch(() => null),
        fetch(`/fa/${sys}/tables.js`).catch(() => null),
        fetch(`/fa/${sys}/images.js`).catch(() => null)
      ]);

      const dataJs = dRes && dRes.ok ? await dRes.text() : '';
      const tablesJs = tRes && tRes.ok ? await tRes.text() : '';
      const imagesJs = iRes && iRes.ok ? await iRes.text() : '';

      fullData.faData[sys] = {
        dataJs,
        tablesJs,
        imagesJs
      };
      console.log(`✅ [${sys}] captured successfully`);
      await new Promise(r => setTimeout(r, 200)); // prevent any throttling
    } catch (e) {
      console.warn(`Error on ${sys}:`, e);
    }
  }

  // Trigger download as clean JSON
  const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "fa_complete_dataset.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);

  console.log("🎉 ALL FIRST AID DATA EXTRACTED TO fa_complete_dataset.json!");
})();
