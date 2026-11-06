const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexHtmlPath, 'utf8');

// 1. Update Title & Add Google Fonts + Futuristic Animation styles in <head>
const fontsAndStyles = `  <!-- Google Fonts for Appearance customization (Screenshot Match) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;600;700&family=Inter:wght@400;500;600;700;800&family=Lexend:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --accent-color: #f43f5e;
      --accent-hover: #e11d48;
      --app-font: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    body {
      font-family: var(--app-font);
    }
    @keyframes textShimmer {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 15px rgba(244,63,94,0.4), 0 0 30px rgba(34,211,238,0.25); }
      50% { box-shadow: 0 0 25px rgba(34,211,238,0.6), 0 0 45px rgba(244,63,94,0.35); }
    }
    .ansi-shimmer-text {
      background: linear-gradient(90deg, #38bdf8, #ec4899, #a855f7, #38bdf8);
      background-size: 300% 300%;
      animation: textShimmer 3.5s ease infinite;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .cyber-card {
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cyber-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(244, 63, 94, 0.25), 0 0 20px rgba(34, 211, 238, 0.15);
      border-color: rgba(244, 63, 94, 0.5) !important;
    }
    /* Dynamic Theme Support */
    html.theme-black, html.theme-black body { background-color: #000000 !important; }
    html.theme-black header, html.theme-black #radbot-drawer, html.theme-black #settings-drawer { background-color: #050505 !important; }
    html.theme-light, html.theme-light body { background-color: #f8fafc !important; color: #0f172a !important; }
    html.theme-light header { background-color: rgba(255,255,255,0.95) !important; border-color: #e2e8f0 !important; }
  </style>`;

html = html.replace('<title>Zetchy - First Aid, Sketchy, Cards &amp; DDx Finder</title>', '<title>Synapse · Advanced USMLE &amp; Board Mastery Engine</title>\n' + fontsAndStyles);

// 2. Header Rebranding to Synapse + Profile & Settings Icon
const oldHeaderLogo = `<div class="flex items-center space-x-2.5 cursor-pointer" onclick="navigate('home')">
      <div class="w-8 h-8 flex items-center justify-center">
        <svg class="w-8 h-8" viewBox="0 0 40 40" fill="none">
          <path d="M 10 10 L 30 10 C 32 10 33 12 31.5 13.5 L 14.5 28 L 30 28 C 32 28 33 30 31.5 31.5 C 30 33 10 33 10 33 C 8 33 7 31 8.5 29.5 L 25.5 15 L 10 15 C 8 15 7 13 8.5 11.5 Z" fill="url(#brandGrad)" />
          <defs>
            <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#f43f5e;" />
              <stop offset="100%" style="stop-color:#db2777;" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span class="text-2xl font-bold tracking-tight text-white">Zetchy</span>
    </div>`;

const newHeaderLogo = `<div class="flex items-center space-x-2.5 cursor-pointer group" onclick="navigate('home')">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-pink-500 to-purple-600 p-0.5 shadow-[0_0_15px_rgba(244,63,94,0.4)] group-hover:shadow-[0_0_22px_rgba(34,211,238,0.6)] transition-all">
        <div class="w-full h-full bg-[#0d0718] rounded-[10px] flex items-center justify-center">
          <svg class="w-5 h-5 text-pink-400 group-hover:text-cyan-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            <circle cx="12" cy="12" r="3" fill="#f43f5e" />
          </svg>
        </div>
      </div>
      <div class="flex flex-col">
        <span class="text-xl font-black tracking-tight text-white flex items-center leading-none">
          Synapse<span class="text-pink-500 animate-pulse">.</span>
          <span class="ml-1.5 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 uppercase tracking-widest">USMLE</span>
        </span>
        <span class="text-[9px] font-mono text-purple-300/70 tracking-widest uppercase mt-0.5">Neural Study Engine</span>
      </div>
    </div>`;

if (html.includes('Zetchy</span>')) {
  html = html.replace(oldHeaderLogo, newHeaderLogo);
}

// 3. Header Right Controls: Wire top profile container to toggle Settings Drawer
const oldProfileBtn = `<div id="top-profile-container">
        <button onclick="openLoginModal()" class="w-9 h-9 rounded-full bg-[#241732] hover:bg-[#2e1d40] border border-[#3b2752] flex items-center justify-center text-slate-300">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        </button>
      </div>`;

