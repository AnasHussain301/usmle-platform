/**
 * ==============================================================
 * ZETCHY FULL FLASHCARD & ANKING EXTRACTOR (RUN IN CHROME CONSOLE)
 * ==============================================================
 * 1. Open your browser tab on https://zetchy.net (where you are logged in)
 * 2. Press F12 -> Go to Console tab
 * 3. Paste this ENTIRE code and press Enter
 * 4. It will inspect all loaded heading cards and download 'zetchy_cards.json'
 */
(async function extractAllZetchyQuestions() {
  console.log("==================================================");
  console.log("🚀 EXTRACTING ALL HEADING QUESTIONS & FLASHCARDS...");
  console.log("==================================================");

  const exported = {};

  // 1. Inspect window global card caches
  const possibleGlobals = ['ANKING', 'CARDS', 'FA_CARDS', 'QUESTIONS', 'MNEMOSYNE', 'MEHLMAN_Q', 'AK_CARDS'];
  possibleGlobals.forEach(name => {
    if (window[name]) {
      console.log(`✅ Found window.${name}`);
      exported['_' + name] = window[name];
    }
  });

  // 2. Fetch known system card files
  const systems = ['cvs', 'endo', 'gi', 'heme', 'msk', 'neuro', 'psych', 'renal', 'resp', 'repro', 'immuno', 'micro', 'gen'];
  const endpoints = ['cards.js', 'questions.js', 'anki.js', 'mnemosyne.js'];

  for (const sys of systems) {
    for (const ep of endpoints) {
      try {
        const url = `/fa/${sys}/${ep}`;
        const res = await fetch(url);
        if (res.ok) {
          const text = await res.text();
          console.log(`✅ Extracted: ${url} (${text.length} bytes)`);
          exported[`${sys}_${ep}`] = text;
        }
      } catch(e) {}
    }
    // Also try /cards/{sys}.js
    try {
      const url2 = `/cards/${sys}.js`;
      const res2 = await fetch(url2);
      if (res2.ok) {
        const text2 = await res2.text();
        console.log(`✅ Extracted: ${url2} (${text2.length} bytes)`);
        exported[`${sys}_cards`] = text2;
      }
    } catch(e) {}
  }

  // 3. Extract any card objects in localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (/card|anki|q-|quiz|review/i.test(key)) {
      try {
        exported['_ls_' + key] = JSON.parse(localStorage.getItem(key));
      } catch(e) {
        exported['_ls_' + key] = localStorage.getItem(key);
      }
    }
  }

  // 4. Download as zetchy_cards.json
  const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'zetchy_cards.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  console.log("==================================================");
  console.log("🎉 SUCCESS! Saved 'zetchy_cards.json' to your Downloads!");
  console.log("Now move it to: d:\\usmleapp\\data\\zetchy_cards.json");
  console.log("==================================================");
})();
