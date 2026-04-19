/**
 * Optional fallback: Mapbox public token for local / offline dev when the Supabase
 * Edge Function `mapbox-geocode` is not deployed.
 *
 * Production: store the key only as Supabase secret MAPBOX_API (Dashboard → Edge Functions → Secrets)
 * and deploy: `supabase functions deploy mapbox-geocode`
 */
window.__MAPBOX_ACCESS_TOKEN = window.__MAPBOX_ACCESS_TOKEN || '';