const newProfileBtn = `<div id="top-profile-container">
        <button onclick="toggleSettingsDrawer()" title="Account & Appearance Settings" class="flex items-center gap-2 p-1 pr-2.5 rounded-full bg-[#241732] hover:bg-[#311f44] border border-[#3b2752] text-slate-300 hover:border-pink-500/50 transition-all shadow-md group">
          <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
            K
          </div>
          <span class="text-xs font-semibold text-slate-200 hidden sm:inline max-w-[120px] truncate">kingdomhouse009</span>
          <svg class="w-3.5 h-3.5 text-slate-400 group-hover:text-pink-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
      </div>`;

html = html.replace(oldProfileBtn, newProfileBtn);

// 4. Update ANSI 1.0 PRO inside radbot-drawer
// Replace RadBot AI / Gemini 2.5 branding
html = html.replace(
  `<h3 class="text-sm font-bold flex items-center gap-1.5">
            RadBot AI
            <span class="text-[10px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded font-semibold border border-green-400/30">Gemini 2.5</span>
          </h3>
          <p class="text-[11px] text-purple-200">USMLE AI · Knows your entire platform</p>`,
  `<h3 class="text-sm font-bold flex items-center gap-2">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></span>
            </span>
            <span class="ansi-shimmer-text font-mono font-black text-sm tracking-wider">ANSI 1.0 PRO</span>
            <span class="text-[9px] bg-cyan-500/20 text-cyan-300 font-mono font-bold px-1.5 py-0.5 rounded border border-cyan-400/30 uppercase tracking-widest shadow-[0_0_8px_rgba(6,182,212,0.3)]">NEURAL</span>
          </h3>
          <p class="text-[11px] text-purple-200 font-mono">Neural USMLE Engine · High-Yield Board AI</p>`
);

html = html.replace(
  `<p class="font-bold text-pink-400 mb-1">Hello, Doctor! 🩺</p>
            <p>I am <strong>RadBot</strong>, your USMLE AI assistant powered by <strong>Gemini 2.5</strong>. I know everything about your platform — First Aid, Mehlman PDFs, Sketchy, DDx, and your flashcard library.</p>`,
  `<p class="font-bold ansi-shimmer-text mb-1 text-sm">ANSI 1.0 PRO Active 🧬</p>
            <p>I am <strong>ANSI 1.0 PRO</strong>, your next-generation neural board assistant. I have indexed your entire platform — First Aid 2024, Mehlman HY PDFs, Sketchy visual mnemonics, and 13,000+ authentic board flashcards.</p>`
);

// 5. Update Floating Trigger Button to ANSI 1.0 PRO with animated futuristic pill/ring
const oldTriggerBtn = `<!-- RadBot Trigger Button -->
  <button onclick="toggleRadBotDrawer()" class="fixed bottom-6 right-6 z-40 w-13 h-13 p-3.5 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-900/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
  </button>`;

const newTriggerBtn = `<!-- ANSI 1.0 PRO Futuristic Floating Trigger -->
  <button onclick="toggleRadBotDrawer()" class="fixed bottom-6 right-6 z-40 group p-0.5 rounded-full bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-600 shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.7)] hover:scale-105 active:scale-95 transition-all">
    <div class="px-4 py-2.5 rounded-full bg-[#0d0718] flex items-center gap-2.5 border border-white/20 backdrop-blur-md">
      <span class="relative flex h-2.5 w-2.5">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></span>
      </span>
      <span class="text-xs font-mono font-black tracking-wider ansi-shimmer-text">ANSI 1.0 PRO</span>
      <span class="text-[10px] bg-pink-500/20 text-pink-300 font-bold px-1.5 py-0.2 rounded font-mono border border-pink-400/30">AI</span>
    </div>
  </button>`;

html = html.replace(oldTriggerBtn, newTriggerBtn);

