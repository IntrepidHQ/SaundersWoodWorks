# Saunders Wood Works — Agent Brain

> **Single source of truth for any AI agent or human collaborator working on the Saunders Wood Works project.** Start here. Read the files you need. Keep this folder updated after every substantive decision.

---

## What is this folder?

`brain/` is the project's context vault. It holds everything a fresh agent needs to:

1. Understand the business and the client (Matt Price, Saunders Wood Works LLC, Mount Pleasant SC).
2. Answer product questions by model number or name — Decore.com door styles, finishes, hardware — without guessing.
3. Know what has been built, what is planned next, and why every decision was made.
4. Stay aligned across sessions, models, and collaborators.

If anything drifts out of date, update the relevant file and add a line to `CHANGELOG.md`.

---

## File index

| File | Category | Purpose | When to read |
|---|---|---|---|
| `README.md` | Meta | You are here. Index + agent protocol. | Always first. |
| `00-project.md` | Business | Client, operating pains, solution, pricing, deliverables | Any project work. |
| `01-suppliers.md` | Business | Decore.com contacts + secondary supplier (TBD) | Sourcing / intake Q. |
| `02-decore-doors.md` | Products | Every door & drawer-front style with model codes | "What is the 520X?" |
| `03-decore-finishes.md` | Products | SW paint codes, stains, primers, sheens | Finish selection. |
| `04-decore-hardware.md` | Products | Salice glides/hinges/pulls + Decore drawer boxes | Hardware Q. |
| `05-decore-order-form.md` | Process | Decore order-form field spec + JSON contract | Before submitting orders. |
| `06-intake-form.md` | Process | `intake.html` architecture, sections, Supabase flow | Editing the intake tool. |
| `07-proposal-site.md` | Process | `index.html` sections, shared scripts, assets | Editing the proposal site. |
| `08-agent-playbook.md` | Process | How to answer product Q&A conversationally | Any chat-style Q. |
| `09-database.md` | Infra | Supabase project, tables, storage, migration | Any DB/storage work. |
| `products.json` | Products | Machine-readable catalog (all Decore doors, finishes, hardware) | LLM lookups / chatbot. |
| `brain-index.json` | Meta | Structured manifest of all brain files with relationships | Programmatic traversal. |
| `CHANGELOG.md` | Meta | Dated log of every material change | After any substantive edit. |

---

## Agent protocol

### Step 1 — Orient
Always read `README.md` (this file), then `00-project.md`. For product questions, jump to `products.json` next.

### Step 2 — Answer by type

| Question type | Start here |
|---|---|
| "What is door model 520X?" | `products.json` → `doors[*].code` → enrich from `02-decore-doors.md` |
| "What colors does Decore offer?" | `products.json` → `finishes` → `03-decore-finishes.md` |
| "How long does a painted door take?" | `products.json` → `leadTimes.woodFinished` → `01-suppliers.md` |
| "What hardware does Decore have?" | `products.json` → `hardware` → `04-decore-hardware.md` |
| "How do I submit a Decore order?" | `05-decore-order-form.md` |
| "What does the intake form do?" | `06-intake-form.md` |
| "How do uploads work?" | `09-database.md` |
| "What's on the proposal site?" | `07-proposal-site.md` |

### Step 3 — Ground rules

1. **Cite the file** when referencing brain content: *"per `02-decore-doors.md`"*.
2. **Never invent** SKUs, lead times, prices, or model numbers. If it's not here, say so.
3. **After any material change**, update the relevant doc and append a line to `CHANGELOG.md`.
4. **Dual-update rule**: if a product fact changes, update **both** `products.json` (machine truth) and the prose doc.
5. **Tone**: factual, concise, skimmable. This is a reference — not marketing.

---

## Source documents (Decore PDFs)

The Decore catalog was extracted from five official PDFs provided by the client (April 2026):

| PDF | Extracted to |
|---|---|
| `standard-order-form.pdf` | `05-decore-order-form.md` |
| `finishing-brochure-3.pdf` | `03-decore-finishes.md` |
| `new-wood-styles-brochure.pdf` | `02-decore-doors.md` (wood section) |
| `new-deco-form-styles-brochure.pdf` | `02-decore-doors.md` (Deco-Form section) |
| `multi-family-housing-brochure.pdf` | `02-decore-doors.md` (cross-ref) + `04-decore-hardware.md` |

When Decore publishes updated brochures: re-extract, update the matching docs, bump `products.json` version, log in `CHANGELOG.md`.
