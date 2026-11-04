const fs = require('fs');
const path = require('path');

const SERVER_FILE = path.join(__dirname, '..', 'server', 'index.js');
let src = fs.readFileSync(SERVER_FILE, 'utf8');

const ROUTE_CODE = `
// API: First Aid Flashcards & AnKing Questions
app.get('/api/fa/cards', (req, res) => {
  const cardsFile = path.join(__dirname, '..', 'data', 'zetchy_cards.json');
  if (fs.existsSync(cardsFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(cardsFile, 'utf8'));
      return res.json({ success: true, cards: data });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to read zetchy_cards.json' });
    }
  }
  res.json({ success: true, cards: {} });
});
`;

if (!src.includes('/api/fa/cards')) {
  src = src.replace('// Static frontend serving', ROUTE_CODE + '\n// Static frontend serving');
  fs.writeFileSync(SERVER_FILE, src, 'utf8');
  console.log('✅ Added /api/fa/cards endpoint in server/index.js');
} else {
  console.log('⚠️  /api/fa/cards already present');
}
