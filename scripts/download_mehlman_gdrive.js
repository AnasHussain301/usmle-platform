/**
 * Download all Mehlman HY PDFs from Google Drive
 * Run: node scripts/download_mehlman_gdrive.js
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PDF_DIR = path.join(__dirname, '..', 'public', 'pdf');
if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR, { recursive: true });

// Extracted from mehlmanmedical.com pages — Google Drive file IDs
const PDFS = [
  { id: 'cvs',     name: 'Cardiovascular',    driveId: '1r-B04CLSx7vylvsdyIl-f033qPyAY2SO' },
  { id: 'endo',    name: 'Endocrine',          driveId: '1ifKCUpt0lw4JnmrOfasuC4MMxPV2xOAM' },
  { id: 'gi',      name: 'Gastrointestinal',   driveId: '1QE8stM0xhNn7kXU3EFxxcJrlSlPVdv5L' },
  { id: 'heme',    name: 'Heme/Onc',           driveId: '1Soq2X5U6v29kCUXxDPnlyhlEK91UQle6' },
  { id: 'msk',     name: 'MSK & Anatomy',      driveId: '1CJxCdtuur84kQUdvtINFDp_Zf12x023v' },
  { id: 'neuro',   name: 'Neurology',          driveId: '1WHatbproqEWisXe9bakvHf_NBU6uXmHX' },
  { id: 'psych',   name: 'Psychiatry',         driveId: '1Y93gN5VxRdQnZTJjqkE2dVcn4r29U33I' },
  { id: 'renal',   name: 'Renal',              driveId: '18QkpOaVm0IRnG8i3wPvSuWPTctJ_30kF' },
  { id: 'resp',    name: 'Pulmonary',          driveId: '1pMhIiKY4sSitUCmoNVheAwZFrYQsgC-s' },
  { id: 'repro',   name: 'Repro/OB-GYN',       driveId: '10XR2_gXL6Q3liwB4jpXtmYbVtiPoc-cO' },
  { id: 'immuno',  name: 'Immunology',         driveId: '1K1qVejD2l7DtJLQEDz2KJB8aEXF4KQ-u' },
  { id: 'micro',   name: 'Microbiology',       driveId: '1gfcxrG442nIG-HKAIBqCPemi1GQSD_xT' },
  { id: 'biochem', name: 'Biochemistry',       driveId: '1EsLudyMWUaC56OluLIPGgTwjzOskf-U2' },
  { id: 'path',    name: 'Pathology',          driveId: '1eCKfNndouemEd8dQJT2WdqCY_Owb-e5S' },
  { id: 'ethics',  name: 'Ethics/Comm',        driveId: '1UYbEvB_xPlyFifdR5ac42J_UEiqOufrp' },
];

function download(fileId, destPath, attempt = 1) {
  return new Promise((resolve, reject) => {
    // Google Drive direct download URL
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
    
    const options = {
      hostname: 'drive.google.com',
      path: `/uc?export=download&id=${fileId}&confirm=t`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Cookie': 'NID=; download_warning_' + fileId + '=t; CONSENT=YES+',
      },
      timeout: 60000,
    };

    function makeRequest(opts, redirectCount = 0) {
      if (redirectCount > 10) return reject(new Error('Too many redirects'));
      
      const client = opts.protocol === 'http:' ? http : https;
      const req = client.request(opts, (res) => {
        const { statusCode, headers } = res;
        
        // Handle redirects
        if ([301, 302, 303, 307, 308].includes(statusCode) && headers.location) {
          res.resume();
          try {
            const redirectUrl = new URL(headers.location, `https://${opts.hostname}`);
            const newOpts = {
              hostname: redirectUrl.hostname,
              path: redirectUrl.pathname + redirectUrl.search,
              protocol: redirectUrl.protocol,
              headers: {
                'User-Agent': opts.headers['User-Agent'],
                'Accept': '*/*',
                'Cookie': headers['set-cookie'] ? headers['set-cookie'].join('; ') : (opts.headers.Cookie || ''),
              },
              timeout: 60000,
            };
            // Update cookie from response
            return makeRequest(newOpts, redirectCount + 1);
          } catch (e) {
            return reject(e);
          }
        }
        
        if (statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${statusCode}`));
        }
        
        // Check content type
        const contentType = headers['content-type'] || '';
        const isHtml = contentType.includes('text/html');
        
        if (isHtml && attempt === 1) {
          res.resume();
          // Try with virus scan bypass
          return download(fileId, destPath, 2).then(resolve).catch(reject);
        }
        
        const file = fs.createWriteStream(destPath);
        let bytes = 0;
        res.on('data', chunk => { bytes += chunk.length; });
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          if (bytes < 10000) {
            fs.unlinkSync(destPath);
            return reject(new Error(`File too small (${bytes} bytes) — likely an error/captcha page`));
          }
          resolve(bytes);
        });
        file.on('error', (err) => {
          fs.unlinkSync(destPath);
          reject(err);
        });
      });
      
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
      req.end();
    }
    
    // For large files, use confirm bypass
    const confirmPath = attempt === 2 
      ? `/uc?export=download&id=${fileId}&confirm=t&uuid=${Date.now()}`
      : `/uc?export=download&id=${fileId}&confirm=t`;
    
    makeRequest({
      hostname: 'drive.google.com',
      path: confirmPath,
      protocol: 'https:',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,*/*',
        'Cookie': `download_warning_${fileId}=t; CONSENT=YES+cb.20220328-17-p0.en+F+851483683`,
      },
      timeout: 120000,
    });
  });
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   MEHLMAN HY PDF DOWNLOADER (Google Drive) ║');
  console.log('╚════════════════════════════════════════════╝\n');
  console.log(`📁 Output: ${PDF_DIR}\n`);

  let ok = 0, fail = 0;
  const errors = [];

  for (let i = 0; i < PDFS.length; i++) {
    const pdf = PDFS[i];
    const dest = path.join(PDF_DIR, `${pdf.id}.pdf`);

    // Skip if already downloaded and valid
    if (fs.existsSync(dest)) {
      const sz = fs.statSync(dest).size;
      if (sz > 100000) {
        console.log(`✅ [${i+1}/${PDFS.length}] ${pdf.id}.pdf — already exists (${(sz/1024/1024).toFixed(1)} MB)`);
        ok++;
        continue;
      } else {
        fs.unlinkSync(dest);
      }
    }

    process.stdout.write(`⏳ [${i+1}/${PDFS.length}] ${pdf.name} (${pdf.id}.pdf)... `);
    try {
      const sz = await download(pdf.driveId, dest);
      const mb = (sz/1024/1024).toFixed(2);
      console.log(`✅ ${mb} MB`);
      ok++;
    } catch (e) {
      console.log(`❌ ${e.message}`);
      errors.push({ id: pdf.id, name: pdf.name, driveId: pdf.driveId, error: e.message });
      fail++;
    }

    await new Promise(r => setTimeout(r, 1200));
  }

  console.log('\n═══════════════════════════════════');
  console.log(`  ✅ ${ok} downloaded, ❌ ${fail} failed`);
  console.log('═══════════════════════════════════');

  if (errors.length > 0) {
    console.log('\n⚠️  Manual download links for failed PDFs:');
    errors.forEach(e => {
      console.log(`\n  ${e.name} (${e.id}):`);
      console.log(`  https://drive.google.com/file/d/${e.driveId}/view`);
    });
  }

  // Save Drive IDs for the app to use for iframe embedding
  const driveMap = {};
  PDFS.forEach(p => { driveMap[p.id] = p.driveId; });
  fs.writeFileSync(
    path.join(__dirname, '..', 'public', 'pdf', 'drive_ids.json'),
    JSON.stringify(driveMap, null, 2)
  );
  console.log('\n📄 drive_ids.json saved — app can use Google Drive iframe as fallback');
}

main().catch(console.error);
