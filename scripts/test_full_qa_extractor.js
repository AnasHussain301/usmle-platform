const fs = require('fs');
const path = require('path');
const pdfjs = require(path.resolve('public/js/pdf.min.js'));
pdfjs.GlobalWorkerOptions.workerSrc = path.resolve('public/js/pdf.worker.min.js');

async function extractAllQuestions(pdfName) {
  const data = new Uint8Array(fs.readFileSync(path.join('public/pdf', pdfName)));
  const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;
  const questions = [];
  
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const str = content.items.map(it => it.str).join(' ');
    
    // Pattern 1: “Question text here” à Answer text here
    // In Mehlman PDFs, questions are explicitly placed in curly quotes “...” followed by à (or ->)
    const regex = /[\u201c"]([^\u201d"]{15,300}\??)[\u201d"]\s*(?:à|->)\s*([^•\u201c\n\r]{10,600})/g;
    let match;
    while ((match = regex.exec(str)) !== null) {
      const q = match[1].trim();
      let a = match[2].trim();
      // Clean up answer if next bullet starts
      if (a.includes('  -   ')) a = a.split('  -   ')[0].trim();
      questions.push({ page: p, q: `“${q}”`, a });
    }
  }
  return questions;
}

async function run() {
  const mskQuestions = await extractAllQuestions('msk.pdf');
  console.log('Total extracted Q&A pairs from MSK:', mskQuestions.length);
  mskQuestions.slice(0, 10).forEach((item, i) => {
    console.log(`\n[${i+1}] Page ${item.page}:`);
    console.log('Q:', item.q);
    console.log('A:', item.a.slice(0, 150));
  });
}

run().catch(console.error);
