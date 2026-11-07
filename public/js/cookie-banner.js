/**
 * Synapse Essential Cookie Consent Banner
 * ======================================================================
 * Manages cookie preferences and stores consent in localStorage.
 */
(function() {
  'use strict';

  const CONSENT_KEY = 'synapse_cookie_consent';
  const CONSENT_DATE_KEY = 'synapse_cookie_consent_date';

  function getConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch {
      return null;
    }
  }

  function setConsent(choice) {
    try {
      localStorage.setItem(CONSENT_KEY, choice);
      localStorage.setItem(CONSENT_DATE_KEY, new Date().toISOString());
    } catch {}

    // Hide banner
    const banner = document.getElementById('synapse-cookie-banner');
    if (banner) {
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(20px)';
      setTimeout(() => banner.remove(), 300);
    }

    // Hide modal if open
    const modal = document.getElementById('synapse-cookie-modal');
    if (modal) modal.remove();
  }

  function renderBanner() {
    if (document.getElementById('synapse-cookie-banner')) return;
    if (getConsent()) {
      return;
    }

    const banner = document.createElement('div');
    banner.id = 'synapse-cookie-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      width: calc(100% - 32px);
      max-width: 820px;
      background: rgba(22, 13, 34, 0.95);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(147, 51, 234, 0.4);
      border-radius: 20px;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(147, 51, 234, 0.2);
      padding: 18px 22px;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
    `;

    banner.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="display: flex; align-items: flex-start; gap: 14px;">
          <div style="font-size: 26px; line-height: 1; flex-shrink: 0; padding-top: 2px;">🍪</div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
              <span>Cookie & Privacy Choice</span>
              <span style="font-size: 10px; font-weight: 600; background: rgba(147, 51, 234, 0.25); color: #c084fc; padding: 2px 8px; border-radius: 999px; border: 1px solid rgba(147, 51, 234, 0.4);">GDPR / CPRA</span>
            </div>
            <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0;">
              Synapse uses essential storage to keep you signed in, preserve your theme, and save your USMLE flashcard progress.
              <a href="/cookies.html" style="color: #ec4899; text-decoration: underline; margin-left: 4px; font-weight: 500;">Read Cookie Policy</a>
            </p>
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; padding-top: 6px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
          <div style="display: flex; gap: 14px; font-size: 11px;">
            <a href="/terms.html" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">Terms of Service</a>
            <span style="color: #475569;">•</span>
            <a href="/privacy.html" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">Privacy Policy</a>
            <span style="color: #475569;">•</span>
            <button id="synapse-cookie-customize-btn" style="background: none; border: none; padding: 0; color: #c084fc; font-size: 11px; cursor: pointer; text-decoration: underline;">Customize</button>
          </div>

          <div style="display: flex; gap: 8px;">
            <button id="synapse-cookie-essential-btn" style="
              background: rgba(255, 255, 255, 0.06);
              border: 1px solid rgba(255, 255, 255, 0.15);
              color: #cbd5e1;
              font-size: 12px;
              font-weight: 600;
              padding: 7px 16px;
              border-radius: 10px;
              cursor: pointer;
              transition: all 0.2s;
            ">Essential Only</button>

            <button id="synapse-cookie-accept-btn" style="
              background: linear-gradient(135deg, #ec4899, #8b5cf6);
              border: none;
              color: #fff;
              font-size: 12px;
              font-weight: 700;
              padding: 7px 20px;
              border-radius: 10px;
              cursor: pointer;
              box-shadow: 0 4px 15px rgba(236, 72, 153, 0.35);
              transition: all 0.2s;
            ">Accept All</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Event listeners
    document.getElementById('synapse-cookie-accept-btn').addEventListener('click', () => setConsent('all'));
    document.getElementById('synapse-cookie-essential-btn').addEventListener('click', () => setConsent('essential'));
    document.getElementById('synapse-cookie-customize-btn').addEventListener('click', openCookieSettings);
  }

  function openCookieSettings() {
    let modal = document.getElementById('synapse-cookie-modal');
    if (modal) modal.remove();

    const currentConsent = getConsent() || 'all';

    modal = document.createElement('div');
    modal.id = 'synapse-cookie-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 100000;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    modal.innerHTML = `
      <div style="
        background: #150d22;
        border: 1px solid rgba(147, 51, 234, 0.4);
        border-radius: 24px;
        max-width: 540px;
        width: 100%;
        padding: 24px;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
        color: #f1f5f9;
        max-height: 90vh;
        overflow-y: auto;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); pb: 12px;">
          <h3 style="font-size: 18px; font-weight: 700; color: #fff; margin: 0; display: flex; align-items: center; gap: 8px;">
            <span>🍪</span> Cookie Preferences
          </h3>
          <button id="close-cookie-modal-btn" style="background: none; border: none; font-size: 22px; color: #94a3b8; cursor: pointer; line-height: 1;">&times;</button>
        </div>

        <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 16px;">
          Select which cookie categories you want to allow. Essential cookies are required for user authentication, trial countdown, and security.
        </p>

        <!-- Category 1: Essential -->
        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 14px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 13px; font-weight: 700; color: #fff;">1. Strictly Necessary Cookies</div>
            <span style="font-size: 10px; font-weight: 700; background: rgba(34, 197, 94, 0.2); color: #4ade80; padding: 2px 8px; border-radius: 999px;">Always Active</span>
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.4;">
            Required for Google authentication session, F12 security protection, 30-day trial status, and First Aid reader page bookmarking.
          </p>
        </div>

        <!-- Category 2: Analytics -->
        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 14px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 13px; font-weight: 700; color: #fff;">2. Performance & Study Analytics</div>
            <input type="checkbox" id="cookie-opt-analytics" ${currentConsent === 'all' ? 'checked' : ''} style="cursor: pointer; width: 18px; height: 18px; accent-color: #ec4899;">
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.4;">
            Helps us monitor study session durations, question bank completion rates, and platform stability.
          </p>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button id="cookie-modal-save-btn" style="
            background: linear-gradient(135deg, #ec4899, #8b5cf6);
            border: none;
            color: #fff;
            font-size: 12px;
            font-weight: 700;
            padding: 9px 22px;
            border-radius: 12px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(236, 72, 153, 0.35);
          ">Save Preferences</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('close-cookie-modal-btn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    document.getElementById('cookie-modal-save-btn').addEventListener('click', () => {
      const analyticsChecked = document.getElementById('cookie-opt-analytics').checked;
      setConsent(analyticsChecked ? 'all' : 'essential');
    });
  }

  // Expose globally
  window.openCookieSettings = openCookieSettings;
  window.synapseSetConsent = setConsent;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderBanner);
  } else {
    renderBanner();
  }
})();
