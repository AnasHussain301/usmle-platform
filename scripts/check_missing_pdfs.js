const https = require('https');
async function check(url) {
  return new Promise(r => {
    const req = https.get(url, {headers:{'User-Agent':'Mozilla/5.0'}}, res => {
      let d=''; 
      res.on('data', c => d += c); 
      res.on('end', () => r({status: res.statusCode, body: d.slice(0, 2000)}));
    }); 
    req.on('error', e => r({error: e.message}));
    req.on('timeout', () => { req.destroy(); r({error:'timeout'}); });
    req.setTimeout(8000);
  });
}

const missing = [
  { id: 'pharm', slugs: ['hy-pharm', 'hy-pharmacology'] },
  { id: 'arrows', slugs: ['hy-arrows'] },
  { id: 'biostats', slugs: ['hy-biostats', 'hy-biostatistics'] },
];

(async () => {
  for (const m of missing) {
    for (const s of m.slugs) {
      const r = await check('https://mehlmanmedical.com/' + s + '/');
      const driveMatch = r.body && r.body.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/);
      console.log(m.id + ' / ' + s + ': ' + (r.status || r.error) + (driveMatch ? ' => DRIVE=' + driveMatch[1] : ' (no drive link)'));
    }
  }
})();
