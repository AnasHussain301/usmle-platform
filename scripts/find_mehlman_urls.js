/**
 * Scrape mehlmanmedical.com/free-stuff/ to find actual PDF download links
 * Run: node scripts/find_mehlman_urls.js
 */
const https = require('https');
const url = require('url');

function fetch(pageUrl) {
  return new Promise((resolve, reject) => {
    const parsed = url.parse(pageUrl);
    const options = {
      hostname: parsed.hostname,
      path: parsed.path,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      }
    };
    https.get(options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching https://mehlmanmedical.com/free-stuff/ ...');
  const html = await fetch('https://mehlmanmedical.com/free-stuff/');
  
  // Find all PDF links
  const pdfLinks = [];
  const regex = /href="([^"]*\.pdf[^"]*)"/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    pdfLinks.push(match[1]);
  }
  
  // Also find wp-content links
  const wpRegex = /https?:\/\/mehlmanmedical\.com\/wp-content\/[^"'\s)>]+/gi;
  while ((match = wpRegex.exec(html)) !== null) {
    if (!pdfLinks.includes(match[0])) pdfLinks.push(match[0]);
  }
  
  console.log(`\nFound ${pdfLinks.length} PDF links:\n`);
  pdfLinks.forEach(l => console.log('  ' + l));
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync('scripts/mehlman_pdf_urls.json', JSON.stringify(pdfLinks, null, 2));
  console.log('\nSaved to scripts/mehlman_pdf_urls.json');
  
  // Check page title and some content
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  if (titleMatch) console.log('\nPage title:', titleMatch[1]);
  
  // Save HTML for inspection
  fs.writeFileSync('scripts/mehlman_freestuff.html', html);
  console.log('HTML saved to scripts/mehlman_freestuff.html for inspection');
}

main().catch(console.error);
