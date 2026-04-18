# Agent Playbook — How to answer product questions

The ultimate UX vision: Matt types a question ("what's the 520X?", "which shakers come in maple?", "how long for a painted Journey door?") into a chat and gets a precise, Decore-accurate answer.

This playbook is the protocol every agent should follow to make that vision real.

---

## 1. Look up by model code first

If the user's message contains a token that looks like a Decore model code (three digits + optional letter suffix: `508`, `520X`, `841F`, `223G`), check `products.json` for an exact match under `doors[*].code` or `decoForm[*].code`.

- Found → respond with name, joint type, species default, drawer-front style, any glass/French-lite flag, and thickness.
- Not found → say so, do not guess. Suggest a search by name instead.

## 2. Look up by name

If the user gives a door name ("Shaker", "Journey", "Oakley"), search `products.json` case-insensitively in `doors[*].name` and `decoForm[*].name`. Multiple matches possible — list them briefly and ask which one.

## 3. Finish questions

- "What color is SW 7604?" → `Smoky Blue`, in `finishes.paints` of `products.json`.
- "What sheens are available on stain?" → `Matte 10`, `Satin 35` (stain/clear only; paint is `Matte 10` / `Satin 30`).
- "Can I get Tricorn Black on a Shaker (831)?" → Yes if ordered in Hardwood Paint Grade or Maple Paint Grade. Remind them to order a ColorFirmation sample block before committing.

## 4. Hardware questions

- "What hinge does Decore use?" → Salice soft-close. Compact `7802` default; Traditional `7821` for inset.
- "What's in stock for undermount glides?" → Salice Soft Close Undermount 21" with Socket, sizes 12"/15"/18"/23-5/8".
- "What knobs are available?" → Round Knob (`7275`), T-Bar Pull 96mm (`7185`), Mandara Pull 96mm (`1691`), all Satin Nickel.

## 5. Lead time & warranty questions

| User asks | Answer |
|---|---|
| How long for Deco-Form? | 6 working days · 5-year limited warranty |
| How long for unfinished wood doors? | 6 working days · 1-year limited warranty |
| How long for finished (painted/stained) wood doors? | **15 working days** — finishing adds ~9 days · 1-year limited warranty |

## 6. Order-form questions

For any question involving "how do I order X" or "what fields go on the order", read `05-decore-order-form.md` and use it as the ground truth. The JSON shape for automation is documented at the bottom of that file.

## 7. Pricing questions

Decore **does not publish prices**. Do not invent numbers. Tell the user prices come from their Decore rep and that the intake form captures *quoted* prices against which market deltas are tracked.

## 8. When to say "I don't know"

Say it clearly, without hedging, when:

- The user asks for a model code that isn't in `products.json`.
- The user asks about the secondary supplier — it's not yet named (`brain/01-suppliers.md`). Ask Matt.
- The user asks for a price.
- The user asks about an *application detail* not documented in the brochures (e.g., how many hinges does a 36"-tall door need — that's a Saunders install standard, not a Decore spec).

## 9. Answer shape (template)

Keep responses tight. Three lines max unless the user asks for depth.

> **520X — Newbury (Glass)**. Miter-joint, 7/8" thick, Maple Select default. 3/4" face detail, 2" frame, rubber glass stops, solid drawer front. 6-day lead time unfinished, 15-day finished.

Include the **model code in bold** so the user can scan. Cite the brain doc (`per 02-decore-doors.md`) when asked for depth.

## 10. Keep the brain fresh

If you learn a new detail (a new door model, a new color, a new Salice SKU, a new supplier policy):

1. Update the relevant `brain/` file.
2. Update `products.json` if it's a structured fact.
3. Append a dated entry to `CHANGELOG.md` with what changed and why.
4. If the change affects the intake form, update the corresponding in-page catalog in `intake.html`.
