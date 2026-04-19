# Deploy `mapbox-geocode` when the CLI returns 403

The error:

```text
unexpected list functions status 403: {"message":"Your account does not have the necessary privileges to access this endpoint..."}
```

comes from **Supabase’s Management API** (used by `supabase functions deploy`), **not** from your Mapbox secret. `MAPBOX_API` in Edge Function secrets only applies **after** the function is deployed.

## 1. Use a Personal Access Token (PAT)

Browser login (`supabase login`) sometimes does not have the same API rights as a PAT.

1. Open [Account → Access Tokens](https://supabase.com/dashboard/account/tokens) and create a token.
2. In the same terminal session:

```bash
export SUPABASE_ACCESS_TOKEN="paste_token_here"
supabase functions deploy mapbox-geocode --project-ref usdenbguhahvzmufwvgo
```

(Optional) Skip `--project-ref` if you already ran `supabase link` in this repo:

```bash
supabase link --project-ref usdenbguhahvzmufwvgo
supabase functions deploy mapbox-geocode
```

## 2. Check your role on the project

In the dashboard: **Organization → Team** (or the project’s members). Deploying Edge Functions requires **Owner** or **Administrator** on that project (or org-wide equivalent). A **Developer** role often cannot call the deploy API, which produces this 403.

If you are not Owner/Admin, ask whoever owns the Saunders project to either deploy once or promote your role.

## 3. If you are Owner and it still 403

There is an [open CLI issue](https://github.com/supabase/cli/issues/4802) where deploy still returns 403 for some accounts. Try:

- Latest CLI: `brew upgrade supabase`
- Deploy with debug: `supabase functions deploy mapbox-geocode --project-ref usdenbguhahvzmufwvgo --debug`
- Or deploy from **CI** using `SUPABASE_ACCESS_TOKEN` (PAT from an Owner), as in [Supabase deploy docs](https://supabase.com/docs/guides/functions/deploy#cicd-deployment).

If it persists, contact Supabase support with the debug log.

## 4. Until deploy works: browser Mapbox token

The intake form already falls back to **`mapbox-config.js`** → `window.__MAPBOX_ACCESS_TOKEN` with your public **`pk.`** Mapbox token so address search works without Edge Functions. In the Mapbox dashboard, restrict that token by **URL** (your site only) to limit abuse.

After a successful deploy, set the same value in secrets (no `pk.` in the repo if you prefer):

```bash
supabase secrets set MAPBOX_API=pk.your_token_here
```
