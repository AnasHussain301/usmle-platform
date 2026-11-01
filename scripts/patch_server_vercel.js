const fs = require('fs');
const path = require('path');

const SERVER_FILE = path.join(__dirname, '..', 'server', 'index.js');
let src = fs.readFileSync(SERVER_FILE, 'utf8');

const OLD_LISTEN = `// Start Server
app.listen(PORT, () => {
  console.log(\`====================================================\`);
  console.log(\`dYc RadMed USMLE Platform running on http://localhost:\${PORT}\`);
  console.log(\`dY\`\` Admin Portal: Login with admin@radmed.local / Admin123!\`);
  console.log(\`dY - AI Rad Bot: Active and loaded with Radiology KB\`);
  console.log(\`====================================================\`);
});`;

// Try match ignoring exact emoji bytes
const OLD_REGEX = /\/\/ Start Server[\s\S]*app\.listen\([\s\S]*?\);?\s*$/;

const NEW_LISTEN = `// Export for Vercel Serverless
module.exports = app;

// Start Server locally if not imported as a serverless function
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(\`🩺 RadMed USMLE Platform running on http://localhost:\${PORT}\`);
    console.log('👑 Admin Portal: Login with admin@radmed.local / Admin123!');
    console.log('🤖 AI Rad Bot: Active and loaded with Radiology KB');
    console.log('====================================================');
  });
}`;

if (OLD_REGEX.test(src)) {
  src = src.replace(OLD_REGEX, NEW_LISTEN);
  fs.writeFileSync(SERVER_FILE, src, 'utf8');
  console.log('✅ Patched server/index.js with module.exports');
} else {
  console.log('⚠️  Regex did not match end of server/index.js');
}
