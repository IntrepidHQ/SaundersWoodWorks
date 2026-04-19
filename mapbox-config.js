/**
 * Optional fallback: Mapbox public token (pk.…) when the Edge Function is not deployed yet.
 *
 * Production: secret MAPBOX_API + deploy the Edge Function. If `supabase functions deploy` returns
 * 403 "necessary privileges", that is a Supabase account/role or PAT issue — see
 *   supabase/DEPLOY_MAPBOX_GEOCODE.md
 *
 * Typical deploy (after PAT + Owner/Admin access):
 *   export SUPABASE_ACCESS_TOKEN="sbp_…"   # Dashboard → Account → Access Tokens
 *   supabase secrets set MAPBOX_API=pk.your_mapbox_token
 *   supabase functions deploy mapbox-geocode --project-ref usdenbguhahvzmufwvgo
 *
 * Until deploy works, set your Mapbox pk token below so intake autocomplete still works.
 */
window.__MAPBOX_ACCESS_TOKEN = window.__MAPBOX_ACCESS_TOKEN || '';
