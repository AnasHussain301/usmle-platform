const fs = require('fs');
const path = require('path');
const pdfjs = require(path.resolve('public/js/pdf.min.js'));
pdfjs.GlobalWorkerOptions.workerSrc = path.resolve('public/js/pdf.worker.min.js');

async function extractMehlmanAll() {
  const pdfFiles = [
    { file: 'cvs.pdf', sys: 'Cardiovascular', slug: 'cvs' },
    { file: 'endo.pdf', sys: 'Endocrine', slug: 'endo' },
    { file: 'gi.pdf', sys: 'Gastrointestinal', slug: 'gi' },
    { file: 'heme.pdf', sys: 'Hematology & Oncology', slug: 'heme' },
    { file: 'msk.pdf', sys: 'Musculoskeletal & Skin', slug: 'msk' },
    { file: 'neuro.pdf', sys: 'Neurology', slug: 'neuro' },
    { file: 'psych.pdf', sys: 'Psychiatry', slug: 'psych' },
    { file: 'renal.pdf', sys: 'Renal', slug: 'renal' },
    { file: 'repro.pdf', sys: 'Reproductive', slug: 'repro' },
    { file: 'resp.pdf', sys: 'Respiratory', slug: 'resp' },
    { file: 'immuno.pdf', sys: 'Immunology', slug: 'immuno' },
    { file: 'biochem.pdf', sys: 'General Principles', slug: 'gen' }
  ];

  const results = {};

  for (const item of pdfFiles) {
    const pdfPath = path.join('public/pdf', item.file);
    if (!fs.existsSync(pdfPath)) continue;
    
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;
    const cards = [];

    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      const str = content.items.map(it => it.str).join(' ');
      
      // Pattern A: “Question” à Answer
      const qRegex = /[\u201c"]([^\u201d"]{12,350}\??)[\u201d"]\s*(?:à|->)\s*([^•\u201c\n\r]{10,800})/g;
      let m;
      while ((m = qRegex.exec(str)) !== null) {
        let q = m[1].trim();
        let a = m[2].trim();
        if (a.includes('  -   ')) a = a.split('  -   ')[0].trim();
        cards.push({ page: p, q: `“${q}”`, a });
      }

      // Pattern B: Clinical vignette bullet with question: "...? answer = ..." or "...; Q asks ...; answer = ..."
      const bullets = str.split(/\s*-\s+/);
      for (const b of bullets) {
        if ((b.includes('?') || b.includes('Q asks') || b.includes('Q wants to know')) && (b.includes('à') || b.includes('answer =') || b.includes('ans wer ='))) {
          // split into question and answer
          let parts = b.split(/(?:à|answer\s*=|ans\s*wer\s*=)/i);
          if (parts.length >= 2) {
            let q = parts[0].trim();
            let a = parts.slice(1).join('=').trim();
            if (q.length > 20 && a.length > 5) {
              if (a.includes('  -   ')) a = a.split('  -   ')[0].trim();
              cards.push({ page: p, q, a });
            }
          }
        }
      }
    }

    results[item.sys] = cards;
    console.log(`Extracted from ${item.sys} (${item.file}): ${cards.length} cards`);
  }

  return results;
}

extractMehlmanAll().then(res => {
  fs.writeFileSync('data/mehlman_raw_extracted.json', JSON.stringify(res, null, 2));
  console.log('Saved to data/mehlman_raw_extracted.json');
}).catch(console.error);
