const fs = require('fs');
const path = require('path');
const pdfjs = require(path.resolve('public/js/pdf.min.js'));
pdfjs.GlobalWorkerOptions.workerSrc = path.resolve('public/js/pdf.worker.min.js');

async function findCards() {
  const data = new Uint8Array(fs.readFileSync('public/pdf/msk.pdf'));
  const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;
  
  for (let p = 9; p <= 14; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const str = content.items.map(it => it.str).join(' ');
    
    // Find all question/quote markers
    const matches = str.match(/[\u201c"][^\u201d"]{15,250}[\u201d"]/g);
    if (matches) {
      console.log(`Page ${p} quotes (${matches.length}):`);
      matches.forEach(m => console.log('  ->', m.trim()));
    }
  }
}

findCards().catch(console.error);
