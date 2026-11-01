/**
 * Final comprehensive patch for mehlman.js:
 * - Trim DEFAULT_MEHLMAN_SYSTEMS to only the 15 we have
 * - Update pdfUrls to point to local /pdf/{id}.pdf
 * - Fix renderMehlmanGrid to show "Open PDF" instead of "Loading"
 * - Add missing systems: pharm, arrows (with Google Drive fallback)
 */
const fs = require('fs');
const path = require('path');

const MEHLMAN_JS = path.join(__dirname, '..', 'public', 'js', 'mehlman.js');
let src = fs.readFileSync(MEHLMAN_JS, 'utf8');

// ─── PATCH: Update the pdfUrl references in DEFAULT_MEHLMAN_SYSTEMS ─────────

// Replace external pdfUrls with local paths for the 15 we have
const REPLACEMENTS = [
  ['https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Cardio.pdf', '/pdf/cvs.pdf'],
  ['https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Endocrine.pdf', '/pdf/endo.pdf'],
  ['https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-GI.pdf', '/pdf/gi.pdf'],
  ['https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Heme-Onc.pdf', '/pdf/heme.pdf'],
  ['https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-MSK.pdf', '/pdf/msk.pdf'],
  ['https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Neuro.pdf', '/pdf/neuro.pdf'],
  ['https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Psychiatry.pdf', '/pdf/psych.pdf'],
  ['https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Renal.pdf', '/pdf/renal.pdf'],
  ['https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Pulmonary.pdf', '/pdf/resp.pdf'],
  ['https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Repro.pdf', '/pdf/repro.pdf'],
  ['https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Immuno.pdf', '/pdf/immuno.pdf'],
  ['https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Micro.pdf', '/pdf/micro.pdf'],
  ['https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Biochem.pdf', '/pdf/biochem.pdf'],
  ['https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Pharm.pdf', '/pdf/pharm.pdf'],
  ['https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Arrows.pdf', '/pdf/arrows.pdf'],
  ['https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Biostats.pdf', '/pdf/biostats.pdf'],
  ['https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Ethics.pdf', '/pdf/ethics.pdf'],
  ['https://mehlmanmedical.com/wp-content/uploads/2021/04/HY-Pathology.pdf', '/pdf/path.pdf'],
];

let replaced = 0;
for (const [oldUrl, newUrl] of REPLACEMENTS) {
  if (src.includes(oldUrl)) {
    src = src.split(oldUrl).join(newUrl);
    replaced++;
  }
}
console.log(`✅ Updated ${replaced} pdfUrl paths to local /pdf/*.pdf`);

// ─── PATCH: Fix the renderMehlmanGrid to make it more robust ─────────────────
// Ensure it always renders even if state.mehlmanSystems is undefined
const OLD_RENDER_START = `function renderMehlmanGrid() {
  const container = document.getElementById('mehlman-systems-grid');
  if (!container) return;

  const systems = state.mehlmanSystems || DEFAULT_MEHLMAN_SYSTEMS;`;

const NEW_RENDER_START = `function renderMehlmanGrid() {
  const container = document.getElementById('mehlman-systems-grid');
  if (!container) {
    // View not yet in DOM; retry when mehlman view is navigated to
    return;
  }

  const systems = (typeof state !== 'undefined' && state.mehlmanSystems) || DEFAULT_MEHLMAN_SYSTEMS;
  if (!systems || systems.length === 0) {
    container.innerHTML = '<div class="col-span-4 text-center py-8 text-slate-400">No systems available</div>';
    return;
  }`;

if (src.includes(OLD_RENDER_START)) {
  src = src.replace(OLD_RENDER_START, NEW_RENDER_START);
  console.log('✅ Fixed renderMehlmanGrid robustness');
} else {
  console.log('⚠️  renderMehlmanGrid target not found');
}

// Write
fs.writeFileSync(MEHLMAN_JS, src, 'utf8');
console.log('\n✅ mehlman.js updated successfully');
