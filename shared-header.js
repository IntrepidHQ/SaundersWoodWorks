/**
 * Saunders Wood Works — Shared Site Header
 *
 * Drop this script immediately after <div id="site-header-root"></div>.
 * It injects the unified dark header with logo-icon crop, nav, and theme toggle.
 *
 * Page detection is automatic (checks pathname for "intake").
 * Override window.__SAUNDERS_NAV before loading this script for custom nav.
 */

(function () {

  /* ── Theme ───────────────────────────────────────────────────────────── */
  const THEME_KEY = 'saundersTheme';

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
  }

  window.applyTheme = function (t) {
    document.documentElement.setAttribute('data-theme', t);
    const icon  = document.getElementById('shdr-icon');
    const label = document.getElementById('shdr-label');
    if (icon)  icon.textContent  = t === 'dark' ? '☀️' : '🌙';
    if (label) label.textContent = t === 'dark' ? 'Light' : 'Dark';
    localStorage.setItem(THEME_KEY, t);
    // Fire custom event so index.html can update chart colours
    window.dispatchEvent(new CustomEvent('saundersThemeChange', { detail: t }));
  };

  window.toggleTheme = function () {
    window.applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
  };

  // Apply persisted theme immediately to avoid flash
  document.documentElement.setAttribute('data-theme', getTheme());

  /* ── Page detection ──────────────────────────────────────────────────── */
  const path      = location.pathname;
  const isIntake  = path.includes('intake');
  const isBrain   = path.includes('brain');
  const isMonday  = path.includes('monday');

  /* ── CSS ─────────────────────────────────────────────────────────────── */
  const styleEl = document.createElement('style');
  styleEl.textContent = `
  #site-header {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: #0a0a08;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 5%; height: 60px;
    border-bottom: 1px solid rgba(201,164,76,.18);
  }
  .shdr-left {
    display: flex; align-items: center; gap: 11px; text-decoration: none;
  }
  .shdr-logo-icon {
    width: 48px; height: 48px; overflow: hidden; flex-shrink: 0;
  }
  .shdr-logo-icon img {
    width: 48px; height: 48px;
    object-fit: contain; object-position: center top;
    transform: scale(1.7); transform-origin: center top;
    display: block;
  }
  .shdr-name {
    font-family: var(--font-display, "minerva-modern", Georgia, serif);
    font-size: .98rem; font-weight: 500;
    color: #fff; letter-spacing: .08em; text-transform: uppercase;
    text-decoration: none;
    white-space: nowrap;
  }
  .shdr-name span { color: #C9A44C; }
  #site-header nav {
    display: flex; align-items: center; gap: 26px;
  }
  #site-header nav a {
    color: rgba(255,255,255,.6); text-decoration: none;
    font-size: .81rem; font-weight: 500;
    letter-spacing: .09em; text-transform: uppercase;
    transition: color .2s;
    white-space: nowrap;
  }
  #site-header nav a:hover,
  #site-header nav a.shdr-active { color: #C9A44C; }
  .shdr-toggle {
    background: none; border: 1px solid rgba(201,164,76,.32);
    border-radius: 20px; padding: 5px 15px;
    color: rgba(255,255,255,.7);
    font-family: var(--font-display, "minerva-modern", Georgia, serif);
    font-size: .78rem; letter-spacing: .06em; text-transform: uppercase;
    cursor: pointer; transition: all .2s;
    display: flex; align-items: center; gap: 6px;
    flex-shrink: 0;
  }
  .shdr-toggle:hover { border-color: #C9A44C; color: #C9A44C; }
  @media (max-width: 860px) {
    #site-header nav a.shdr-hide-sm { display: none; }
  }
  @media (max-width: 560px) {
    #site-header { padding: 0 4%; }
    .shdr-name { display: none; }
    #site-header nav { gap: 14px; }
  }
  `;
  document.head.appendChild(styleEl);

  /* ── Render ──────────────────────────────────────────────────────────── */
  const root = document.getElementById('site-header-root');
  if (!root) return;

  const t = getTheme();
  const logoSrc = './logo.webp';

  const header = document.createElement('header');
  header.id = 'site-header';
  header.setAttribute('role', 'banner');

  header.innerHTML = `
    <a class="shdr-left" href="${(isIntake || isBrain || isMonday) ? 'index.html' : '#hero'}" aria-label="Saunders Wood Works home">
      <div class="shdr-logo-icon">
        <img src="${logoSrc}" alt="Saunders Wood Works icon" />
      </div>
      <span class="shdr-name">Saunders <span>Wood Works</span></span>
    </a>

    <nav aria-label="Site navigation">
      ${isIntake ? `
        <a href="monday.html">Boards</a>
        <a href="brain.html">Agent Brain</a>
        <a href="index.html">Strategy</a>
      ` : isBrain ? `
        <a href="monday.html">Boards</a>
        <a href="intake.html">Intake Form</a>
        <a href="index.html">Strategy</a>
      ` : isMonday ? `
        <a href="intake.html">Intake Form</a>
        <a href="brain.html">Agent Brain</a>
        <a href="index.html">Strategy</a>
      ` : `
        <a href="#problem" class="shdr-hide-sm">Problems</a>
        <a href="#solution" class="shdr-hide-sm">Solution</a>
        <a href="#investment" class="shdr-hide-sm">Investment</a>
        <a href="#invoice-document" class="shdr-hide-sm">Invoice</a>
        <a href="monday.html" class="shdr-hide-sm">Boards</a>
        <a href="brain.html" class="shdr-hide-sm">Brain</a>
        <a href="intake.html">Intake</a>
      `}
    </nav>

    <button class="shdr-toggle" onclick="toggleTheme()" aria-label="Toggle colour theme">
      <span id="shdr-icon">${t === 'dark' ? '☀️' : '🌙'}</span>
      <span id="shdr-label">${t === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  `;

  root.replaceWith(header);

})();
