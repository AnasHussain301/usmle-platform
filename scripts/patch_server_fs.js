const fs = require('fs');
const path = require('path');

const SERVER_FILE = path.join(__dirname, '..', 'server', 'index.js');
let src = fs.readFileSync(SERVER_FILE, 'utf8');

if (!src.startsWith("const fs = require('fs');")) {
  src = "const fs = require('fs');\n" + src;
  fs.writeFileSync(SERVER_FILE, src, 'utf8');
  console.log('✅ Added fs import to top of server/index.js');
}
