const fs = require('fs');
const path = require('path');
const pdfjs = require(path.resolve('public/js/pdf.min.js'));
pdfjs.GlobalWorkerOptions.workerSrc = path.resolve('public/js/pdf.worker.min.js');

async function inspectPdf() {
  const data = new Uint8Array(fs.readFileSync('public/pdf/msk.pdf'));
  const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;
  console.log('MSK numPages:', doc.numPages);
  
  // Let's examine page 10 closely
  const p10 = await doc.getPage(10);
  const textContent = await p10.getTextContent();
  const rawItems = textContent.items.map(it => it.str);
  console.log('Page 10 item count:', rawItems.length);
  console.log('Page 10 text preview:\n', rawItems.join(' ').slice(0, 1000));
}

inspectPdf().catch(console.error);
