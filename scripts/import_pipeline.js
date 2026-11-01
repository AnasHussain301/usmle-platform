/**
 * AUTOMATED LOCAL IMPORT PIPELINE
 * ==============================================================
 * Run: node scripts/import_pipeline.js
 * 
 * Performs end-to-end import:
 *   1. Reads sketches_meta.json / zetchy_full_manifest.json
 *   2. Extracts downloaded zip archives if present in ~/Downloads
 *   3. Rebuilds and normalizes all data schemas (Path, Micro, Pharm, FA, DDx)
 *   4. Syncs all images into public/assets/sketches/
 *   5. Saves directly into data/db.json
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'public', 'assets', 'sketches');
const DOWNLOADS_DIR = path.join(os.homedir(), 'Downloads');

console.log('🚀 Running USMLEApp Universal Data Pipeline...');

// 1. Check for incoming zip files in Downloads
const candidateZips = [
  path.join(DOWNLOADS_DIR, 'zetchy_complete_data.zip'),
  path.join(DOWNLOADS_DIR, 'all_sketches.zip')
];

for (const zipPath of candidateZips) {
  if (fs.existsSync(zipPath)) {
    console.log(`📦 Found archive: ${path.basename(zipPath)}. Unpacking assets...`);
    const tempExtract = path.join(PROJECT_ROOT, 'temp_unpacked');
    if (!fs.existsSync(tempExtract)) fs.mkdirSync(tempExtract, { recursive: true });
    
    try {
      execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${tempExtract}' -Force"`);
      
      // If sketches subdirectory exists inside
      const sourceDir = fs.existsSync(path.join(tempExtract, 'sketches'))
        ? path.join(tempExtract, 'sketches')
        : tempExtract;

      const files = fs.readdirSync(sourceDir);
      let copied = 0;
      files.forEach(file => {
        if (file.endsWith('.jpg') || file.endsWith('.webp') || file.endsWith('.png') || file.endsWith('.svg')) {
          fs.copyFileSync(path.join(sourceDir, file), path.join(ASSETS_DIR, file));
          copied++;
        }
      });
      console.log(`   ✓ Copied ${copied} image assets into public/assets/sketches/`);

      // Copy manifest if present
      const manifestPath = path.join(tempExtract, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        fs.copyFileSync(manifestPath, path.join(PROJECT_ROOT, 'server', 'zetchy_full_manifest.json'));
        console.log(`   ✓ Imported full runtime manifest into server/zetchy_full_manifest.json`);
      }

      // Cleanup temp
      fs.rmSync(tempExtract, { recursive: true, force: true });
    } catch (e) {
      console.error(`   ✗ Error unpacking ${zipPath}:`, e.message);
    }
  }
}

// 2. Run rebuild_sketches to populate database with pins, symbols, and topics
console.log('🔄 Rebuilding database entities with authentic data schema...');
try {
  require('../server/rebuild_sketches');
  console.log('✅ Pipeline execution completed successfully!');
} catch (e) {
  console.error('✗ Failed to rebuild sketches:', e);
}
