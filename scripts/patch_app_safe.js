const fs = require('fs');

let code = fs.readFileSync('public/js/app.js', 'utf8');

// 1. Update subtitle in renderFirstAidGrid
code = code.replace(
  '<p class="text-[11px] text-white/80">${sys.subtitle}</p>',
  '<p class="text-[11px] text-white/80">Headings by subject and page</p>'
);

// 2. Default easy / forgetting counters
code = code.replace(
  '✓ ${sys.easy} easy · 🔄 ${sys.forgetting} forgetting',
  '✓ ${sys.easy || 0} easy · 🔄 ${sys.forgetting || 0} forgetting'
);

// 3. Update zoomFaPage to scale gutter width
const oldZoom = 'if (label) label.textContent = `${faZoomLevel}%`;';
const newZoom = 'if (label) label.textContent = `${faZoomLevel}%`;\n  const gutter = document.getElementById("fa-page-gutter");\n  if (gutter) {\n    gutter.style.width = `${Math.round(96 * (faZoomLevel / 100))}px`;\n  }';
code = code.replace(oldZoom, newZoom);

// 4. In openFaBookPage: call renderFaGutterMarkers
const oldCallouts = 'if (typeof renderFaPageCallouts === \'function\') renderFaPageCallouts();';
const newCallouts = 'if (typeof renderFaGutterMarkers === "function" && window.FA_HEADINGS_DATA) {\n    const sName = sys ? sys.name : "";\n    const mTopics = window._faPageTopics || (sys ? (sys.topics || []).filter(t => t.page === pageNum) : []);\n    renderFaGutterMarkers(sName, state.currentFaPage, mTopics);\n  } else if (typeof renderFaPageCallouts === "function") {\n    renderFaPageCallouts();\n  }';
code = code.replace(oldCallouts, newCallouts);

// 5. In renderFaBookTOC: delegate to fa_headings.js
const oldTocStart = 'function renderFaBookTOC(topicsList = null) {\n  const tocList = document.getElementById(\'fa-reader-toc-list\');';
const newTocStart = 'function renderFaBookTOC(topicsList = null) {\n  if (typeof renderFaHeadingsTOC === "function" && window.FA_HEADINGS_DATA && Object.keys(window.FA_HEADINGS_DATA).length > 0) {\n    refreshFaHeadingsTOC();\n    return;\n  }\n  const tocList = document.getElementById(\'fa-reader-toc-list\');';
code = code.replace(oldTocStart, newTocStart);

fs.writeFileSync('public/js/app.js', code, 'utf8');

// Verify syntax
new Function(code);
console.log('SUCCESS: public/js/app.js syntax is 100% valid!');
