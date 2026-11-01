/**
 * Scrape individual HY PDF pages to find direct download links
 * Run: node scripts/find_mehlman_urls2.js
 */
const https = require('https');
const fs = require('fs');

function fetchHtml(pageUrl) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,*/*',
      }
    };
    
    const req = https.get(pageUrl, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location.startsWith('http') 
          ? res.headers.location 
          : 'https://mehlmanmedical.com' + res.headers.location;
        return fetchHtml(loc).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, url: pageUrl }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

const SLUGS = [
  { id: 'cvs',     slug: 'hy-cardio' },
  { id: 'endo',    slug: 'hy-endocrine' },
  { id: 'gi',      slug: 'hy-gastrointestinal' },
  { id: 'heme',    slug: 'hy-heme' },
  { id: 'msk',     slug: 'hy-anatomy' },
  { id: 'neuro',   slug: 'hy-neuro' },
  { id: 'psych',   slug: 'hy-psych' },
  { id: 'renal',   slug: 'hy-renal' },
  { id: 'resp',    slug: 'hy-pulmonary' },
  { id: 'repro',   slug: 'hy-obgyn' },
  { id: 'immuno',  slug: 'hy-immuno' },
  { id: 'micro',   slug: 'hy-micro' },    // might not exist, check
  { id: 'biochem', slug: 'hy-biochemistry' },
  { id: 'pharm',   slug: 'hy-pharm' },    // might not exist
  { id: 'arrows',  slug: 'hy-arrows' },
  { id: 'biostats', slug: 'hy-biostats' },// might not exist
  { id: 'path',    slug: 'hy-pathology' },
  { id: 'ethics',  slug: 'hy-ethics' },
];

async function scrapePageForPdf(slug) {
  const pageUrl = `https://mehlmanmedical.com/${slug}/`;
  try {
    const { status, body } = await fetchHtml(pageUrl);
    if (status !== 200) return { slug, error: `HTTP ${status}` };
    
    // Look for PDF links
    const pdfMatches = [...body.matchAll(/https?:\/\/[^\s"'<>]+\.pdf/gi)];
    const pdfs = [...new Set(pdfMatches.map(m => m[0]))];
    
    // Look for href with .pdf
    const hrefMatches = [...body.matchAll(/href['":\s]+([^'">\s]+\.pdf)/gi)];
    const hrefs = [...new Set(hrefMatches.map(m => m[1]))];
    
    // Look for download links
    const downloadMatches = [...body.matchAll(/download[^>]*href=['"]([^'"]+)['"]/gi)];
    const downloads = [...new Set(downloadMatches.map(m => m[1]))];
    
    // Look for wp-content URLs
    const wpMatches = [...body.matchAll(/wp-content\/uploads\/[^\s"'<>]+/gi)];
    const wpUrls = [...new Set(wpMatches.map(m => 'https://mehlmanmedical.com/' + m[0]))];
    
    return { slug, pdfs, hrefs, downloads, wpUrls, bodyLen: body.length };
  } catch (e) {
    return { slug, error: e.message };
  }
}

async function main() {
  console.log('Scraping Mehlman Medical PDF pages...\n');
  const results = {};
  
  for (const { id, slug } of SLUGS) {
    process.stdout.write(`  Checking /${slug}/ ... `);
    const result = await scrapePageForPdf(slug);
    results[id] = { ...result, slug };
    
    const allUrls = [...(result.pdfs||[]), ...(result.hrefs||[]), ...(result.downloads||[]), ...(result.wpUrls||[])];
    if (allUrls.length > 0) {
      console.log(`✅ Found ${allUrls.length} URL(s)`);
      allUrls.forEach(u => console.log(`      → ${u}`));
    } else if (result.error) {
      console.log(`❌ ${result.error}`);
    } else {
      console.log(`⚠️  No PDFs found (body=${result.bodyLen} bytes)`);
    }
    
    await new Promise(r => setTimeout(r, 500));
  }
  
  fs.writeFileSync('scripts/mehlman_pdf_urls.json', JSON.stringify(results, null, 2));
  console.log('\nSaved to scripts/mehlman_pdf_urls.json');
}

main().catch(console.error);
