# Intake Form — `intake.html`

_Last updated: 2026-04-17_

Version 1 of Matt's client-intake tool. First deliverable of the Monday Automation Strategy.

---

## Purpose

A single, shareable, link-based form that lets Matt collect everything he needs to price a job — project vision, dimensions, Decore door/finish/hardware selection, materials, appliance packets, and budget tolerances — in one sitting, replacing email back-and-forth. Submissions save directly to the Saunders Supabase database.

---

## Current section architecture (v1)

```
intake.html
├── Supabase CDN + utils/supabase/client.js (SaundersDB)
├── shared-header.js (fixed nav bar, shared with index.html)
├── V1 banner — "Intake Form · Deliverable · V1" callout
├── 1. Project Basics
│      name, email, phone, address, project type, target date, vision, site notes
├── 2. Dimensions
│      Component table (L × W × H × D per piece), unit toggle in/ft
│      Seeds: Island · Lower Cabinets · Upper Cabinets
├── 3. Doors & Drawer Fronts  [Decore]
│      Style (model code), type (S/DF/Special/Bore), qty, W, H, finish, sheen, quoted $
│      Order-level spec panel: panel detail, edge details, bore pattern/position, grain, ship method
│      Special instructions textarea
├── 4. Materials  [Saunders-sourced]
│      Hardwood lumber, sheet goods, deck & outdoor, shop finishes
│      Market vs. quoted price delta tracking
├── 5. Hardware  [Decore / Salice]
│      Salice glides (Undermount / Side-mount, all sizes), hinges (7802/7821/7111)
│      Decore pulls (7275/7185/1691), fasteners, specialty
├── 6. Drawer Boxes  [Decore]
│      Models 659 (dovetail ply) · 649 (doweled ply) · 613 (dovetail solid maple)
│      W × D × H per box, qty, quoted $
├── 7. Budget Controls
│      Target $, labor $, contingency %, wiggle threshold, project tolerance %, drops toggle
├── 8. Appliance Packets  ← Supabase Storage
│      Drag-and-drop PDF upload zone
│      Uploads to bucket: appliance-packets/{client-name}/{timestamp}-{filename}.pdf
│      Shows linked list of uploaded files with remove button
├── 9. Save & Share
│      "Save to Saunders DB" → intake_submissions table (returns record ID)
│      Print / Save as PDF
│      Export JSON · Import JSON · Reset
└── Sticky footer — live totals: Doors+Boxes (Decore) · Materials · Hardware · Grand Total · Status pill
```

---

## Supabase integration

| Resource | Details |
|---|---|
| Project | Saunders — `https://usdenbguhahvzmufwvgo.supabase.co` |
| Client | `window.SaundersDB` (initialized by `utils/supabase/client.js`) |
| Storage bucket | `appliance-packets` (public) |
| Table | `intake_submissions` — see `09-database.md` for full schema |
| Auth | No login required for intake. Anonymous insert RLS policy. |

Migration SQL: `supabase/migrations/001_saunders_initial.sql`

---

## In-page JS catalogs

All catalog constants are defined at the top of the `<script>` block. When a product changes in Decore's line, update **both** the relevant `brain/` doc and the matching constant here.

| Constant | Source of truth |
|---|---|
| `DECORE_DOORS` | `brain/02-decore-doors.md` + `brain/products.json#/doors` |
| `DECORE_FINISHES` | `brain/03-decore-finishes.md` + `brain/products.json#/finishes` |
| `DRAWER_BOX_CATALOG` | `brain/04-decore-hardware.md` + `brain/products.json#/drawerBoxes` |
| `HARDWARE_CATALOG` | `brain/04-decore-hardware.md` + `brain/products.json#/hardware` |
| `PRICE_CATALOG` | Saunders shop prices — no Decore source; update manually or via future live feed |

---

## State shape

The full form state is a single JS object persisted to localStorage and saved as `state_json` in Supabase:

```json
{
  "basics":    { "name", "email", "phone", "address", "projectType", "targetDate", "narrative", "siteNotes" },
  "dims":      { "unit": "in" },
  "components":   [{ "id", "label", "L", "W", "H", "D", "notes" }],
  "doors":        [{ "id", "componentId", "styleKey", "type", "qty", "width", "height", "finish", "sheen", "unitPrice" }],
  "drawerBoxes":  [{ "id", "componentId", "modelKey", "width", "depth", "height", "qty", "unitPrice" }],
  "materials":    [{ "id", "componentId", "materialKey", "qty", "L", "W", "H", "quotedPrice" }],
  "hardware":     [{ "id", "category", "itemKey", "variant", "qty", "unitPrice" }],
  "decoreSpec": { "panelDetail", "insideEdge", "outsideFaceEdge", "outsideBackEdge", "borePattern", "borePosition", "dfGrain", "shipping", "shipDate", "notes" },
  "appliancePackets": [{ "name", "url", "uploadedAt" }],
  "budget":     { "target", "labor", "contingencyPct", "wigglePct", "projectTolerancePct", "showDrops" }
}
```

---

## Roadmap

| Version | Scope |
|---|---|
| **v1** (current) | Self-contained form, Supabase save, appliance PDF upload |
| **v2** | POST to Monday.com — auto-creates Lead → Project record |
| **v3** | Conversational mode — type "12 Shaker maple, 18×30, Smoky Blue satin" → form fills itself |
| **v4** | Auto-submit to Decore — generate pre-filled order form PDF, Matt approves in one click |
