const fs = require('fs');
const path = require('path');
const pdfjs = require(path.resolve('public/js/pdf.min.js'));
pdfjs.GlobalWorkerOptions.workerSrc = path.resolve('public/js/pdf.worker.min.js');

async function extractP10to13() {
  const data = new Uint8Array(fs.readFileSync('public/pdf/msk.pdf'));
  const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;
  
  for (let p = 10; p <= 13; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const str = content.items.map(it => it.str).join(' ');
    // Find all questions starting with “...?” or “...”
    const matches = str.match(/[\u201c"][^”"\n\r]{10,250}[\u201d"]\s*(?:à|->|—|:)?/g);
    console.log(`Page ${p} candidate questions:`, matches);
  }
}

extractP10to13().catch(console.error);
