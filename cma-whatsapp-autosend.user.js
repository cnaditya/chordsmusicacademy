// ==UserScript==
// @name         CMA WhatsApp Auto Send
// @namespace    chordsmusicacademy
// @version      2.0
// @description  Auto-clicks Send on WhatsApp Web for each student opened by CMA Broadcast. Tab stays open.
// @author       Chords Music Academy
// @match        https://web.whatsapp.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  let attempts = 0;
  const MAX_ATTEMPTS = 40; // 20s total per student
  let autoSendTimer = null;

  function isSendUrl(url) {
    return url.includes('/send') || url.includes('phone=');
  }

  function resetAndSend() {
    clearTimeout(autoSendTimer);
    attempts = 0;
    if (isSendUrl(location.href)) {
      autoSendTimer = setTimeout(tryAutoSend, 3000);
    }
  }

  function tryAutoSend() {
    if (!isSendUrl(location.href)) return; // URL changed away, stop
    attempts++;
    if (attempts > MAX_ATTEMPTS) return;

    // Step 1: Dismiss any "Continue to Chat" / "OK" dialog
    const dialogs = document.querySelectorAll(
      '[data-testid="popup-controls-ok"], button[data-animate-modal-popup-btn], div[role="button"]'
    );
    for (const el of dialogs) {
      const txt = el.textContent.trim().toLowerCase();
      if (txt === 'ok' || txt === 'continue to chat' || txt === 'open chat') {
        el.click();
        autoSendTimer = setTimeout(tryAutoSend, 1500);
        return;
      }
    }

    // Step 2: Find the compose box with text in it
    const compose =
      document.querySelector('[data-testid="conversation-compose-box-input"]') ||
      document.querySelector('div[contenteditable="true"][data-tab="10"]') ||
      document.querySelector('div[contenteditable="true"][title="Type a message"]');

    if (!compose || !compose.textContent.trim()) {
      autoSendTimer = setTimeout(tryAutoSend, 500);
      return;
    }

    // Step 3: Find the send button
    const sendBtn =
      document.querySelector('[data-testid="send"]') ||
      document.querySelector('button[aria-label="Send"]') ||
      document.querySelector('span[data-icon="send"]')?.closest('button') ||
      [...document.querySelectorAll('button')].find(b =>
        b.getAttribute('aria-label')?.toLowerCase().includes('send')
      );

    if (!sendBtn) {
      autoSendTimer = setTimeout(tryAutoSend, 500);
      return;
    }

    // Small natural delay before clicking send
    setTimeout(() => sendBtn.click(), 800);
    // Tab stays open — CRM will navigate it to the next student
  }

  // Detect SPA navigation by hooking history.pushState / replaceState
  const _push = history.pushState.bind(history);
  const _replace = history.replaceState.bind(history);
  history.pushState = function (...args) { _push(...args); resetAndSend(); };
  history.replaceState = function (...args) { _replace(...args); resetAndSend(); };
  window.addEventListener('popstate', resetAndSend);

  // Also watch for URL changes via MutationObserver (WhatsApp uses SPA routing)
  let _lastHref = location.href;
  const _observer = new MutationObserver(() => {
    if (location.href !== _lastHref) {
      _lastHref = location.href;
      resetAndSend();
    }
  });
  _observer.observe(document.body, { childList: true, subtree: true });

  // Initial run
  resetAndSend();
})();
