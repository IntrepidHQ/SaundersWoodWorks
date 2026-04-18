# Decore.com — Standard Order Form Field Map

Source: `standard-order-form.pdf` (Decore form number `LDN1-1003d-20`).

This is the **authoritative field list** for any automation that generates Decore orders. The client intake form (`intake.html`) should collect data that can one-to-one translate to these fields.

---

## Header block

| Form field | Required | Notes |
|---|---|---|
| Customer Code | Yes | Decore-assigned account code |
| Date | Yes | Order-submission date |
| Job Name / PO | Yes | Client/project identifier Saunders tracks |
| Company | Yes | Billing company (Saunders Wood Works LLC) |
| City | Yes | Billing city |
| Contact Name | Yes | Matt or his designee |
| Phone | Yes | |
| Ship To Address | Yes | May differ from billing |
| Ship To City, State, Zip | Yes | |
| Page N of M | Yes | For multi-page faxed orders |
| **Quote Only** (checkbox) | — | Check to get pricing without committing the order |

---

## Door-identity block (per order — all items on one order share these unless noted)

| Form field | Options | Notes |
|---|---|---|
| Door Name or Number | See `02-decore-doors.md` | e.g., `520X` (Newbury Glass) |
| Finished / Unfinished | One | |
| Material | See list below | Required for WOOD |
| Face | Material | |
| Frame | Material | May differ from Face for paint grade |
| Finish Name | See `03-decore-finishes.md` | Paint / Stain / Clear / Primer / Deco-Form color |
| Sheen | Matte 10 · Satin 30/35 · Sheen SBF · Matte 10 Sheen SBF | |

**Material options:**
Maple Select · Maple Paint Grade · White Oak Select · Rift White Oak · Walnut Select · Alder Select · Cherry Select · Red Oak Select · Hardwood Paint Grade (MDF Panel / Hardwood Frame) · Aspen · Rift White Oak Veneer · Deco-Form thermofoil

---

## Per-line-item table (up to 22 rows per page)

Each row captures one door or drawer front.

| Column | Meaning |
|---|---|
| **Row #** | 1–22 |
| **S / DF** | `S` (Single Door), `DF` (Drawer Front), `Special` (Lazy Susan, Glass, French Lite — note quantity of lites), `Bore` (specify boring pattern) |
| **Qty** | Quantity at these dimensions |
| **Width** | Actual finished width |
| **Height** | Actual finished height |
| **Special** | Free-text notes (bore overrides, grain direction, mullion lites, etc.) |

> **Important:** Decore builds to the *actual* sizes provided. No allowance math on their end — Saunders is responsible for any reveal / overlay math.

---

## Door-details block (applies to all WOOD line items unless overridden)

| Field | Options |
|---|---|
| Drawer Front style | Solid · Routed · 5-Piece · Vertical Grain |
| Panel Detail (Wood Only) | Standard (default) · Other (specify) |
| Inside Edge Detail (Wood Only) | Standard (default) · Other (specify) |
| Outside Face Edge Detail | Standard (default) · Square Face Edge · Other |
| Outside Back Edge Detail | Square Back Edge (default) · Other |
| Bore Pattern | Bore A (5mm tab) · Bore B (3mm tab) · Other · None |
| Bore Position | Left · Center · Right · None |
| DF Grain Direction | Standard · Vertical *(Clear and Stain finishes only)* |

---

## Footer block

| Field | Options |
|---|---|
| Special Instructions | Free text — glass type, custom colors, mullion layouts, etc. |
| Requested Ship Date | MM/DD/YYYY |
| Shipping Method | Our Truck · Small Parcel · Freight · Will Call |
| Office Use Only — CSR | (Decore fills) |

---

## Submission channels

| Channel | Value |
|---|---|
| Phone | 800.729.7277 |
| Fax | 800.338.0852 |
| Email | customerservice@decore.com |

Credit-card payments carry a **2.5% surcharge** per transaction.

---

## JSON shape for automation

When the intake form generates a Decore order, serialize it to the following structure. Match this to the fields above:

```json
{
  "header": {
    "customerCode": "",
    "date": "YYYY-MM-DD",
    "jobName": "",
    "company": "Saunders Wood Works LLC",
    "contactName": "",
    "phone": "",
    "shipTo": { "address": "", "city": "", "state": "", "zip": "" },
    "quoteOnly": false
  },
  "doorIdentity": {
    "modelCode": "",
    "doorName": "",
    "finished": true,
    "material": "",
    "face": "",
    "frame": "",
    "finishName": "",
    "sheen": ""
  },
  "details": {
    "drawerFrontStyle": "5-Piece",
    "panelDetail": "Standard",
    "insideEdge": "Standard",
    "outsideFaceEdge": "Standard",
    "outsideBackEdge": "Square Back Edge",
    "borePattern": "None",
    "borePosition": "None",
    "dfGrainDirection": "Standard"
  },
  "lineItems": [
    { "type": "S", "qty": 2, "width": 17.875, "height": 30.5, "special": "" }
  ],
  "footer": {
    "specialInstructions": "",
    "requestedShipDate": "YYYY-MM-DD",
    "shipping": "Our Truck"
  }
}
```
