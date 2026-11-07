/**
 * Synapse Auth Guard
 * Injected into every page. Redirects to login if no valid session.
 * Checks trial expiry and shows upgrade prompt.
 */
(function () {
  'use strict';

  // =========================================================
  // SESSION MANAGEMENT
  // =========================================================
  const TOKEN_KEY  = 'synapse_token';
  const USER_KEY   = 'synapse_user';
  const ACCESS_KEY = 'synapse_access';
  // Remove the legacy floating account pill so it cannot intercept header clicks.
  const legacyUserPill = document.getElementById('synapse-user-pill');
  if (legacyUserPill) legacyUserPill.remove();

  function getToken()  { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } }
  function getUser()   { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; } }
  function getAccess() { try { return JSON.parse(localStorage.getItem(ACCESS_KEY) || 'null'); } catch { return null; } }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem('synapse_login_redirect_pending');
    sessionStorage.removeItem('synapse_login_started_at');
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
        const loginStartedAt = Number(sessionStorage.getItem('synapse_login_started_at'));
        const withinLoginGrace = Number.isFinite(loginStartedAt) &&
          Date.now() - loginStartedAt <= 10000;
        sessionStorage.removeItem('synapse_login_redirect_pending');
        sessionStorage.removeItem('synapse_login_started_at');

        if (freshLoginPending && withinLoginGrace) {
          for (const delay of [300, 700, 1200]) {
            await new Promise(resolve => setTimeout(resolve, delay));
            const retry = await fetch('/api/auth/me', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            if (retry.ok) {
              const data = await retry.json();
              localStorage.setItem(USER_KEY, JSON.stringify(data.user));
              localStorage.setItem(ACCESS_KEY, JSON.stringify(data.accessStatus));
              sessionStorage.removeItem('synapse_login_redirect_pending');
              window.__SYNAPSE_USER__ = data.user;
              window.__SYNAPSE_ACCESS__ = data.accessStatus;
              window.__SYNAPSE_TOKEN__ = token;
              document.body.hidden = false;
              return;
            }
          }

          if (res.status === 401 && user && access && access.active) {
            window.__SYNAPSE_USER__ = user;
            window.__SYNAPSE_ACCESS__ = access;
            window.__SYNAPSE_TOKEN__ = token;
            document.body.hidden = false;
            return;
          }
        }

        if (res.status === 401 || res.status === 403) {
          sessionStorage.removeItem('synapse_login_redirect_pending');
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
        document.body.hidden = false;
      } else {
        logout();
      }
    }
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
          <div style="color:#f43f8e;font-size:20px;font-weight:800;margin-bottom:4px;">Continue with a plan</div>
          <div style="color:#94a3b8;font-size:13px;">Your trial has ended. View the available USD plans<br>to continue using locked study features.</div>
        </div>
        <div style="display:flex;gap:10px;justify-content:center;">
          <button onclick="this.closest('[data-synapse-upgrade-wall]').remove();document.body.style.overflow='';if(window.openPlansModal){window.openPlansModal();}" style="padding:12px 24px;border-radius:12px;background:linear-gradient(135deg,#db2777,#7c3aed);border:0;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">View plans</button>
          <button onclick="window.synapseLogout()" style="padding:12px 24px;border-radius:12px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#e2e8f0;font-size:14px;font-weight:600;cursor:pointer;">Sign Out</button>
        </div>
      </div>`;
    overlay.dataset.synapseUpgradeWall = 'true';
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
