/**
 * Mapbox Geocoding API — address autocomplete for plain HTML inputs.
 *
 * Preferred: Supabase Edge Function `mapbox-geocode` (secret MAPBOX_API on the project).
 *   Requires window.SaundersSupabaseConfig from utils/supabase/client.js
 * Fallback: direct Geocoding from the browser using window.__MAPBOX_ACCESS_TOKEN (mapbox-config.js).
 *
 * API: https://docs.mapbox.com/api/search/geocoding/
 */
(function (global) {
  'use strict';

  const DEBOUNCE_MS = 280;
  const MIN_CHARS = 3;
  /** Charleston / Lowcountry bias when using the Edge proxy (Mapbox `ip` would be the server, not the user). */
  const PROXY_DEFAULT_PROXIMITY = '-79.9311,32.7765';

  function normalizeToken(t) {
    if (t == null || typeof t !== 'string') return '';
    return t.trim();
  }

  function getSupabaseProxyUrl() {
    const c = global.SaundersSupabaseConfig;
    if (!c || !c.url || !c.anonKey) return '';
    return `${String(c.url).replace(/\/$/, '')}/functions/v1/mapbox-geocode`;
  }

  function resolveProximity(opts, useProxy) {
    if (opts.proximity === false) return null;
    if (opts.proximity && opts.proximity !== 'ip') return opts.proximity;
    if (useProxy) return opts.proximity === 'ip' ? PROXY_DEFAULT_PROXIMITY : (opts.proximity || PROXY_DEFAULT_PROXIMITY);
    return opts.proximity || 'ip';
  }

  function buildProxyUrl(query, proxyBase, opts) {
    const u = new URL(proxyBase);
    u.searchParams.set('q', query.trim());
    u.searchParams.set('limit', String(opts.limit || 6));
    u.searchParams.set('types', opts.types || 'address');
    if (opts.country != null && opts.country !== '') {
      u.searchParams.set('country', opts.country);
    }
    const prox = resolveProximity(opts, true);
    if (prox) u.searchParams.set('proximity', prox);
    return u.toString();
  }

  function buildUrl(query, token, opts) {
    const path = encodeURIComponent(query.trim());
    const u = new URL(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${path}.json`
    );
    u.searchParams.set('access_token', token);
    u.searchParams.set('autocomplete', 'true');
    u.searchParams.set('limit', String(opts.limit || 6));
    u.searchParams.set('types', opts.types || 'address');
    if (opts.country != null && opts.country !== '') {
      u.searchParams.set('country', opts.country);
    }
    const prox = resolveProximity(opts, false);
    if (prox) u.searchParams.set('proximity', prox);
    return u.toString();
  }

  function ensureLabelClass(input) {
    const label = input.closest('label');
    if (label) label.classList.add('field--mapbox-address');
    return label || input.parentElement;
  }

  function createListbox() {
    const el = document.createElement('div');
    el.className = 'mapbox-address-suggestions';
    el.setAttribute('role', 'listbox');
    el.id = 'mapbox-address-suggestions-' + Math.random().toString(36).slice(2);
    el.hidden = true;
    return el;
  }

  /**
   * @param {object} opts
   * @param {string} [opts.token] — Mapbox pk token for direct mode (else window.__MAPBOX_ACCESS_TOKEN)
   * @param {boolean} [opts.useSupabaseProxy=true] — use Edge Function mapbox-geocode when SaundersSupabaseConfig exists
   * @param {string} [opts.inputSelector='[data-state="basics.address"]']
   * @param {string} [opts.country='US'] — ISO 3166-1 alpha-2; set '' to disable
   * @param {string} [opts.proximity='ip'] — bias results (omit by passing false); behind proxy defaults to Lowcountry coords
   * @param {function(string):void} [opts.onApply] — called with place_name; default sets input + input event
   */
  function initMapboxAddressAutofill(opts) {
    opts = opts || {};
    const useProxy =
      opts.useSupabaseProxy !== false && !!getSupabaseProxyUrl();
    const token =
      normalizeToken(opts.token) || normalizeToken(global.__MAPBOX_ACCESS_TOKEN);
    const selector = opts.inputSelector || '[data-state="basics.address"]';
    const input = document.querySelector(selector);
    if (!input) return;

    const anchor = ensureLabelClass(input);
    if (!anchor) return;

    if (!useProxy && !token) {
      const hint = document.createElement('p');
      hint.className = 'mapbox-address-hint';
      hint.innerHTML =
        'Address suggestions need the Mapbox key from Supabase secrets (<code>MAPBOX_API</code>) via the <code>mapbox-geocode</code> Edge Function, or a public token in <code>mapbox-config.js</code> for local dev. See <a href="https://supabase.com/docs/guides/functions/secrets" target="_blank" rel="noopener">Supabase secrets</a>.';
      anchor.appendChild(hint);
      return;
    }

    const listbox = createListbox();
    anchor.appendChild(listbox);

    const listId = listbox.id;
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', listId);
    input.setAttribute('aria-expanded', 'false');

    let debounceTimer = null;
    let abortCtrl = null;
    let activeIndex = -1;
    let lastFeatures = [];

    const closeList = () => {
      listbox.hidden = true;
      listbox.innerHTML = '';
      activeIndex = -1;
      lastFeatures = [];
      input.setAttribute('aria-expanded', 'false');
    };

    const applyPlaceName = (placeName) => {
      if (opts.onApply) {
        opts.onApply(placeName);
        return;
      }
      input.value = placeName;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const renderSuggestions = (features) => {
      lastFeatures = features;
      listbox.innerHTML = '';
      activeIndex = -1;
      if (!features.length) {
        closeList();
        return;
      }

      features.forEach((f, i) => {
        const opt = document.createElement('button');
        opt.type = 'button';
        opt.className = 'mapbox-address-suggestion';
        opt.setAttribute('role', 'option');
        opt.setAttribute('id', `${listId}-opt-${i}`);
        opt.textContent = f.place_name || '';
        opt.addEventListener('mousedown', (e) => {
          e.preventDefault();
          applyPlaceName(f.place_name);
          closeList();
          input.focus();
        });
        listbox.appendChild(opt);
      });

      listbox.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    };

    const runFetch = async (q) => {
      if (abortCtrl) abortCtrl.abort();
      abortCtrl = new AbortController();
      const geoOpts = {
        limit: opts.limit,
        types: opts.types,
        country: opts.country === undefined ? 'US' : opts.country,
        proximity: opts.proximity,
      };
      let url;
      const headers = {};
      if (useProxy) {
        const base = getSupabaseProxyUrl();
        url = buildProxyUrl(q, base, geoOpts);
        const c = global.SaundersSupabaseConfig;
        headers.Authorization = `Bearer ${c.anonKey}`;
        headers.apikey = c.anonKey;
      } else {
        url = buildUrl(q, token, geoOpts);
      }
      try {
        const res = await fetch(url, { signal: abortCtrl.signal, headers });
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        const features = Array.isArray(data.features) ? data.features : [];
        renderSuggestions(features);
      } catch (e) {
        if (e.name === 'AbortError') return;
        console.warn('[Mapbox]', e);
        closeList();
      }
    };

    input.addEventListener('input', () => {
      const q = input.value;
      clearTimeout(debounceTimer);
      if (q.length < MIN_CHARS) {
        closeList();
        return;
      }
      debounceTimer = setTimeout(() => runFetch(q), DEBOUNCE_MS);
    });

    input.addEventListener('keydown', (e) => {
      if (listbox.hidden || !lastFeatures.length) {
        if (e.key === 'Escape') closeList();
        return;
      }

      const optsBtns = listbox.querySelectorAll('.mapbox-address-suggestion');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, optsBtns.length - 1);
        optsBtns.forEach((b, i) => {
          b.classList.toggle('is-active', i === activeIndex);
          b.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        optsBtns.forEach((b, i) => {
          b.classList.toggle('is-active', i === activeIndex);
          b.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
        });
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        const f = lastFeatures[activeIndex];
        if (f) {
          applyPlaceName(f.place_name);
          closeList();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeList();
      }
    });

    input.addEventListener('blur', () => {
      setTimeout(closeList, 180);
    });

    document.addEventListener('click', (ev) => {
      if (!anchor.contains(ev.target)) closeList();
    });
  }

  global.initMapboxAddressAutofill = initMapboxAddressAutofill;
})(typeof window !== 'undefined' ? window : this);
