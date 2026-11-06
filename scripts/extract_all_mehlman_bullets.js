const fs = require('fs');
const path = require('path');
const pdfjs = require(path.resolve('public/js/pdf.min.js'));
pdfjs.GlobalWorkerOptions.workerSrc = path.resolve('public/js/pdf.worker.min.js');

const pdfList = [
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
  { file: 'biochem.pdf', slug: 'gen', name: 'General Principles' },
  { file: 'micro.pdf', slug: 'micro', name: 'Microbiology' },
  { file: 'path.pdf', slug: 'path', name: 'Pathology' },
  { file: 'ethics.pdf', slug: 'ethics', name: 'Public Health Sciences' }
];

function cleanPdfText(str) {
  return (str || '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    // Normalize spaced-out digits like "1 5 0" -> "150", "3 3 . 3 %" -> "33.3%"
    .replace(/(\d)\s+(\d)/g, '$1$2')
    .replace(/(\d)\s+\.\s+(\d)/g, '$1.$2')
    .replace(/(\d)\s+%/g, '$1%')
    // Normalize hyphen spaces: "end - systolic" -> "end-systolic", "yellow - brown" -> "yellow-brown"
    .replace(/([a-zA-Z0-9])\s*-\s*([a-zA-Z0-9])/g, '$1-$2')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseBullet(rawText, pdfSlug, pdfPage) {
  const text = cleanPdfText(rawText);
  if (!text || text.length < 10) return null;

  // Arrow separator
  const arrowMatch = text.match(/\s*(?:à|->|-->|→)\s*/);
  if (arrowMatch) {
    let q = text.substring(0, arrowMatch.index).trim().replace(/^[-•*]\s*/, '').trim();
    let a = text.substring(arrowMatch.index + arrowMatch[0].length).trim();
    if (q && a) {
      return { q, a, pdfSlug, pdfPage };
    }
  }

  // Answer = separator
  const ansMatch = text.match(/\s*(?:answer\s*=|ans\s*wer\s*=|ans\s*=)\s*/i);
  if (ansMatch) {
    let q = text.substring(0, ansMatch.index).trim().replace(/^[-•*]\s*/, '').trim();
    let a = text.substring(ansMatch.index).trim();
    if (q && a) {
      return { q, a, pdfSlug, pdfPage };
    }
  }

  // Question mark
  const qIdx = text.indexOf('?');
  if (qIdx !== -1 && qIdx < text.length - 5) {
    let q = text.substring(0, qIdx + 1).replace(/^[-•*]\s*/, '').trim();
    let a = text.substring(qIdx + 1).trim();
    if (q && a) {
      return { q, a, pdfSlug, pdfPage };
    }
  }

  return { q: text, a: text, pdfSlug, pdfPage };
}

async function extractAll() {
  const allCards = [];

  for (const item of pdfList) {
    const pdfPath = path.join('public/pdf', item.file);
    if (!fs.existsSync(pdfPath)) continue;

    console.log(`Processing ${item.file}...`);
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;

    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();

      let curBullet = null;
      for (const it of content.items) {
        const text = it.str.trim();
        // Bullet marker detection
        const isBulletMarker = (text === '-' || text === '•' || text === '–' || text === '—' || text === '*') &&
                               it.transform[4] < 120 && it.transform[5] > 50 && it.transform[5] < 790;
        
        if (isBulletMarker) {
          if (curBullet && curBullet.trim().length > 10) {
            const parsed = parseBullet(curBullet, item.slug, p);
            if (parsed) allCards.push(parsed);
          }
          curBullet = '';
        } else if (curBullet !== null) {
          if (it.transform[5] > 50 && it.transform[5] < 790) {
            curBullet += (it.str.endsWith(' ') || it.str === '' ? it.str : it.str + ' ');
          }
        }
      }

      if (curBullet && curBullet.trim().length > 10) {
        const parsed = parseBullet(curBullet, item.slug, p);
        if (parsed) allCards.push(parsed);
      }
    }
  }

  console.log(`Total extracted cards: ${allCards.length}`);
  fs.writeFileSync('data/mehlman_pdf_bullets_extracted.json', JSON.stringify(allCards, null, 2), 'utf8');
  console.log('Saved data/mehlman_pdf_bullets_extracted.json');
}

extractAll();
