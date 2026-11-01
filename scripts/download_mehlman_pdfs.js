/**
 * Download all 18 Mehlman HY PDFs from mehlmanmedical.com
 * Run: node scripts/download_mehlman_pdfs.js
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PDF_DIR = path.join(__dirname, '..', 'public', 'pdf');
if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR, { recursive: true });

const PDFS = [
  { id: 'cvs',    name: 'HY-Cardio',          url: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Cardio.pdf' },
  { id: 'endo',   name: 'HY-Endocrine',        url: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Endocrine.pdf' },
  { id: 'gi',     name: 'HY-GI',               url: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-GI.pdf' },
  { id: 'heme',   name: 'HY-Heme-Onc',         url: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Heme-Onc.pdf' },
  { id: 'msk',    name: 'HY-MSK',              url: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-MSK.pdf' },
  { id: 'neuro',  name: 'HY-Neuro',            url: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Neuro.pdf' },
  { id: 'psych',  name: 'HY-Psychiatry',       url: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Psychiatry.pdf' },
  { id: 'renal',  name: 'HY-Renal',            url: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Renal.pdf' },
  { id: 'resp',   name: 'HY-Pulmonary',        url: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Pulmonary.pdf' },
  { id: 'repro',  name: 'HY-Repro',            url: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Repro.pdf' },
  { id: 'immuno', name: 'HY-Immuno',           url: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Immuno.pdf' },
  { id: 'micro',  name: 'HY-Micro',            url: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Micro.pdf' },
  { id: 'biochem',name: 'HY-Biochem',          url: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Biochem.pdf' },
  { id: 'pharm',  name: 'HY-Pharm',            url: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Pharm.pdf' },
  { id: 'arrows', name: 'HY-Arrows',           url: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Arrows.pdf' },
  { id: 'biostats', name: 'HY-Biostats',       url: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Biostats.pdf' },
  { id: 'ethics', name: 'HY-Ethics',           url: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Ethics.pdf' },
  { id: 'path',   name: 'HY-Pathology',        url: 'https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Pathology.pdf' },
];

// Alternative URLs to try if primary fails
const ALT_URLS = {
  cvs:     ['HY-Cardio', 'HY-Cardiovascular', 'HY-CVS'],
  heme:    ['HY-Heme-Onc', 'HY-Heme', 'HY-Hematology'],
  resp:    ['HY-Pulmonary', 'HY-Resp', 'HY-Respiratory'],
  psych:   ['HY-Psychiatry', 'HY-Psych'],
  arrows:  ['HY-Arrows', 'HY-Arrow'],
  biostats:['HY-Biostats', 'HY-Biostatistics'],
  path:    ['HY-Pathology', 'HY-Path'],
};

function downloadFile(fileUrl, destPath, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error('Too many redirects'));
    
    const parsedUrl = url.parse(fileUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,*/*',
        'Referer': 'https://mehlmanmedical.com/'
      }
    };

    client.get(options, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        const redirectUrl = res.headers.location;
        if (!redirectUrl) return reject(new Error('Redirect with no location header'));
        const fullRedirect = redirectUrl.startsWith('http') ? redirectUrl : `${parsedUrl.protocol}//${parsedUrl.hostname}${redirectUrl}`;
        return downloadFile(fullRedirect, destPath, redirectCount + 1).then(resolve).catch(reject);
      }
      
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${fileUrl}`));
      }
      
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        const size = fs.statSync(destPath).size;
        if (size < 5000) {
          fs.unlinkSync(destPath);
          return reject(new Error(`File too small (${size} bytes) — probably an error page`));
        }
        resolve(size);
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function tryAlternativeUrls(pdf) {
  const alts = ALT_URLS[pdf.id] || [pdf.name];
  const baseUrl = 'https://mehlmanmedical.com/wp-content/uploads/2021/04/';
  
  for (const alt of alts) {
    const tryUrl = `${baseUrl}${alt}.pdf`;
    const destPath = path.join(PDF_DIR, `${pdf.id}.pdf`);
    console.log(`  ↳ Trying: ${tryUrl}`);
    try {
      const size = await downloadFile(tryUrl, destPath);
      return size;
    } catch (e) {
      console.log(`  ✗ Failed: ${e.message}`);
    }
  }
  throw new Error('All alternatives failed');
}

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   MEHLMAN HY PDF DOWNLOADER            ║');
  console.log('╚════════════════════════════════════════╝\n');
  console.log(`📁 Saving to: ${PDF_DIR}\n`);

  let succeeded = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < PDFS.length; i++) {
    const pdf = PDFS[i];
    const destPath = path.join(PDF_DIR, `${pdf.id}.pdf`);
    
    // Skip if already downloaded
    if (fs.existsSync(destPath)) {
      const size = fs.statSync(destPath).size;
      if (size > 50000) {
        console.log(`✅ [${i+1}/${PDFS.length}] ${pdf.id}.pdf — already exists (${(size/1024/1024).toFixed(1)} MB), skipping`);
        succeeded++;
        continue;
      }
    }

    process.stdout.write(`⏳ [${i+1}/${PDFS.length}] Downloading ${pdf.id}.pdf... `);
    
    try {
      const size = await downloadFile(pdf.url, destPath);
      const mb = (size / 1024 / 1024).toFixed(1);
      console.log(`✅ ${mb} MB`);
      succeeded++;
    } catch (e) {
      console.log(`❌ ${e.message}`);
      console.log(`  → Trying alternative URLs...`);
      try {
        const size = await tryAlternativeUrls(pdf);
        const mb = (size / 1024 / 1024).toFixed(1);
        console.log(`  ✅ Got it via alternative URL! ${mb} MB`);
        succeeded++;
      } catch (e2) {
        console.log(`  ✗ All URLs failed for ${pdf.id}: ${e2.message}`);
        failed++;
        errors.push({ id: pdf.id, error: e2.message });
      }
    }
    
    // Small delay between downloads
    await new Promise(r => setTimeout(r, 800));
  }

  console.log('\n╔════════════════════════════════════════╗');
  console.log(`║  DONE: ${succeeded}/${PDFS.length} downloaded, ${failed} failed`);
  console.log('╚════════════════════════════════════════╝');
  
  if (errors.length > 0) {
    console.log('\n⚠️  Failed PDFs (download manually):');
    errors.forEach(e => console.log(`  - ${e.id}: ${e.error}`));
    console.log('\nTry these manually from: https://mehlmanmedical.com/');
  }
  
  // List what we have
  console.log('\n📂 Downloaded PDFs:');
  const files = fs.readdirSync(PDF_DIR).filter(f => f.endsWith('.pdf'));
  files.forEach(f => {
    const size = fs.statSync(path.join(PDF_DIR, f)).size;
    console.log(`  ${f} — ${(size/1024/1024).toFixed(2)} MB`);
  });
}

main().catch(console.error);
