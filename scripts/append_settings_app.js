const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'public', 'js', 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

const settingsJs = `
// ==========================================
// APPEARANCE & SETTINGS CONTROLS (SCREENSHOT MATCH)
// ==========================================

let currentFontScale = parseInt(localStorage.getItem('synapse_font_scale') || '100', 10);
let currentTheme = localStorage.getItem('synapse_theme') || 'auto';
let currentAccent = localStorage.getItem('synapse_accent') || '#f43f5e';
let currentFont = localStorage.getItem('synapse_font') || 'Synapse';

const FONT_MAP = {
  'Synapse': "'Space Grotesk', -apple-system, sans-serif",
  'Inter': "'Inter', sans-serif",
  'Plus Jakarta': "'Plus Jakarta Sans', sans-serif",
  'Lexend': "'Lexend', sans-serif",
  'Outfit': "'Outfit', sans-serif",
  'Fraunces': "'Fraunces', serif"
};

function toggleSettingsDrawer() {
  const drawer = document.getElementById('settings-drawer');
  if (!drawer) return;
  drawer.classList.toggle('translate-x-full');
  if (!drawer.classList.contains('translate-x-full')) {
    applyAppearanceSettingsUI();
  }
}

function setTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('synapse_theme', theme);

  document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-black', 'theme-auto');

  if (theme === 'light') {
    document.documentElement.classList.add('theme-light');
  } else if (theme === 'black') {
    document.documentElement.classList.add('theme-black');
  } else if (theme === 'dark') {
    document.documentElement.classList.add('theme-dark');
  } else {
    // auto
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
  }

  // Update button active styling
  ['light', 'dark', 'black', 'auto'].forEach(t => {
    const btn = document.getElementById('theme-btn-' + t);
    if (!btn) return;
    if (t === theme) {
      btn.className = 'py-2 rounded-xl text-xs font-bold bg-[#f472b6] text-black shadow-md transition-all';
    } else {
      btn.className = 'py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all';
    }
  });
}

function setAccentColor(hex, swatchIdx) {
  currentAccent = hex;
  localStorage.setItem('synapse_accent', hex);
  document.documentElement.style.setProperty('--accent-color', hex);

  // Update ring on swatches
  const swatches = document.querySelectorAll('.color-swatch');
  swatches.forEach((s, idx) => {
    if (idx === swatchIdx) {
      s.classList.add('ring-2', 'ring-white', 'ring-offset-2', 'ring-offset-[#160d20]');
    } else {
      s.classList.remove('ring-2', 'ring-white', 'ring-offset-2', 'ring-offset-[#160d20]');
    }
  });
}

function setFontFamily(fontKey) {
  currentFont = fontKey;
  localStorage.setItem('synapse_font', fontKey);
  const cssFont = FONT_MAP[fontKey] || FONT_MAP['Synapse'];
  document.body.style.fontFamily = cssFont;

  // Update font pills
  Object.keys(FONT_MAP).forEach(k => {
    const btn = document.getElementById('font-btn-' + k);
    if (!btn) return;
    if (k === fontKey) {
      btn.className = 'font-pill py-2.5 px-2 rounded-xl bg-[#1d1227] border-2 border-pink-500 text-pink-300 text-xs font-bold transition-all text-center';
    } else {
      btn.className = 'font-pill py-2.5 px-2 rounded-xl bg-[#1d1227] border border-purple-900/50 text-slate-200 text-xs font-semibold hover:border-purple-600 transition-all text-center';
    }
  });
}

function adjustFontSize(delta) {
  currentFontScale = Math.max(85, Math.min(130, currentFontScale + delta));
  localStorage.setItem('synapse_font_scale', currentFontScale);
  document.documentElement.style.fontSize = (currentFontScale / 100 * 16) + 'px';
  const label = document.getElementById('font-scale-label');
  if (label) label.textContent = currentFontScale + '%';
}

function applyAppearanceSettingsUI() {
  setTheme(currentTheme);
  setFontFamily(currentFont);
  const label = document.getElementById('font-scale-label');
  if (label) label.textContent = currentFontScale + '%';

  // Sync user email in settings
  const emailEl = document.getElementById('settings-user-email');
  if (emailEl) {
    emailEl.textContent = state.currentUser ? state.currentUser.email : 'kingdomhouse009@gmail.com';
  }
}

function installAppPrompt() {
  if (window.deferredPrompt) {
    window.deferredPrompt.prompt();
    window.deferredPrompt.userChoice.then(() => {
      window.deferredPrompt = null;
    });
  } else {
    alert('To install Synapse:\\n• In Chrome / Edge: Click the install icon in the URL bar (or menu > Install app).\\n• On iOS Safari: Tap Share > "Add to Home Screen".');
  }
}

function openFeedbackModal() {
  const feedback = prompt('Please share your thoughts, bug reports, or feature requests for Synapse & ANSI 1.0 PRO:');
  if (feedback && feedback.trim()) {
    alert('Thank you! Your feedback has been received by the Synapse team.');
  }
}

// Global PWA install trigger capture
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
});

// Auto-initialize appearance on script load
document.addEventListener('DOMContentLoaded', () => {
  applyAppearanceSettingsUI();
});
`;

if (!content.includes('toggleSettingsDrawer')) {
  content += '\n' + settingsJs;
  fs.writeFileSync(appJsPath, content, 'utf8');
  console.log('Appended Appearance & Settings controls to public/js/app.js!');
} else {
  console.log('toggleSettingsDrawer already present in app.js.');
}
