// ==UserScript==
// @name         CMA WhatsApp Auto Send
// @namespace    chordsmusicacademy
// @version      1.1
// @description  Auto-clicks Send on WhatsApp Web when opened from CMA Broadcast. Install via Tampermonkey.
// @author       Chords Music Academy
// @match        https://web.whatsapp.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // Only activate on wa.me-style send links (opened from CMA broadcast)
  if (!location.href.includes('/send') && !location.href.includes('phone=')) return;

  let attempts = 0;
  const MAX_ATTEMPTS = 40; // 20 seconds total

  function tryAutoSend() {
    attempts++;
    if (attempts > MAX_ATTEMPTS) return;

    // Step 1: WhatsApp sometimes shows a "Continue to Chat" / "OK" dialog
    const dialogs = document.querySelectorAll('[data-testid="popup-controls-ok"], button[data-animate-modal-popup-btn], div[role="button"]');
    for (const el of dialogs) {
      const txt = el.textContent.trim().toLowerCase();
      if (txt === 'ok' || txt === 'continue to chat' || txt === 'open chat') {
        el.click();
        setTimeout(tryAutoSend, 1500);
        return;
      }
    }

    // Step 2: Find the compose box — must have text in it
    const compose =
      document.querySelector('[data-testid="conversation-compose-box-input"]') ||
      document.querySelector('div[contenteditable="true"][data-tab="10"]') ||
      document.querySelector('div[contenteditable="true"][title="Type a message"]');

    if (!compose || !compose.textContent.trim()) {
      setTimeout(tryAutoSend, 500);
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
      setTimeout(tryAutoSend, 500);
      return;
    }

    // Small natural delay before sending (looks more human)
    setTimeout(() => {
      sendBtn.click();
      // Close the tab after a brief pause so the message registers
      setTimeout(() => window.close(), 1000);
    }, 800);
  }

  // Start polling after WhatsApp Web has had time to initialise
  setTimeout(tryAutoSend, 3000);
})();