// 6. Insert the SETTINGS & APPEARANCE DRAWER (Exact Match to User Screenshot!)
const settingsDrawerHtml = `
  <!-- ========================================== -->
  <!-- SETTINGS & APPEARANCE DRAWER (SCREENSHOT MATCH) -->
  <!-- ========================================== -->
  <div id="settings-drawer" class="fixed inset-y-0 right-0 z-50 w-full sm:w-[380px] bg-[#160d20] shadow-2xl border-l border-[#2e1c3e] transform translate-x-full transition-transform duration-300 ease-in-out flex flex-col text-slate-100 select-none overflow-y-auto">
    <!-- Header -->
    <div class="p-4 border-b border-[#2b193d] flex items-center justify-between shrink-0">
      <h3 class="text-sm font-bold text-white flex items-center gap-2">
        <span>Settings &amp; Preferences</span>
      </h3>
      <button onclick="toggleSettingsDrawer()" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>

    <div class="p-4 space-y-4 flex-1">
      <!-- 1. Account Section (Exact Match) -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-400 font-medium">Account</span>
          <div class="flex items-center gap-2">
            <span id="settings-user-email" class="font-bold text-white truncate max-w-[190px]"></span>
            <button onclick="logout()" class="text-pink-400 hover:text-pink-300 underline font-medium">Log out</button>
          </div>
        </div>

        <div class="h-px bg-purple-900/40 my-2"></div>

        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-400 font-medium">Sync</span>
          <span class="text-emerald-400 font-semibold flex items-center gap-1">
            Up to date <span class="text-emerald-300">&check;</span> <span class="font-mono text-emerald-400">0:30</span>
          </span>
        </div>

        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-400 font-medium">Offline</span>
          <button onclick="openPlansModal()" class="text-slate-200 underline hover:text-pink-300">With a plan only</button>
        </div>

        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-400 font-medium">Plan</span>
          <button onclick="openPlansModal()" class="text-slate-200 underline hover:text-pink-300">Unpaid &middot; See plans</button>
        </div>
      </div>

      <!-- 2. Action Pill 1: See Plans (Exact Match) -->
      <button onclick="openPlansModal()" class="w-full py-3.5 px-4 rounded-2xl bg-[#37192b] hover:bg-[#481e37] border border-pink-900/50 flex items-center justify-between text-pink-300 font-bold text-xs shadow-md transition-all group">
        <span class="text-pink-300 text-sm font-bold">See plans</span>
        <span class="text-pink-400 text-base font-bold group-hover:translate-x-1 transition-transform">&rsaquo;</span>
      </button>

      <!-- 3. Action Pill 2: Install Synapse as an app (Exact Match) -->
      <button onclick="installAppPrompt()" class="w-full py-3.5 px-4 rounded-2xl bg-[#1d1227] hover:bg-[#281a36] border border-purple-900/60 flex items-center justify-between text-white font-bold text-xs shadow-md transition-all group">
        <span class="flex items-center gap-2.5 text-sm">
          <span class="text-pink-400 text-base">&darr;</span>
          <span>Install Synapse as an app</span>
        </span>
        <span class="text-slate-400 text-base font-bold group-hover:translate-x-1 transition-transform">&rsaquo;</span>
      </button>

      <!-- 4. APPEARANCE HEADER -->
      <div class="pt-2">
        <span class="text-[11px] font-bold text-slate-400 tracking-wider uppercase">APPEARANCE</span>
      </div>

      <!-- Theme Selector: Light / Dark / Black / Auto (Exact Match) -->
      <div class="grid grid-cols-4 gap-1 p-1 bg-[#100719] rounded-2xl border border-purple-900/50">
        <button onclick="setTheme('light')" id="theme-btn-light" class="py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all">Light</button>
        <button onclick="setTheme('dark')" id="theme-btn-dark" class="py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all">Dark</button>
        <button onclick="setTheme('black')" id="theme-btn-black" class="py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all">Black</button>
        <button onclick="setTheme('auto')" id="theme-btn-auto" class="py-2 rounded-xl text-xs font-bold bg-[#f472b6] text-black shadow-md transition-all">Auto</button>
      </div>

      <!-- Colour Swatches: 6 circular buttons (Exact Match) -->
      <div class="space-y-1.5 pt-1">
        <span class="text-xs font-bold text-slate-300">Colour</span>
        <div class="flex items-center gap-3 pt-1">
          <!-- Pink / Rose (active default) -->
          <button onclick="setAccentColor('#f43f5e', 0)" class="color-swatch w-7 h-7 rounded-full bg-[#f43f5e] ring-2 ring-white ring-offset-2 ring-offset-[#160d20] transition-all hover:scale-110" title="Rose / Pink"></button>
          <!-- Blue -->
          <button onclick="setAccentColor('#3b82f6', 1)" class="color-swatch w-7 h-7 rounded-full bg-[#2563eb] transition-all hover:scale-110" title="Blue"></button>
          <!-- Green -->
          <button onclick="setAccentColor('#16a34a', 2)" class="color-swatch w-7 h-7 rounded-full bg-[#16a34a] transition-all hover:scale-110" title="Green"></button>
          <!-- Purple -->
          <button onclick="setAccentColor('#9333ea', 3)" class="color-swatch w-7 h-7 rounded-full bg-[#9333ea] transition-all hover:scale-110" title="Purple"></button>
          <!-- Amber -->
          <button onclick="setAccentColor('#d97706', 4)" class="color-swatch w-7 h-7 rounded-full bg-[#d97706] transition-all hover:scale-110" title="Amber"></button>
          <!-- Dark -->
          <button onclick="setAccentColor('#475569', 5)" class="color-swatch w-7 h-7 rounded-full bg-[#334155] transition-all hover:scale-110" title="Charcoal"></button>
        </div>
      </div>

      <!-- Font Selector: 2 Rows of 3 Pills (Exact Match) -->
      <div class="space-y-1.5 pt-1">
        <span class="text-xs font-bold text-slate-300">Font</span>
        <div class="grid grid-cols-3 gap-2">
          <button onclick="setFontFamily('Synapse')" id="font-btn-Synapse" class="font-pill py-2.5 px-2 rounded-xl bg-[#1d1227] border-2 border-pink-500 text-pink-300 text-xs font-bold transition-all text-center">
            Synapse
          </button>
          <button onclick="setFontFamily('Inter')" id="font-btn-Inter" class="font-pill py-2.5 px-2 rounded-xl bg-[#1d1227] border border-purple-900/50 text-slate-200 text-xs font-semibold hover:border-purple-600 transition-all text-center">
            Inter
          </button>
          <button onclick="setFontFamily('Plus Jakarta')" id="font-btn-Plus Jakarta" class="font-pill py-2.5 px-2 rounded-xl bg-[#1d1227] border border-purple-900/50 text-slate-200 text-xs font-semibold hover:border-purple-600 transition-all text-center leading-tight">
            Plus Jakarta
          </button>
          <button onclick="setFontFamily('Lexend')" id="font-btn-Lexend" class="font-pill py-2.5 px-2 rounded-xl bg-[#1d1227] border border-purple-900/50 text-slate-200 text-xs font-semibold hover:border-purple-600 transition-all text-center">
            Lexend
          </button>
          <button onclick="setFontFamily('Outfit')" id="font-btn-Outfit" class="font-pill py-2.5 px-2 rounded-xl bg-[#1d1227] border border-purple-900/50 text-slate-200 text-xs font-semibold hover:border-purple-600 transition-all text-center">
            Outfit
          </button>
          <button onclick="setFontFamily('Fraunces')" id="font-btn-Fraunces" class="font-pill py-2.5 px-2 rounded-xl bg-[#1d1227] border border-purple-900/50 text-slate-200 text-xs font-serif font-bold hover:border-purple-600 transition-all text-center">
            Fraunces
          </button>
        </div>
      </div>

      <!-- All text Size Scaler: A- 100% A+ (Exact Match) -->
      <div class="flex items-center justify-between pt-2">
        <span class="text-xs font-bold text-slate-300">All text</span>
        <div class="flex items-center gap-2">
          <button onclick="adjustFontSize(-5)" class="px-3 py-1.5 rounded-lg bg-[#241634] hover:bg-[#311f44] border border-purple-900/60 text-xs font-bold text-white transition-all active:scale-95">
            A&minus;
          </button>
          <span id="font-scale-label" class="px-2 text-xs font-mono font-bold text-purple-200 min-w-[45px] text-center">100%</span>
          <button onclick="adjustFontSize(5)" class="px-3 py-1.5 rounded-lg bg-[#241634] hover:bg-[#311f44] border border-purple-900/60 text-xs font-bold text-white transition-all active:scale-95">
            A+
          </button>
        </div>
      </div>

      <!-- Fine-tune text sizes > -->
      <button onclick="showToast('Font fine-tuning unlocked for your account.')" class="w-full text-left py-2 text-xs text-slate-300 hover:text-white flex items-center justify-between group">
        <span>Fine-tune text sizes</span>
        <span class="text-slate-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all">&rsaquo;</span>
      </button>

      <!-- Send feedback > Pill (Exact Match) -->
      <button onclick="openFeedbackModal()" class="w-full py-3 px-4 rounded-2xl bg-[#1d1227] hover:bg-[#281a36] border border-purple-900/60 flex items-center justify-between text-pink-400 hover:text-pink-300 font-bold text-xs shadow-md transition-all group">
        <span>Send feedback</span>
        <span class="text-pink-400 text-base font-bold group-hover:translate-x-1 transition-transform">&rsaquo;</span>
      </button>
    </div>
  </div>
`;

// Insert the settings drawer before modal-auth
if (!html.includes('id="settings-drawer"')) {
  html = html.replace('<!-- MODALS (LOGIN & PLANS)', settingsDrawerHtml + '\n  <!-- MODALS (LOGIN & PLANS)');
}

fs.writeFileSync(indexHtmlPath, html, 'utf8');
console.log('Successfully updated public/index.html with Synapse rebranding, ANSI 1.0 PRO, and Settings Drawer!');
