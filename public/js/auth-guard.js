/**
 * Synapse Auth Guard
 * Injected into every page. Redirects to login if no valid session.
 * Checks trial expiry and shows upgrade prompt.
 */
(function () {
  'use strict';

  // =========================================================
  // ANTI-DEVTOOLS / CONSOLE PROTECTION
  // =========================================================
  (function antiDevtools() {
    // Disable right-click context menu
    document.addEventListener('contextmenu', e => e.preventDefault(), true);

    // Detect F12 / DevTools shortcuts
    document.addEventListener('keydown', function (e) {
      const key = e.key || e.keyCode;
      // F12
      if (key === 'F12' || e.keyCode === 123) { e.preventDefault(); return false; }
      // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) { e.preventDefault(); return false; }
      // Ctrl+U (view source)
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) { e.preventDefault(); return false; }
      // Ctrl+S
      if (e.ctrlKey && (e.key === 's' || e.key === 'S') && !e.shiftKey) { e.preventDefault(); return false; }
    }, true);

    // Console detective — clears console and warns
    const noop = () => {};
    const warn = () => { console.clear(); console.log('%c⛔ Unauthorized Access Detected', 'color:red;font-size:24px;font-weight:bold;'); };
    Object.defineProperty(window, 'console', {
      configurable: false,
      get: () => ({
        log: warn, warn: warn, error: warn, info: warn, dir: warn, table: warn, debug: noop,
        clear: Function.prototype.bind.call(console.clear, console),
        group: noop, groupCollapsed: noop, groupEnd: noop, time: noop, timeEnd: noop
      })
    });

    // Detect debugger / DevTools open via timing trick
    let devtoolsOpen = false;
    setInterval(() => {
      const start = performance.now();
      debugger; // eslint-disable-line no-debugger
      if (performance.now() - start > 100 && !devtoolsOpen) {
        devtoolsOpen = true;
        document.body.style.display = 'none';
        document.body.innerHTML = '';
      }
    }, 2000);

    // Block selecting text to copy (optional — softer security)
    // document.addEventListener('selectstart', e => e.preventDefault(), true);
  })();

  // =========================================================
  // SESSION MANAGEMENT
  // =========================================================
  const TOKEN_KEY  = 'synapse_token';
  const USER_KEY   = 'synapse_user';
  const ACCESS_KEY = 'synapse_access';

  function getToken()  { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } }
  function getUser()   { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; } }
  function getAccess() { try { return JSON.parse(localStorage.getItem(ACCESS_KEY) || 'null'); } catch { return null; } }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem('synapse_login_redirect_pending');
    window.location.href = '/login.html';
  }

  window.synapseLogout = logout;
  window.synapseGetUser = getUser;
  window.synapseGetToken = getToken;

  // Guard logic for admin and public pages
  const page = window.location.pathname;
  if (page.startsWith('/admin')) {
    const token = getToken();
    const user = getUser();
    if (!token || !user || user.role !== 'admin') {
      window.location.href = '/login.html';
      return;
    }
    return;
  }

  const publicPages = [
    '/login.html',
    '/terms.html',
    '/privacy.html',
    '/cookies.html',
    '/editorial.html',
    '/contact.html'
  ];
  if (publicPages.includes(page)) return;

  async function verifyAndRender() {
    const token = getToken();
    const user  = getUser();
    const access = getAccess();

    if (!token || !user) {
      window.location.href = '/login.html';
      return;
    }

    // Verify with server
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (!res.ok) {
        const freshLoginPending = sessionStorage.getItem('synapse_login_redirect_pending') === '1';
        sessionStorage.removeItem('synapse_login_redirect_pending');

        if (freshLoginPending) {
          for (const delay of [300, 700, 1200]) {
            await new Promise(resolve => setTimeout(resolve, delay));
            const retry = await fetch('/api/auth/me', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            if (retry.ok) {
              const data = await retry.json();
              localStorage.setItem(USER_KEY, JSON.stringify(data.user));
              localStorage.setItem(ACCESS_KEY, JSON.stringify(data.accessStatus));
              window.location.replace(window.location.href);
              return;
            }
          }
        }

        if (res.status === 401 || res.status === 403) {
          logout();
        } else if (user && access && access.active) {
          window.__SYNAPSE_USER__ = user;
          window.__SYNAPSE_ACCESS__ = access;
          document.body.hidden = false;
        }
        return;
      }

      const data = await res.json();
      const serverUser   = data.user;
      const serverAccess = data.accessStatus;

      // Update local cache
      localStorage.setItem(USER_KEY, JSON.stringify(serverUser));
      localStorage.setItem(ACCESS_KEY, JSON.stringify(serverAccess));

      // Admins: redirect to admin dashboard if they land on main app
      if (serverUser.role === 'admin') {
        // Allow admin to use the main app — no redirect needed
        window.__ADMIN__ = true;
      }

      // Check access
      if (!serverAccess.active && serverUser.role !== 'admin') {
        document.body.hidden = false;
        sessionStorage.removeItem('synapse_login_redirect_pending');
        showUpgradeWall(serverAccess);
        return;
      }

      // Inject user info into header if element exists
      injectUserUI(serverUser, serverAccess);
      document.body.hidden = false;

      // Expose globally for the app
      window.__SYNAPSE_USER__   = serverUser;
      window.__SYNAPSE_ACCESS__ = serverAccess;
      window.__SYNAPSE_TOKEN__  = token;

      // Set up periodic study progress sync
      setupStudySync(token);

    } catch (err) {
      // Network error — allow offline use briefly
      if (user && access && access.active) {
        window.__SYNAPSE_USER__   = user;
        window.__SYNAPSE_ACCESS__ = access;
        window.__SYNAPSE_TOKEN__  = token;
        injectUserUI(user, access);
        document.body.hidden = false;
      } else {
        logout();
      }
    }
  }

  function injectUserUI(user, access) {
    // Try to find the topbar user area and update it
    const existing = document.getElementById('synapse-user-pill');
    if (existing) {
      existing.innerHTML = buildUserPill(user, access);
      return;
    }
    // Otherwise create a floating indicator
    const pill = document.createElement('div');
    pill.id = 'synapse-user-pill';
    pill.style.cssText = 'position:fixed;top:10px;right:12px;z-index:9999;';
    pill.innerHTML = buildUserPill(user, access);
    document.body.appendChild(pill);
  }

  function buildUserPill(user, access) {
    const tierColors = { admin: '#dc2680', premium: '#7c3aed', trial: '#d97706', expired: '#dc2626', free: '#374151' };
    const color = tierColors[access.type] || '#374151';
    const pic = user.picture ? `<img src="${user.picture}" style="width:22px;height:22px;border-radius:50%;margin-right:6px;">` : '';
    const daysLeft = access.type === 'trial' ? ` · ${access.daysLeft}d left` : '';
    return `<div style="display:flex;align-items:center;background:rgba(10,10,20,0.9);border:1px solid ${color}40;border-radius:999px;padding:4px 10px;font-size:11px;font-weight:600;color:#e2e8f0;cursor:pointer;gap:4px;" title="${user.email}" onclick="window.synapseLogout()">
      ${pic}
      <span style="color:${color};text-transform:uppercase;">${access.type}${daysLeft}</span>
    </div>`;
  }

  function showUpgradeWall(access) {
    document.body.style.overflow = 'hidden';
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(7,7,17,0.97);display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:40px;max-width:420px;text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;">⏰</div>
        <h2 style="font-size:22px;font-weight:700;color:#fff;margin-bottom:8px;">Free Trial Ended</h2>
        <p style="color:#94a3b8;font-size:14px;margin-bottom:24px;">Your 30-day free trial has ended. Subscribe to continue accessing Synapse.</p>
        <div style="background:linear-gradient(135deg,rgba(220,38,127,0.1),rgba(124,58,237,0.1));border:1px solid rgba(220,38,127,0.2);border-radius:16px;padding:20px;margin-bottom:24px;">
          <div style="color:#f43f8e;font-size:20px;font-weight:800;margin-bottom:4px;">Contact Admin</div>
          <div style="color:#94a3b8;font-size:13px;">Contact the Synapse support team<br>to activate your subscription</div>
        </div>
        <button onclick="window.synapseLogout()" style="padding:12px 32px;border-radius:12px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#e2e8f0;font-size:14px;font-weight:600;cursor:pointer;">Sign Out</button>
      </div>`;
    document.body.appendChild(overlay);
  }

  // =========================================================
  // STUDY SYNC — save progress to server every 60s
  // =========================================================
  function setupStudySync(token) {
    const syncStudy = async () => {
      try {
        const progress = collectStudyProgress();
        if (!progress || Object.keys(progress).length === 0) return;
        await fetch('/api/study/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ data: progress })
        });
      } catch {}
    };

    // Load saved progress on start
    fetch('/api/study/progress', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(r => r.json())
      .then(d => {
        if (d.data && Object.keys(d.data).length > 0) {
          restoreStudyProgress(d.data);
        }
      }).catch(() => {});

    // Sync every 60 seconds
    setInterval(syncStudy, 60000);
    // Sync on page hide
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) syncStudy();
    });
    window.addEventListener('beforeunload', syncStudy);
  }

  function collectStudyProgress() {
    // Collect all relevant study keys from localStorage
    const studyKeys = [
      'mehlman_progress', 'fa_bookmarks', 'fa_notes', 'fa_last_page',
      'review_progress', 'flashcard_progress', 'uworld_marked'
    ];
    const result = {};
    studyKeys.forEach(k => {
      const val = localStorage.getItem(k);
      if (val) {
        try { result[k] = JSON.parse(val); }
        catch { result[k] = val; }
      }
    });
    return result;
  }

  function restoreStudyProgress(data) {
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'updatedAt') return;
      try {
        const existing = localStorage.getItem(k);
        // Only restore if local doesn't have it yet
        if (!existing) {
          localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
        }
      } catch {}
    });
  }

  // Run auth check
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', verifyAndRender);
  } else {
    verifyAndRender();
  }

})();
