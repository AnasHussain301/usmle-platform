const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'public', 'js', 'app.js');
let code = fs.readFileSync(appJsPath, 'utf8');

// 1. ALL_VIEWS
code = code.replace(
  "const ALL_VIEWS = ['home', 'fa', 'sketchy', 'sketchy-path', 'sketchy-deck', 'sketch-detail', 'review', 'ddx', 'qbank', 'exam', 'admin'];",
  "const ALL_VIEWS = ['home', 'fa', 'sketchy', 'sketchy-path', 'sketchy-deck', 'sketch-detail', 'review', 'ddx', 'qbank', 'exam', 'admin', 'mehlman'];"
);

// 2. hashMap in navigate
code = code.replace(
  "const hashMap = { home: '', fa: 'fa', sketchy: 'sketchy', 'sketchy-path': 'sketchy', 'sketchy-deck': 'sketchy', 'sketch-detail': 'sketchy', review: 'review', ddx: 'ddx', qbank: 'qbank', exam: 'qbank', admin: 'admin' };",
  "const hashMap = { home: '', fa: 'fa', sketchy: 'sketchy', 'sketchy-path': 'sketchy', 'sketchy-deck': 'sketchy', 'sketch-detail': 'sketchy', review: 'review', ddx: 'ddx', qbank: 'qbank', exam: 'qbank', admin: 'admin', mehlman: 'mehlman' };"
);

// 3. navigate handlers
code = code.replace(
  "if (viewName === 'qbank') renderQBankList();",
  "if (viewName === 'qbank') renderQBankList();\n  if (viewName === 'mehlman' && typeof renderMehlmanGrid === 'function') renderMehlmanGrid();"
);

// 4. loadZetchyData call
code = code.replace(
  "renderSketchyPathBrowser();\n    }",
  "renderSketchyPathBrowser();\n    }\n    if (typeof loadMehlmanSystems === 'function') loadMehlmanSystems();"
);

// 5. handleHash
code = code.replace(
  "if (['fa', 'sketchy', 'review', 'ddx', 'qbank', 'admin'].includes(hash)) {",
  "if (['fa', 'sketchy', 'review', 'ddx', 'qbank', 'admin', 'mehlman'].includes(hash)) {"
);

fs.writeFileSync(appJsPath, code, 'utf8');
console.log('✅ Patched app.js with Mehlman routing and initialization');
