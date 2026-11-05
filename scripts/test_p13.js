const fs = require('fs');
const path = require('path');
const pdfjs = require(path.resolve('public/js/pdf.min.js'));
pdfjs.GlobalWorkerOptions.workerSrc = path.resolve('public/js/pdf.worker.min.js');

async function testPage13() {
  const data = new Uint8Array(fs.readFileSync('public/pdf/msk.pdf'));
  const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;
  const p13 = await doc.getPage(13);
  const text13 = (await p13.getTextContent()).items.map(it => it.str).join(' ');
  const qStart = text13.indexOf('\u201cDoes USMLE care');
  console.log('Snippet around reflexes question on p.13:\n', text13.slice(qStart, qStart + 400));
}

testPage13().catch(console.error);
