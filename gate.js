/**
 * Saunders Wood Works — Access Gate
 *
 * Step 1: Password ("Saunders2026")
 * Step 2: NDA scroll + checkbox + pre-signed by Hans Turner
 *
 * Access state is persisted to localStorage so users aren't re-prompted.
 * Key: 'sw_gate_v1' — bump version to force re-acceptance.
 */
(function () {
  'use strict';

  const GATE_KEY    = 'sw_gate_v1';
  const PASSWORD    = 'Saunders2026';
  const SIGNED_DATE = 'April 17, 2026';

  /* ── Already cleared? ──────────────────────────────────────────────────── */
  if (localStorage.getItem(GATE_KEY) === 'granted') return;

  /* ── Inject styles ─────────────────────────────────────────────────────── */
  const css = document.createElement('style');
  css.textContent = `
    #sw-gate-overlay {
      position: fixed; inset: 0; z-index: 99999;
      background: #0a0a08;
      display: flex; align-items: center; justify-content: center;
      font-family: degular, "degular-text", system-ui, sans-serif;
      padding: 20px;
    }
    #sw-gate-overlay * { box-sizing: border-box; }

    .sw-gate-card {
      background: #111210;
      border: 1px solid rgba(201,164,76,.22);
      border-radius: 16px;
      width: 100%; max-width: 520px;
      padding: 44px 40px 40px;
      box-shadow: 0 24px 80px rgba(0,0,0,.7);
      animation: swFadeUp .4s ease both;
    }
    @keyframes swFadeUp {
      from { opacity:0; transform: translateY(18px); }
      to   { opacity:1; transform: translateY(0); }
    }

    .sw-gate-logo {
      width: 44px; height: 44px; overflow: hidden;
      margin: 0 auto 22px;
    }
    .sw-gate-logo img {
      width: 44px; height: 44px;
      object-fit: contain; object-position: center top;
      transform: scale(1.7); transform-origin: center top;
    }

    .sw-gate-eyebrow {
      text-align: center;
      font-size: 10px; letter-spacing: .18em; text-transform: uppercase;
      color: #C9A44C; margin-bottom: 6px; font-weight: 600;
    }
    .sw-gate-title {
      text-align: center;
      font-family: "minerva-modern", Georgia, serif;
      font-size: 1.55rem; font-weight: 500;
      color: #fff; margin-bottom: 8px; line-height: 1.15;
    }
    .sw-gate-sub {
      text-align: center;
      font-size: .83rem; color: rgba(255,255,255,.42);
      margin-bottom: 32px; line-height: 1.55;
    }

    /* ── Password step ── */
    .sw-pw-wrap {
      display: flex; flex-direction: column; gap: 12px;
    }
    .sw-pw-input {
      width: 100%;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(201,164,76,.28);
      border-radius: 10px;
      padding: 14px 18px;
      font-size: 1rem; color: #fff;
      outline: none; transition: border-color .2s;
      letter-spacing: .06em;
      font-family: inherit;
    }
    .sw-pw-input::placeholder { color: rgba(255,255,255,.28); letter-spacing: .03em; }
    .sw-pw-input:focus { border-color: #C9A44C; }
    .sw-pw-input.sw-error { border-color: #e05252; animation: swShake .35s ease; }
    @keyframes swShake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-7px); }
      60%      { transform: translateX(7px); }
    }

    .sw-btn {
      width: 100%;
      background: #C9A44C;
      color: #0a0a08;
      border: none; border-radius: 10px;
      padding: 14px 20px;
      font-family: "minerva-modern", Georgia, serif;
      font-size: 1rem; font-weight: 600;
      letter-spacing: .06em; text-transform: uppercase;
      cursor: pointer; transition: background .18s, opacity .18s;
    }
    .sw-btn:hover { background: #e0bc70; }
    .sw-btn:disabled { opacity: .38; cursor: not-allowed; }

    .sw-err-msg {
      font-size: .8rem; color: #e05252;
      text-align: center; min-height: 18px;
    }

    /* ── NDA step ── */
    .sw-nda-scroll {
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 10px;
      height: 280px; overflow-y: auto;
      padding: 22px 20px;
      margin-bottom: 18px;
      font-size: .82rem; color: rgba(255,255,255,.7);
      line-height: 1.7;
      scroll-behavior: smooth;
    }
    .sw-nda-scroll::-webkit-scrollbar { width: 4px; }
    .sw-nda-scroll::-webkit-scrollbar-track { background: transparent; }
    .sw-nda-scroll::-webkit-scrollbar-thumb { background: rgba(201,164,76,.35); border-radius: 4px; }

    .sw-nda-scroll h3 {
      font-family: "minerva-modern", Georgia, serif;
      color: #fff; font-size: 1rem; font-weight: 500;
      margin: 0 0 14px; letter-spacing: .03em;
    }
    .sw-nda-scroll h4 {
      color: #C9A44C; font-size: .75rem;
      letter-spacing: .12em; text-transform: uppercase;
      margin: 20px 0 5px; font-weight: 600;
    }
    .sw-nda-scroll p { margin: 0 0 10px; }

    .sw-nda-sig {
      border-top: 1px solid rgba(201,164,76,.2);
      margin-top: 22px; padding-top: 18px;
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .sw-sig-block { display: flex; flex-direction: column; gap: 3px; }
    .sw-sig-label {
      font-size: .68rem; letter-spacing: .12em; text-transform: uppercase;
      color: rgba(255,255,255,.35);
    }
    .sw-sig-name {
      font-family: "minerva-modern", Georgia, serif;
      font-size: 1.05rem; color: #C9A44C; font-style: italic;
    }
    .sw-sig-sub {
      font-size: .72rem; color: rgba(255,255,255,.45);
    }
    .sw-sig-you {
      font-size: .8rem; color: rgba(255,255,255,.4);
      font-style: italic;
    }

    .sw-scroll-hint {
      display: flex; align-items: center; gap: 7px;
      font-size: .75rem; color: rgba(255,255,255,.35);
      margin-bottom: 14px; transition: opacity .3s;
    }
    .sw-scroll-hint svg { flex-shrink:0; }
    .sw-scroll-hint.sw-done { opacity: 0; pointer-events: none; }

    .sw-check-row {
      display: flex; align-items: flex-start; gap: 12px;
      margin-bottom: 20px;
      cursor: pointer;
    }
    .sw-check-row input[type="checkbox"] {
      width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px;
      accent-color: #C9A44C; cursor: pointer;
    }
    .sw-check-label {
      font-size: .84rem; color: rgba(255,255,255,.65); line-height: 1.5;
      cursor: pointer;
    }

    @media (max-width: 560px) {
      .sw-gate-card { padding: 32px 22px 28px; }
      .sw-gate-title { font-size: 1.3rem; }
      .sw-nda-scroll { height: 220px; }
      .sw-nda-sig { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(css);

  /* ── Build overlay ─────────────────────────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.id = 'sw-gate-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Site Access Gate');

  overlay.innerHTML = `
    <div class="sw-gate-card" id="sw-gate-card">

      <!-- Logo -->
      <div class="sw-gate-logo">
        <img src="${_logoSrc()}" alt="Saunders Wood Works" />
      </div>

      <!-- ── STEP 1: Password ── -->
      <div id="sw-step-pw">
        <p class="sw-gate-eyebrow">Private Presentation</p>
        <h1 class="sw-gate-title">Saunders Wood Works</h1>
        <p class="sw-gate-sub">This site contains proprietary strategy and pricing.<br>Enter your access code to continue.</p>

        <div class="sw-pw-wrap">
          <input
            id="sw-pw-input"
            class="sw-pw-input"
            type="password"
            placeholder="Access code"
            autocomplete="current-password"
            aria-label="Access code"
          />
          <button class="sw-btn" id="sw-pw-btn" onclick="swCheckPassword()">Continue</button>
          <p class="sw-err-msg" id="sw-pw-err" aria-live="polite"></p>
        </div>
      </div>

      <!-- ── STEP 2: NDA ── -->
      <div id="sw-step-nda" style="display:none">
        <p class="sw-gate-eyebrow">Before You Proceed</p>
        <h1 class="sw-gate-title">Confidentiality Agreement</h1>
        <p class="sw-gate-sub">Please read and acknowledge the terms below.</p>

        <div class="sw-nda-scroll" id="sw-nda-scroll" onscroll="swCheckScroll()">
          <h3>Non-Disclosure Agreement</h3>
          <p>This Non-Disclosure Agreement ("Agreement") is entered into as of the date acknowledged below, between <strong style="color:#fff">Hans Turner / Saunders Wood Works LLC</strong> ("Disclosing Party") and the individual accessing this presentation ("Receiving Party").</p>

          <h4>1. Purpose</h4>
          <p>The Disclosing Party is sharing proprietary business strategies, automation systems, pricing structures, and operational methodologies for the sole purpose of evaluating a potential or active professional engagement between the parties.</p>

          <h4>2. Confidential Information</h4>
          <p>"Confidential Information" includes all materials, strategies, workflows, pricing, technical implementations, automation logic, business plans, and any other non-public information shared through this platform — whether presented visually, in writing, or verbally in related communications.</p>

          <h4>3. Obligations of Receiving Party</h4>
          <p>The Receiving Party agrees to: (a) hold all Confidential Information in strict confidence; (b) not reproduce, distribute, or disclose any Confidential Information to third parties without prior written consent; (c) use Confidential Information solely in connection with the described project; and (d) take reasonable precautions to prevent unauthorized access or disclosure.</p>

          <h4>4. Mutual Respect</h4>
          <p>Both parties recognize that the strategies and ideas shared represent significant creative, technical, and professional investment. This Agreement is intended to protect those investments while enabling open, productive collaboration. Neither party shall use information learned through this engagement to compete with or undermine the other.</p>

          <h4>5. Exclusions</h4>
          <p>This Agreement does not apply to information that: (a) is or becomes publicly available through no fault of the Receiving Party; (b) was already known to the Receiving Party prior to disclosure; or (c) is independently developed by the Receiving Party without reference to the Confidential Information.</p>

          <h4>6. Term</h4>
          <p>This Agreement remains in effect for two (2) years from the date of acknowledgment, or until the relevant Confidential Information enters the public domain through legitimate means, whichever occurs first.</p>

          <h4>7. No Partnership</h4>
          <p>Nothing in this Agreement creates a partnership, joint venture, or employment relationship between the parties. Each party remains an independent party.</p>

          <h4>8. Remedies</h4>
          <p>The parties agree that a breach of this Agreement may cause irreparable harm for which monetary damages may be inadequate, and that injunctive or other equitable relief may be sought in addition to any other remedies available.</p>

          <h4>9. Governing Law</h4>
          <p>This Agreement is governed by applicable laws, without regard to conflict-of-law principles. Any disputes arising under this Agreement shall be resolved in good faith between the parties before pursuing formal legal remedies.</p>

          <!-- Pre-signed section -->
          <div class="sw-nda-sig">
            <div class="sw-sig-block">
              <span class="sw-sig-label">Signed — Disclosing Party</span>
              <span class="sw-sig-name">Hans Turner</span>
              <span class="sw-sig-sub">Founder, Saunders Wood Works LLC</span>
              <span class="sw-sig-sub">${SIGNED_DATE}</span>
            </div>
            <div class="sw-sig-block">
              <span class="sw-sig-label">Acknowledged — Receiving Party</span>
              <span class="sw-sig-you">Acknowledged digitally upon acceptance below</span>
            </div>
          </div>
        </div>

        <!-- Scroll hint -->
        <div class="sw-scroll-hint" id="sw-scroll-hint">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M3.5 8.5 7 12l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Scroll to the bottom to continue
        </div>

        <!-- Checkbox -->
        <label class="sw-check-row" id="sw-check-row" style="pointer-events:none;opacity:.38">
          <input type="checkbox" id="sw-nda-check" onchange="swCheckNda()" />
          <span class="sw-check-label">I have read and agree to the terms of this Non-Disclosure Agreement. I understand that the information on this site is confidential and proprietary.</span>
        </label>

        <button class="sw-btn" id="sw-nda-btn" disabled onclick="swGrantAccess()">Enter Site</button>
      </div>

    </div>
  `;

  /* ── Mount after DOM ready ─────────────────────────────────────────────── */
  const mount = () => {
    document.body.style.overflow = 'hidden';
    document.body.prepend(overlay);
    document.getElementById('sw-pw-input').focus();
    _bindEnterKey();
  };

  if (document.body) {
    mount();
  } else {
    document.addEventListener('DOMContentLoaded', mount);
  }

  /* ── Helpers ───────────────────────────────────────────────────────────── */
  function _logoSrc() {
    const path = location.pathname;
    const depth = (path.match(/\//g) || []).length;
    return depth <= 1 ? './logo.webp' : '../logo.webp';
  }

  function _bindEnterKey() {
    document.getElementById('sw-pw-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') swCheckPassword();
    });
  }

  /* ── Step 1: Password check ────────────────────────────────────────────── */
  window.swCheckPassword = function () {
    const input = document.getElementById('sw-pw-input');
    const err   = document.getElementById('sw-pw-err');

    if (input.value.trim() === PASSWORD) {
      document.getElementById('sw-step-pw').style.display  = 'none';
      document.getElementById('sw-step-nda').style.display = 'block';
    } else {
      input.classList.add('sw-error');
      err.textContent = 'Incorrect access code. Please try again.';
      input.value = '';
      input.focus();
      setTimeout(() => input.classList.remove('sw-error'), 500);
    }
  };

  /* ── Step 2: Scroll detection ──────────────────────────────────────────── */
  let _scrolledFull = false;

  window.swCheckScroll = function () {
    if (_scrolledFull) return;
    const el = document.getElementById('sw-nda-scroll');
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
    if (atBottom) {
      _scrolledFull = true;
      document.getElementById('sw-scroll-hint').classList.add('sw-done');
      const row = document.getElementById('sw-check-row');
      row.style.pointerEvents = '';
      row.style.opacity = '1';
      row.style.transition = 'opacity .3s';
    }
  };

  /* ── Step 2: Checkbox + enable button ──────────────────────────────────── */
  window.swCheckNda = function () {
    const checked = document.getElementById('sw-nda-check').checked;
    document.getElementById('sw-nda-btn').disabled = !checked;
  };

  /* ── Grant access ──────────────────────────────────────────────────────── */
  window.swGrantAccess = function () {
    localStorage.setItem(GATE_KEY, 'granted');
    const card = document.getElementById('sw-gate-card');
    card.style.transition = 'opacity .3s, transform .3s';
    card.style.opacity = '0';
    card.style.transform = 'translateY(-14px)';
    setTimeout(() => {
      overlay.style.transition = 'opacity .3s';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
      }, 320);
    }, 200);
  };

})();
