const fs = require('fs');
const path = require('path');
const pdfjs = require(path.resolve('public/js/pdf.min.js'));
pdfjs.GlobalWorkerOptions.workerSrc = path.resolve('public/js/pdf.worker.min.js');

async function inspectVignettes() {
  const data = new Uint8Array(fs.readFileSync('public/pdf/msk.pdf'));
  const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;
  
  // On page 10-14, let's look for bullet points that contain clinical questions or "Q asks", etc.
  for (let p = 10; p <= 14; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const str = content.items.map(it => it.str).join(' ');
    
    // Split by bullet points
    const bullets = str.split(/\s*-\s+/);
    console.log(`\nPage ${p} has ${bullets.length} bullets.`);
    bullets.forEach((b, i) => {
      if (b.includes('?') || b.includes('Q asks') || b.includes('question') || b.includes('Q:')) {
        console.log(`  [P${p} Bullet ${i}]:`, b.slice(0, 140));
      }
    });
  }
}

inspectVignettes().catch(console.error);
