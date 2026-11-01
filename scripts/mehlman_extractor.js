/**
 * MEHLMAN HIGH-YIELD PDFS & QUESTIONS COMPLETE EXTRACTOR
 * ==============================================================
 * Run in Chrome Console on https://zetchy.net/mehlman/ (where you are logged in).
 * 
 * Extracts:
 *   1. All Mehlman books metadata, page counts, and topics from /mehlman/<sys>/data.js
 *   2. All Mehlman question banks / cards
 *   3. All page scans (/mehlman/<sys>/<page>.webp) packaged into ZIP archives
 *   4. Generates mehlman_complete_dataset.json and mehlman_pages_*.zip
 */

(async function extractMehlman() {
  console.log("=================================================");
  console.log("🚀 STARTING MEHLMAN EXTRACTION FROM ZETCHY.NET");
  console.log("=================================================");

  if (!window.JSZip) {
    console.log("Loading JSZip library...");
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  // 1. All known Mehlman systems/books on zetchy.net
  const MEHLMAN_SYSTEMS = [
    { id: 'cvs', name: 'Cardiovascular', title: 'HY Cardiovascular', color: '#a33a20', totalPages: 74 },
    { id: 'endo', name: 'Endocrine', title: 'HY Endocrine', color: '#b58500', totalPages: 63 },
    { id: 'gi', name: 'Gastrointestinal', title: 'HY Gastrointestinal', color: '#4d6b1f', totalPages: 95 },
    { id: 'heme', name: 'Hematology & Oncology', title: 'HY Hematology & Oncology', color: '#6d183f', totalPages: 60 },
    { id: 'msk', name: 'Musculoskeletal & Skin', title: 'HY Musculoskeletal & Skin', color: '#c26217', totalPages: 68 },
    { id: 'neuro', name: 'Neurology', title: 'HY Neurology', color: '#431980', totalPages: 92 },
    { id: 'psych', name: 'Psychiatry', title: 'HY Psychiatry', color: '#2d45a8', totalPages: 45 },
    { id: 'renal', name: 'Renal', title: 'HY Renal', color: '#166970', totalPages: 58 },
    { id: 'repro', name: 'Reproductive', title: 'HY Reproductive', color: '#9d174d', totalPages: 72 },
    { id: 'resp', name: 'Respiratory', title: 'HY Respiratory', color: '#0369a1', totalPages: 65 },
    { id: 'immuno', name: 'Immunology', title: 'HY Immunology', color: '#047857', totalPages: 48 },
    { id: 'micro', name: 'Microbiology', title: 'HY Microbiology', color: '#15803d', totalPages: 55 },
    { id: 'biochem', name: 'Biochemistry', title: 'HY Biochemistry', color: '#7c3aed', totalPages: 70 },
    { id: 'pharm', name: 'Pharmacology', title: 'HY Pharmacology', color: '#b91c1c', totalPages: 80 },
    { id: 'arrows', name: 'Arrows', title: 'HY Arrows', color: '#be123c', totalPages: 110 },
    { id: 'risk', name: 'Risk Factors', title: 'HY Risk Factors', color: '#c2410c', totalPages: 50 },
    { id: 'ethics', name: 'Ethics', title: 'HY Ethics & Communication', color: '#374151', totalPages: 40 },
    { id: 'gen', name: 'General Pathology', title: 'HY General Pathology', color: '#334155', totalPages: 60 }
  ];

  // Try extracting any runtime variables from window
  const windowVars = {};
  for (let key of Object.keys(window)) {
    if (key.toLowerCase().includes('mehl') || key.toLowerCase().includes('mm') || key.toLowerCase().includes('pdf')) {
      try { windowVars[key] = window[key]; } catch(e) {}
    }
  }

  // 2. Fetch data.js for each system
  console.log("📥 Fetching topics and data for all Mehlman systems...");
  const extractedData = {
    extractedAt: new Date().toISOString(),
    windowVars: windowVars,
    systems: []
  };

  for (const sys of MEHLMAN_SYSTEMS) {
    try {
      const res = await fetch(`/mehlman/${sys.id}/data.js`);
      if (res.ok) {
        const text = await res.text();
        const sandbox = {};
        try { new Function('window', text)(sandbox); } catch(e) {}
        extractedData.systems.push({
          ...sys,
          dataJs: text,
          parsedData: sandbox
        });
        console.log(`✅ [${sys.id}] Captured data.js`);
      } else {
        extractedData.systems.push({ ...sys });
      }
    } catch(e) {
      extractedData.systems.push({ ...sys });
    }
  }

  // Trigger download of mehlman_data.json
  const dataBlob = new Blob([JSON.stringify(extractedData, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(dataBlob);
  a.download = 'mehlman_complete_dataset.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  console.log("✅ Downloaded mehlman_complete_dataset.json!");

  // 3. Batch extract page scans for core systems into a ZIP
  console.log("\n📦 Starting extraction of Mehlman book pages...");
  const systemsToExtract = ['cvs', 'endo', 'gi', 'renal', 'neuro', 'msk', 'heme', 'psych', 'resp', 'repro', 'arrows'];

  for (const sysId of systemsToExtract) {
    const sys = MEHLMAN_SYSTEMS.find(s => s.id === sysId) || { id: sysId, totalPages: 75 };
    const maxP = sys.totalPages || 75;
    const zip = new JSZip();
    let saved = 0;

    console.log(`\nStarting [${sysId}] pages (1 to ${maxP})...`);

    for (let p = 1; p <= maxP; p++) {
      try {
        const r = await fetch(`/mehlman/${sysId}/${p}.webp`);
        if (r.ok) {
          const blob = await r.blob();
          if (blob.size > 200) {
            zip.file(`${p}.webp`, blob);
            saved++;
          }
        }
      } catch(e) {}

      if (p % 25 === 0 || p === maxP) {
        console.log(`[${sysId}] Page ${p}/${maxP} (${saved} saved)`);
      }
      await new Promise(r => setTimeout(r, 45)); // Safe pacing
    }

    if (saved > 0) {
      console.log(`Packaging mehlman_${sysId}_pages.zip (${saved} pages)...`);
      const content = await zip.generateAsync({ type: 'blob' });
      const dl = document.createElement('a');
      dl.href = URL.createObjectURL(content);
      dl.download = `mehlman_${sysId}_pages.zip`;
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);
      URL.revokeObjectURL(dl.href);
      console.log(`✅ Saved mehlman_${sysId}_pages.zip to Downloads!`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log("🎉 MEHLMAN EXTRACTION COMPLETE!");
})();
