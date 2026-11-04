const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexHtmlPath, 'utf8');

// 1. Update Viewport meta tag for mobile notch & cover
html = html.replace(
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">',
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">'
);

// 2. Add Mobile & Touch CSS improvements in <style>
const mobileCss = `
    /* Mobile & Touch Performance Polish */
    * {
      -webkit-tap-highlight-color: transparent;
      box-sizing: border-box;
    }
    html, body {
      overflow-x: hidden;
      max-width: 100vw;
      width: 100%;
    }
    button, a, input, select {
      touch-action: manipulation;
    }
    .overflow-y-auto, .overflow-x-auto {
      -webkit-overflow-scrolling: touch;
    }
    /* Safe Area padding for notched phones */
    .pb-safe {
      padding-bottom: max(env(safe-area-inset-bottom, 16px), 16px);
    }
    .pt-safe {
      padding-top: max(env(safe-area-inset-top, 12px), 12px);
    }
    /* Tactile button feedback */
    button:active {
      transform: scale(0.97);
    }
    /* Futuristic Cyber Glows & Borders */
    .cyber-btn {
      position: relative;
      overflow: hidden;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cyber-btn:hover {
      box-shadow: 0 0 15px rgba(244, 63, 94, 0.4), inset 0 0 10px rgba(34, 211, 238, 0.2);
    }
    @media (max-width: 640px) {
      .mobile-compact-pill {
        padding: 4px 8px !important;
        font-size: 11px !important;
      }
    }
`;

if (!html.includes('/* Mobile & Touch Performance Polish */')) {
  html = html.replace('/* Dark scrollbar */', mobileCss + '\n    /* Dark scrollbar */');
}

// 3. Add Mobile Bottom Navigation Bar before tour modal
const mobileBottomNav = `
  <!-- ========================================== -->
  <!-- MOBILE BOTTOM NAVIGATION BAR (ANDROID & IOS) -->
  <!-- ========================================== -->
  <nav id="mobile-bottom-nav" class="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#120a1c]/95 backdrop-blur-xl border-t border-[#2e1d44] px-1 py-1.5 flex items-center justify-around text-slate-400 select-none shadow-[0_-10px_25px_rgba(0,0,0,0.6)]" style="padding-bottom: max(env(safe-area-inset-bottom, 8px), 8px);">
    <button onclick="navigate('home')" id="mobile-nav-home" class="mobile-nav-item flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all text-pink-400">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
      <span class="text-[10px] font-bold mt-0.5">Home</span>
    </button>
    <button onclick="navigate('fa')" id="mobile-nav-fa" class="mobile-nav-item flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all hover:text-white">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
      <span class="text-[10px] font-medium mt-0.5">First Aid</span>
    </button>
    <button onclick="navigate('mehlman')" id="mobile-nav-mehlman" class="mobile-nav-item flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all hover:text-white">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
      <span class="text-[10px] font-medium mt-0.5">Mehlman</span>
    </button>
    <button onclick="navigate('sketchy')" id="mobile-nav-sketchy" class="mobile-nav-item flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all hover:text-white">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
      <span class="text-[10px] font-medium mt-0.5">Sketchy</span>
    </button>
    <button onclick="toggleRadBotDrawer()" class="mobile-nav-item flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all text-cyan-400 group">
      <div class="relative">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        <span class="w-1.5 h-1.5 rounded-full bg-pink-500 absolute -top-0.5 -right-0.5 animate-ping"></span>
      </div>
      <span class="text-[10px] font-bold mt-0.5">ANSI AI</span>
    </button>
    <button onclick="toggleSettingsDrawer()" class="mobile-nav-item flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all hover:text-white">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      <span class="text-[10px] font-medium mt-0.5">Settings</span>
    </button>
  </nav>
`;

if (!html.includes('id="mobile-bottom-nav"')) {
  html = html.replace('<!-- ==========================================\n  <!-- 2-MINUTE ONBOARDING TOUR MODAL', mobileBottomNav + '\n  <!-- ==========================================\n  <!-- 2-MINUTE ONBOARDING TOUR MODAL');
}

// 4. Update ANSI 1.0 PRO Floating Button position so it doesn't collide with bottom nav on mobile
html = html.replace(
  '<!-- ANSI 1.0 PRO Futuristic Floating Trigger -->\n  <button onclick="toggleRadBotDrawer()" class="fixed bottom-6 right-6',
  '<!-- ANSI 1.0 PRO Futuristic Floating Trigger -->\n  <button onclick="toggleRadBotDrawer()" class="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8'
);

// 5. Update First Aid zoom control position so it doesn't overlap stepper on mobile
html = html.replace(
  '<!-- Zoom Control (100% + -) -->\n        <div class="fixed bottom-6 right-6 z-30',
  '<!-- Zoom Control (100% + -) -->\n        <div class="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-30'
);

// 6. Update Mehlman zoom control position so it doesn't overlap stepper on mobile
html = html.replace(
  '<!-- Zoom Control -->\n        <div class="fixed bottom-6 right-6 z-30',
  '<!-- Zoom Control -->\n        <div class="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-30'
);

// 7. Ensure Drawers take 100% width on small screens and smooth max-w
html = html.replace(
  'id="radbot-drawer" class="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px]',
  'id="radbot-drawer" class="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] max-w-full'
);

html = html.replace(
  'id="settings-drawer" class="fixed inset-y-0 right-0 z-50 w-full sm:w-[380px]',
  'id="settings-drawer" class="fixed inset-y-0 right-0 z-50 w-full sm:w-[390px] max-w-full'
);

// 8. Improve Header for mobile: wrap-free, compact badges
html = html.replace(
  '<button onclick="openPlansModal()" id="top-tier-pill" class="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#241732] hover:bg-[#2e1d40] text-slate-300 border border-[#3b2752] transition-colors">',
  '<button onclick="openPlansModal()" id="top-tier-pill" class="mobile-compact-pill px-3 py-1.5 rounded-full text-xs font-medium bg-[#241732] hover:bg-[#2e1d40] text-slate-300 border border-[#3b2752] transition-colors whitespace-nowrap">'
);

fs.writeFileSync(indexHtmlPath, html, 'utf8');
console.log('Applied mobile & Android responsive enhancements to public/index.html!');
