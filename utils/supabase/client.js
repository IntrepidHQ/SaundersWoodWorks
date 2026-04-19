/**
 * Saunders Wood Works — Supabase browser client
 *
 * Loaded after the Supabase CDN script. Exposes `window.SaundersDB` to all
 * page scripts. Uses the public publishable key (safe for browser use).
 *
 * Supabase project: https://usdenbguhahvzmufwvgo.supabase.co
 *
 * Required storage bucket (create once in Supabase dashboard):
 *   - Name: appliance-packets
 *   - Public: true (or restricted with RLS — public is fine for MVP)
 *
 * Required table (create once in Supabase dashboard):
 *   CREATE TABLE intake_submissions (
 *     id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *     created_at  timestamptz DEFAULT now(),
 *     client_name text,
 *     client_email text,
 *     project_type text,
 *     target_date  text,
 *     state_json   jsonb,
 *     appliance_packet_urls jsonb DEFAULT '[]'
 *   );
 */

(function () {
  const SUPABASE_URL = 'https://usdenbguhahvzmufwvgo.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_f8ZfnDA_obVBoqasd7G5Nw_iYkiQ7bJ';

  /** Used by utils/mapbox-address-autofill.js → Edge Function mapbox-geocode (MAPBOX_API secret). */
  window.SaundersSupabaseConfig = { url: SUPABASE_URL, anonKey: SUPABASE_KEY };

  if (!window.supabase) {
    console.warn('[SaundersDB] Supabase CDN not loaded. DB features disabled.');
    window.SaundersDB = null;
    return;
  }

  window.SaundersDB = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('[SaundersDB] Client ready →', SUPABASE_URL);
})();
