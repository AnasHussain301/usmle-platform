/**
 * UNPACK UWORLD IMAGES
 * ==============================================================
 * Scans ~/Downloads for uw_images_part*.zip and extracts all
 * into public/uw-img/
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const DOWNLOADS = path.join(os.homedir(), 'Downloads');
const DEST = path.join(__dirname, '..', 'public', 'uw-img');

if (!fs.existsSync(DEST)) fs.mkdirSync(DEST, { recursive: true });

console.log('🔍 Checking for UWorld image zip files in:', DOWNLOADS);

const files = fs.readdirSync(DOWNLOADS).filter(f => f.startsWith('uw_images') && f.endsWith('.zip'));

if (files.length === 0) {
  console.log('⚠️ No uw_images_*.zip files found in Downloads yet.');
  console.log('Please run the extraction script in your Chrome console first!');
  process.exit(0);
}

console.log(`Found ${files.length} zip file(s):`, files);

files.forEach(f => {
  const zipPath = path.join(DOWNLOADS, f);
  console.log(`📦 Unpacking ${f}...`);
  try {
    // PowerShell Expand-Archive
    execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${DEST}' -Force"`);
    console.log(`✅ Unpacked ${f}`);
  } catch (e) {
    console.error(`❌ Error extracting ${f}:`, e.message);
  }
});

const totalImgs = fs.readdirSync(DEST).filter(f => f.endsWith('.webp')).length;
console.log('══════════════════════════════════════════════════');
console.log(`🎉 Total UWorld medical images now available locally in public/uw-img/: ${totalImgs}`);
console.log('══════════════════════════════════════════════════');
