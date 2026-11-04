const fs = require('fs');
const data = JSON.parse(fs.readFileSync('server/fa_complete_dataset.json', 'utf8'));
for (const sys of Object.keys(data.faData)) {
  const d = data.faData[sys].dataJs || '';
  const akMatches = [...d.matchAll(/ak:\s*"([^"]+)"/g)].slice(0, 5);
  if (akMatches.length > 0) {
    console.log(sys, 'sample ak tags:', akMatches.map(m => m[1]));
  }
}
