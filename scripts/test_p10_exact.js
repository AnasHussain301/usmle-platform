const fs = require('fs');
const path = require('path');
const pdfjs = require(path.resolve('public/js/pdf.min.js'));
pdfjs.GlobalWorkerOptions.workerSrc = path.resolve('public/js/pdf.worker.min.js');

async function testPage10() {
  const data = new Uint8Array(fs.readFileSync('public/pdf/msk.pdf'));
  const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;
  const p10 = await doc.getPage(10);
  const text10 = (await p10.getTextContent()).items.map(it => it.str).join(' ');
  const qStart = text10.indexOf('\u201cI know upper limb');
  const axillaryStart = text10.indexOf('Upper limb nerve HY Points for USMLE');
  console.log('Snippet between Q1 and table:\n', text10.slice(qStart, axillaryStart));
  console.log('\nText after axillaryStart:\n', text10.slice(axillaryStart, axillaryStart + 500));
}

testPage10().catch(console.error);
