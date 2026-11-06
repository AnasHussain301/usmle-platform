const fs = require('fs');
const path = require('path');
const pdfjs = require(path.resolve('public/js/pdf.min.js'));
pdfjs.GlobalWorkerOptions.workerSrc = path.resolve('public/js/pdf.worker.min.js');

const PDF_MAP = [
  { file: 'cvs.pdf', slug: 'cvs', name: 'Cardiovascular' },
  { file: 'endo.pdf', slug: 'endo', name: 'Endocrine' },
  { file: 'gi.pdf', slug: 'gi', name: 'Gastrointestinal' },
  { file: 'heme.pdf', slug: 'heme', name: 'Hematology & Oncology' },
  { file: 'msk.pdf', slug: 'msk', name: 'Musculoskeletal & Skin' },
  { file: 'neuro.pdf', slug: 'neuro', name: 'Neurology' },
  { file: 'psych.pdf', slug: 'psych', name: 'Psychiatry' },
  { file: 'renal.pdf', slug: 'renal', name: 'Renal' },
  { file: 'repro.pdf', slug: 'repro', name: 'Reproductive' },
  { file: 'resp.pdf', slug: 'resp', name: 'Respiratory' },
  { file: 'immuno.pdf', slug: 'immuno', name: 'Immunology' },
  { file: 'biochem.pdf', slug: 'gen', name: 'General Principles' }
];

async function extractAllPdfQuestions() {
  const allQa = [];

  for (const item of PDF_MAP) {
    const pdfPath = path.join('public/pdf', item.file);
    if (!fs.existsSync(pdfPath)) continue;

    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;

    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      const str = content.items.map(it => it.str).join(' ');

      // Split into bullets
      const bullets = str.split(/\s*-\s+/);
      for (const b of bullets) {
        if (!b.includes('à') && !b.includes('->')) continue;

        let parts = b.split(/(?:à|->)/);
        if (parts.length >= 2) {
          let q = parts[0].replace(/\s+/g, ' ').trim();
          let a = parts.slice(1).join(' à ').replace(/\s+/g, ' ').trim();

          // Clean up leading/trailing symbols
          q = q.replace(/^["'“”]/, '').replace(/["'“”]$/, '').trim();
          // If question contains question mark or starts with What/Which/Tx/Points/How/Why/Does or in quotes
          if (q.length > 5 && a.length > 3) {
            allQa.push({
              sysSlug: item.slug,
              sysName: item.name,
              pdfPage: p,
              rawQ: q,
              q: (q.startsWith('“') || q.startsWith('"')) ? q : (q.endsWith('?') ? q : q + '?'),
              a: a
            });
          }
        }
      }
    }
  }

  console.log('Total extracted QA pairs from PDFs:', allQa.length);
  return allQa;
}

extractAllPdfQuestions().then(allQa => {
  fs.writeFileSync('data/mehlman_all_pdf_qa.json', JSON.stringify(allQa, null, 2));
  console.log('Saved data/mehlman_all_pdf_qa.json');
}).catch(console.error);
