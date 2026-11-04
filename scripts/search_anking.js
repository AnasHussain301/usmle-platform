const fs = require('fs');
const str = fs.readFileSync('server/fa_complete_dataset.json', 'utf8');
const matches = [...str.matchAll(/(\/anking\/[^\s"'`]+|\/ak[^\s"'`]+|mnemosyne|akcard)/gi)];
console.log('Matches:', [...new Set(matches.map(m => m[0]))].slice(0, 30));
