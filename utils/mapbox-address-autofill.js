/**
 * Mapbox Geocoding — address autocomplete for plain HTML inputs.
 *
 * Primary: Supabase Edge Function `mapbox-geocode` (secret MAPBOX_API).
 *   Deploy: supabase functions deploy mapbox-geocode --project-ref YOUR_REF
 * Fallback: direct browser calls with window.__MAPBOX_ACCESS_TOKEN (mapbox-config.js)
 *   when the function is missing (404) or fails.
 *
 * API: https://docs.mapbox.com/api/search/geocoding/
 */
(function (global) {
  'use strict';

  const DEBOUNCE_MS = 280;
  const MIN_CHARS = 3;
  /** Lowcountry bias when using the Edge proxy (Mapbox `ip` would be the server). */
  const PROXY_DEFAULT_PROXIMITY = '-79.9311,32.7765';
  /** Wider than `address` alone so partial queries still return useful rows. */
  const DEFAULT_TYPES = 'address,place,locality,postcode';

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
    if (useProxy) {
      return opts.proximity === 'ip'
        ? PROXY_DEFAULT_PROXIMITY
        : (opts.proximity || PROXY_DEFAULT_PROXIMITY);
    }
    return opts.proximity || 'ip';
  }

  function buildUrl(query, token, opts) {
    const path = encodeURIComponent(query.trim());
    const u = new URL(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${path}.json`
    );
    u.searchParams.set('access_token', token);
    u.searchParams.set('autocomplete', 'true');
    u.searchParams.set('limit', String(opts.limit || 6));
    u.searchParams.set('types', opts.types || DEFAULT_TYPES);
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

  function buildProxyBody(q, geoOpts, useProxy) {
    const prox = resolveProximity(geoOpts, useProxy);
    const body = {
      q: q.trim(),
      limit: Number(geoOpts.limit) || 6,
      types: geoOpts.types || DEFAULT_TYPES,
    };
    if (geoOpts.country != null && geoOpts.country !== '') {
      body.country = geoOpts.country;
    }
    if (prox) body.proximity = prox;
    return body;
  }

  /**
   * @param {object} opts
   * @param {string} [opts.token] — Mapbox pk token for direct fallback
   * @param {boolean} [opts.useSupabaseProxy=true]
   * @param {string} [opts.inputSelector]
   * @param {string} [opts.country='US'] — set '' to omit
   * @param {string|false} [opts.proximity]
   * @param {function(string):void} [opts.onApply]
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
        'Address search needs the <code>mapbox-geocode</code> Edge Function deployed (uses Supabase secret <code>MAPBOX_API</code>) or a public token in <code>mapbox-config.js</code>.';
      anchor.appendChild(hint);
      return;
    }

    const listbox = createListbox();
    anchor.appendChild(listbox);

    let statusEl = anchor.querySelector('.mapbox-address-status');
    if (!statusEl) {
      statusEl = document.createElement('p');
      statusEl.className = 'mapbox-address-status mapbox-address-hint';
      statusEl.setAttribute('role', 'status');
      statusEl.setAttribute('aria-live', 'polite');
      statusEl.hidden = true;
      anchor.appendChild(statusEl);
    }

    const listId = listbox.id;
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', listId);
    input.setAttribute('aria-expanded', 'false');

    let debounceTimer = null;
    let abortCtrl = null;
    let activeIndex = -1;
    let lastFeatures = [];

    const setStatus = (msg, show) => {
      if (!statusEl) return;
      statusEl.textContent = msg || '';
      statusEl.hidden = !show;
    };

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

    const fetchDirect = async (q, geoOpts, signal) => {
      if (!token) return null;
      const url = buildUrl(q, token, geoOpts);
      const res = await fetch(url, { signal });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.warn('[Mapbox] direct geocode', res.status, data);
        return null;
      }
      return data;
    };

    const fetchProxy = async (q, geoOpts, signal) => {
      const c = global.SaundersSupabaseConfig;
      const url = getSupabaseProxyUrl();
      const body = buildProxyBody(q, geoOpts, true);

      const db = global.SaundersDB;
      if (db && typeof db.functions.invoke === 'function') {
        try {
          const { data, error } = await db.functions.invoke('mapbox-geocode', {
            body,
          });
          if (
            !error &&
            data &&
            typeof data === 'object' &&
            Array.isArray(data.features)
          ) {
            return data;
          }
        } catch (err) {
          console.warn('[Mapbox] functions.invoke', err);
        }
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${c.anonKey}`,
          apikey: c.anonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal,
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 404 || data.code === 'NOT_FOUND') {
        return { __proxyMissing: true, data };
      }
      if (!res.ok) {
        console.warn('[Mapbox] Edge Function', res.status, data);
        return { __error: true, data };
      }
      return data;
    };

    const runFetch = async (q) => {
      if (abortCtrl) abortCtrl.abort();
      abortCtrl = new AbortController();
      const signal = abortCtrl.signal;

      const geoOpts = {
        limit: opts.limit,
        types: opts.types || DEFAULT_TYPES,
        country: opts.country === undefined ? 'US' : opts.country,
        proximity: opts.proximity,
      };

      setStatus('', false);

      try {
        let data = null;

        if (useProxy) {
          data = await fetchProxy(q, geoOpts, signal);
          if (data && data.__proxyMissing) {
            if (token) {
              setStatus('Using browser Mapbox token (Edge Function not deployed).', true);
            } else {
              setStatus(
                'Deploy Edge Function mapbox-geocode, or add a pk token to mapbox-config.js.',
                true
              );
            }
            data = await fetchDirect(q, geoOpts, signal);
          } else if (data && data.__error) {
            data = await fetchDirect(q, geoOpts, signal);
          }
        } else {
          data = await fetchDirect(q, geoOpts, signal);
        }

        if (!data || signal.aborted) {
          closeList();
          return;
        }

        const features = Array.isArray(data.features) ? data.features : [];
        if (features.length) setStatus('', false);
        else if (useProxy && !token) {
          setStatus(
            'No suggestions. Deploy mapbox-geocode + MAPBOX_API secret, or add token to mapbox-config.js.',
            true
          );
        }
        renderSuggestions(features);
      } catch (e) {
        if (e.name === 'AbortError') return;
        console.warn('[Mapbox]', e);
        const direct = await fetchDirect(q, geoOpts, signal);
        if (direct && Array.isArray(direct.features)) {
          renderSuggestions(direct.features);
        } else {
          closeList();
          setStatus('Address lookup failed. Check MAPBOX_API secret and that the function is deployed.', true);
        }
      }
    };

    input.addEventListener('input', () => {
      const q = input.value;
      clearTimeout(debounceTimer);
      if (q.length < MIN_CHARS) {
        closeList();
        setStatus('', false);
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
      setTimeout(closeList, 260);
    });

    document.addEventListener('click', (ev) => {
      if (!anchor.contains(ev.target)) closeList();
    });
  }

  global.initMapboxAddressAutofill = initMapboxAddressAutofill;
})(typeof window !== 'undefined' ? window : this);
