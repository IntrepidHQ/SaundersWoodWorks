# Database & Infrastructure — Supabase

_Last updated: 2026-04-17_

---

## Project

| Field | Value |
|---|---|
| Name | Saunders |
| URL | `https://usdenbguhahvzmufwvgo.supabase.co` |
| Publishable key | `sb_publishable_f8ZfnDA_obVBoqasd7G5Nw_iYkiQ7bJ` |
| Region | (Supabase default / us-east-1) |
| Client file | `utils/supabase/client.js` — exposes `window.SaundersDB` |
| Env file | `.env.local` — for future Next.js or server-side use |
| Migration | `supabase/migrations/001_saunders_initial.sql` |

---

## Tables

### `intake_submissions`

Stores each client intake form submission from `intake.html`.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `created_at` | `timestamptz` | Auto-set to `now()` |
| `client_name` | `text` | From `state.basics.name` |
| `client_email` | `text` | From `state.basics.email` |
| `project_type` | `text` | From `state.basics.projectType` |
| `target_date` | `text` | From `state.basics.targetDate` |
| `state_json` | `jsonb` | Full form state — see `06-intake-form.md` for shape |
| `appliance_packet_urls` | `jsonb` | Array of public Storage URLs |

RLS:
- **Insert**: open to publishable-key sessions (no login required for intake submit)
- **Select**: authenticated users only (Matt views submissions)

---

## Storage buckets

### `appliance-packets`

Stores manufacturer PDF spec sheets uploaded from the Appliance Packets section.

| Field | Value |
|---|---|
| Bucket ID | `appliance-packets` |
| Public | Yes |
| Path convention | `{client-name}/{timestamp}-{original-filename}.pdf` |
| Upload policy | Public insert (any bearer with publishable key) |
| Read policy | Public (anyone with the URL can download) |

---

## How uploads work (`intake.html`)

1. User drops or selects PDFs in the upload zone.
2. `uploadPacketFiles()` fires for each file.
3. Each file is `PUT` to `SaundersDB.storage.from('appliance-packets').upload(path, file)`.
4. On success, `getPublicUrl(path)` returns the CDN URL.
5. URL is pushed into `state.appliancePackets[]` and rendered in the packet list.
6. When the user clicks **Save to Saunders DB**, `state.appliancePackets` URLs are included in the `appliance_packet_urls` column of `intake_submissions`.

---

## Setup instructions (run once)

1. Open [Saunders SQL Editor](https://supabase.com/dashboard/project/usdenbguhahvzmufwvgo/sql/new).
2. Paste and run `supabase/migrations/001_saunders_initial.sql`.
3. Confirm `appliance-packets` bucket exists under **Storage**.

---

## Future schema additions

When new features are built, add a new migration file (`002_...sql`) and document the new tables or columns here.

| Planned | Trigger |
|---|---|
| `appliance_extractions` | Phase 2 — AI-extracted model numbers + cut-outs from PDF packets |
| `monday_sync_log` | Phase 2 — log of records pushed to Monday.com |
| `projects` | Phase 3 — normalised project records linking intake → Monday → QuickBooks |
