const fs = require('fs');
const path = require('path');
const pdfjs = require(path.resolve('public/js/pdf.min.js'));
pdfjs.GlobalWorkerOptions.workerSrc = path.resolve('public/js/pdf.worker.min.js');

async function inspectStructure() {
  const data = new Uint8Array(fs.readFileSync('public/pdf/msk.pdf'));
  const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;
  
  for (let pageNum = 4; pageNum <= 15; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const str = content.items.map(it => it.str).join(' ');
    
    // Check what questions or headers exist
    console.log(`\n=================== PAGE ${pageNum} ===================`);
    // Find all arrow or bullet or question patterns
    const lines = str.split(/(?=(?:-\s+|•\s+|\d+\.\s+|à\s+|->\s+))/);
    lines.slice(0, 5).forEach((line, i) => {
      console.log(`Line ${i}:`, line.trim().slice(0, 150));
    });
  }
}

inspectStructure().catch(console.error);
