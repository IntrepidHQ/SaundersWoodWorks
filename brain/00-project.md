# Project Overview

## The client

**Saunders Wood Works LLC** — Mount Pleasant, SC. High-end custom cabinetry, built-ins, kitchens, wine rooms, and fine woodworking for residential and boutique commercial jobs.

- **Owner / primary contact:** Matt Price
- **Billing address:** 859 Coleman Blvd, Mount Pleasant, SC 29464
- **Tech baseline:** QuickBooks Online (already in use). No current Monday.com, no AI tooling, no structured intake process. Email + phone + memory.

## The operating pains (why we were hired)

1. **No real-time project visibility.** Nothing surfaces which projects are on track, behind schedule, or burning margin until it's too late.
2. **Linear-foot pricing leaks margin.** Flat LF rates don't account for hardware, finish complexity, or design time. High-end hardware silently erases profit.
3. **Appliance packets derail design.** PDFs arrive mid-project; model numbers and cut-out specs get hunted manually. Designer waits.
4. **Builder time isn't tied to profitability.** Most-worked project may not be the most profitable. Best crew hours can disappear on small jobs.
5. **No daily operating system.** No structured morning view of risks, idle crew, pending quotes.
6. **Communication runs on memory.** Email threads, verbal updates, missed follow-ups.

## What we're building (the solution)

Monday.com as the system of record, with four automation layers:

1. **Monday.com Pro workspace** — 4 boards: Customers CRM, Projects (with Gantt + health score), Leads & Intake, CEO Command Center dashboard.
2. **n8n workflows** — QuickBooks milestone invoicing, Gmail draft assistant, Otter action-item capture. Human approval gates on money + measurements.
3. **Appliance Extractor (custom app)** — Upload PDF appliance packet → AI pulls model numbers + cut-out W/H/D → emails Matt + designer for review before AutoCAD.
4. **Email Draft Assistant** — Incoming client emails matched to the right Monday project; context-aware reply drafts appear in Gmail for one-tap approval.

## Build phases & pricing

| Phase | Scope | Price | Timeline |
|---|---|---|---|
| Phase 1 | Operations system implementation (Monday Pro, health score, CRM, intake form v1, n8n automations, training & 30-day support) | $6,000 | 20 working days |
| Phase 2 | Appliance extractor + email assistant + meeting intelligence | $4,500 | Follow-on |
| Phase 3 | Custom dashboard layer (Supabase-backed) | TBD | Growth-triggered |

**Ongoing monthly run rate:** ~$535/mo  (Monday Pro, Otter.ai, n8n, Supabase, Claude API usage)

## Current deliverables (live in this repo)

| File | Purpose |
|---|---|
| `index.html` | Client-facing proposal site — animated hero, scrolling pitch, interactive invoice desk |
| `intake.html` | Client intake form v1 — dimensions, Decore door/finish/hardware selection, appliance PDF upload, Supabase save |
| `shared-header.js` | Shared fixed site header (logo, nav, theme toggle) used by both HTML files |
| `utils/supabase/client.js` | Browser Supabase client (`window.SaundersDB`) — Saunders project at `usdenbguhahvzmufwvgo.supabase.co` |
| `supabase/migrations/001_saunders_initial.sql` | DB schema — `intake_submissions` table + `appliance-packets` storage bucket |
| `brain/` | This agent-context folder (you are here) |

## Scope rules

- **Do not** add features outside the 4 automation layers without Matt's approval.
- **Do not** swap suppliers. Decore.com is primary; the secondary is named in `01-suppliers.md`.
- **Do not** invent prices for materials — all pricing is either Decore-quoted or entered manually on the intake form.
- **All user-facing copy** must match the tone of the existing proposal site: confident, specific, quiet, no marketing fluff.
