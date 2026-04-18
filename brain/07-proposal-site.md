# Proposal Site — `index.html`

_Last updated: 2026-04-17_

The client-facing pitch site Matt receives. Single HTML file with inline CSS + JS, augmented by two shared scripts. Dark editorial design with animated hero, scrolling sections, and an interactive invoice "desk" scene.

---

## Shared scripts (loaded by both HTML files)

| File | Role |
|---|---|
| `shared-header.js` | Renders the fixed site header (logo-icon crop, nav, theme toggle). Both `index.html` and `intake.html` use this. Any changes to the header happen here only. |
| `utils/supabase/client.js` | Browser Supabase client (`window.SaundersDB`). Not needed by `index.html` today, but present for future use. |

---

## Sections (in order)

| # | Section | Purpose |
|---|---|---|
| Hero | Saunders Wood Works — Monday Automation Strategy | Positioning + CTA + masonry of three hero photos |
| 01 | The Problem | Six pain-point cards matching `00-project.md` operating pains |
| 02 | The Solution | Architecture grid — 6 cards, Monday + n8n + AI layers |
| 03 | Project Intelligence | Health-score explainer |
| 04 | Monday Workspace | 4-board preview (Projects / Customers / Intake / Automations) |
| 05 | Matt's Daily Loop | 15-min morning checklist + CEO Command Center mock |
| 06 | AI Automations | Four n8n workflows with human-approval gates |
| 07 | Build Timeline | 20-working-day Gantt + phase detail cards |
| 08 | Investment | Three-phase pricing ($6K / $4.5K / TBD) |
| 09 | Monthly Run Costs | Vendor table — Monday, Otter, n8n, Supabase, Claude (~$535/mo) |
| 10 | What You Get | Outcome cards (RPH, 15m, 0, 30s, 100%, ∞) |
| CTA | Ready? | Link to `intake.html` |
| Invoice | Phase-1 invoice "on a desk" | Interactive front/back paper sheets, switchable wood texture, print→PDF |

---

## Visual system

- **Palette**: sage `hsl(88, 12%, 24%)`, ivory `#F5F1E8`, gold `#C9A44C`
- **Display font**: `minerva-modern` (Typekit — project `syk8hlp`)
- **Body font**: `degular` (Typekit)
- **Hero photos**: three `.webp` screenshots in repo root, displayed as a masonry with continuous micro-float animations (`float1/2/3` keyframes, `hm-1/2/3` classes)
- **Scroll animations**: `.reveal`, `.reveal-left`, `.reveal-right`, `.reveal-scale` — all gated by a single `IntersectionObserver`
- **Number counters**: `.hs-num` (hero stats) and `.out-num` (outcome cards) count up from 0 on entry
- **`prefers-reduced-motion`** respected — disables all animations

---

## Header (shared)

The site header is rendered by `shared-header.js`, which:
- Detects the current page (`index.html` vs `intake.html`) and renders the correct nav
- Handles dark/light theme toggle — fires `saundersThemeChange` custom event
- `index.html` listens for `saundersThemeChange` to recolour the revenue chart
- Theme persisted to `localStorage` key `saundersTheme`

Do **not** hardcode header HTML or CSS directly in either file — edit `shared-header.js` only.

---

## Footer

Always-dark bar matching the header. Logo uses the same cropped-icon treatment as the header (`.logo-icon` overflow trick, `scale(1.7)`).

---

## Invoice scene

- Full-viewport top-down wood surface background with three switchable textures (ash / ebony / oak), persisted to `localStorage` under `saundersWood`. Default: ebony.
- Two paper sheets at 8.5×11 ratio: **Phase 1 Invoice** (front) and **Monthly Subscriptions** (back).
- Clicking the back sheet animates it to the front.
- Both sheets are fully static (non-editable) — content pre-filled:
  - **Bill to:** Matt Price, Saunders Wood Works LLC, 859 Coleman Blvd, Mount Pleasant SC 29464
  - **Remit to:** Hans Turner, 1651 Eldora Ln. STE 310, Mount Pleasant SC 29464 (Check / Wire)
  - **Invoice #:** SWW-OPS-P1 · **Date:** Apr 17, 2026 · **Terms:** Net-15 · 50/50 · **Amount:** $6,000
- `window.print()` produces clean white paper — `@media print` hides all decoration.

---

## Asset inventory

| File | Role |
|---|---|
| `logo.webp` | Icon + wordmark lockup; header and footer both crop to the icon only |
| `Screenshot+2026-02-21+103001 (1).webp` | Hero mason `hm-1` — tall portrait |
| `Screenshot+2026-02-21+102611 (1).webp` | Hero mason `hm-2` — wide landscape |
| `Screenshot+2026-02-21+103229.webp` | Hero mason `hm-3` — landscape |

---

## Tech decisions

- **No build step.** Single-file HTML + two lightweight shared scripts. Matt can host anywhere (Netlify, S3, a shared drive, email attachment).
- **No framework.** Plain DOM + one `IntersectionObserver`. Keeps the file directly auditable.
- **Print styles are first-class** — the invoice section must export to PDF without any decoration bleeding through.
- **Copy tone**: confident, specific, quiet. No "we" language. Never "seamless" or "empower".
