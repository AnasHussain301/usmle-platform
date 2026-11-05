const fs = require('fs');
const path = require('path');
const pdfjs = require(path.resolve('public/js/pdf.min.js'));
pdfjs.GlobalWorkerOptions.workerSrc = path.resolve('public/js/pdf.worker.min.js');

async function inspectDoc() {
  const data = new Uint8Array(fs.readFileSync('public/pdf/msk.pdf'));
  const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;
  
  // Let's print out how page 10 and 11 are formatted
  const p10 = await doc.getPage(10);
  const text10 = (await p10.getTextContent()).items.map(it => it.str).join(' ');
  
  // Let's find all questions in the text that start with “...?” or “...” ->
  const qaMatches = text10.match(/[“"][^”"]+[”"]\s*(?:à|->|—)[^“"•]+/g);
  console.log('Matches on p.10:');
  if (qaMatches) {
    qaMatches.forEach((m, idx) => console.log(`Card ${idx+1}:`, m.slice(0, 200)));
  }
}

inspectDoc().catch(console.error);
