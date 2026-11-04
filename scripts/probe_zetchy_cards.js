/**
 * ZETCHY FLASHCARDS / ANKING / MNEMOSYNE EXTRACTOR
 * Paste this in Chrome Console on https://zetchy.net (on the page shown in screenshot)
 */
(async function extractZetchyCards() {
  console.log("🔍 Inspecting Zetchy Flashcards & AnKing engine...");

  // 1. Check window globals
  const candKeys = Object.keys(window).filter(k => 
    /anki|card|mnemo|mehlman|question|quiz|test|flash/i.test(k)
  );
  console.log("Relevant window keys found:", candKeys);
  candKeys.forEach(k => {
    try {
      const val = window[k];
      const len = Array.isArray(val) ? val.length : (typeof val === 'object' && val ? Object.keys(val).length : typeof val);
      console.log(`  window.${k}:`, len);
    } catch(e) {}
  });

  // 2. Check IndexedDB
  try {
    const dbs = await indexedDB.databases();
    console.log("IndexedDB databases:", dbs);
  } catch(e) {}

  // 3. Test common card endpoint patterns
  const testEndpoints = [
    '/anki/cvs.js',
    '/cards/cvs.js',
    '/cards/autoregulation.json',
    '/api/cards/cvs',
    '/api/cards/autoregulation',
    '/mnemosyne/cvs.js',
    '/mnemosyne/autoregulation.json',
    '/q/cvs.js',
    '/mehlman/cvs/questions.js',
    '/fa/cvs/cards.js',
    '/fa/cvs/questions.js',
    '/fa/cvs/anki.js'
  ];

  console.log("Probing network endpoints...");
  for (const ep of testEndpoints) {
    try {
      const res = await fetch(ep);
      if (res.ok) {
        const text = await res.text();
        console.log(`✅ FOUND ENDPOINT ${ep} (status: ${res.status}, length: ${text.length} chars)`);
        console.log(`   Preview:`, text.slice(0, 150));
      } else {
        // console.log(`  ${ep} -> ${res.status}`);
      }
    } catch(e) {}
  }

  // 4. Inspect current heading card state
  // On page 299, check if cards are already attached to the DOM or state
  const stateObj = window.state || window.__STATE__ || window.appState || window.ZETCHY;
  if (stateObj) {
    console.log("Found app state object:", Object.keys(stateObj));
  }
})();
