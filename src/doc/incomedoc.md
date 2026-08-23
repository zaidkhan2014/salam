# Sales Leads — Minimum Income Filter (Hardcoded Bands)

Use this document to build the **minimum income** dropdown on the sales leads page. Do **not** call `GET /api/bands/income-bands` from the sales SPA — hardcode these values in the client.

**API param:** `minIncomeBandId` on `GET /api/admin/sales/leads`

**Behavior:** Server converts the band’s **lower bound** to USD and returns profiles where `careerEducation.incomePerYearUsd >= threshold`. Profiles without income data are **excluded** when this filter is set. Unknown band id → **400**.

---

## India bands (`INC_IN_*`)

Use for Indian profiles. Show labels as-is in the UI.

| `minIncomeBandId` | Label (display in UI) |
|-------------------|----------------------|
| `INC_IN_0_5` | ₹0–₹5 lakh |
| `INC_IN_5_10` | ₹5–₹10 lakh |
| `INC_IN_10_20` | ₹10–₹20 lakh |
| `INC_IN_20_30` | ₹20–₹30 lakh |
| `INC_IN_30_40` | ₹30–₹40 lakh |
| `INC_IN_40_50` | ₹40–₹50 lakh |
| `INC_IN_50_60` | ₹50–₹60 lakh |
| `INC_IN_60_70` | ₹60–₹70 lakh |
| `INC_IN_70_80` | ₹70–₹80 lakh |
| `INC_IN_80_90` | ₹80–₹90 lakh |
| `INC_IN_90_100` | ₹90–₹100 lakh |
| `INC_IN_1P` | ₹1 cr+ |

---

## International bands (`INC_INTL_*`)

Use for non-India profiles (USD bands).

| `minIncomeBandId` | Label (display in UI) |
|-------------------|----------------------|
| `INC_INTL_0_20000` | $0–$20k |
| `INC_INTL_20000_40000` | $20k–$40k |
| `INC_INTL_40000_60000` | $40k–$60k |
| `INC_INTL_60000_80000` | $60k–$80k |
| `INC_INTL_80000_100000` | $80k–$100k |
| `INC_INTL_100000_150000` | $100k–$150k |
| `INC_INTL_150000_200000` | $150k–$200k |
| `INC_INTL_200000P` | $200k+ |

---

## Frontend implementation

### TypeScript constant (example)

```ts
export const INDIA_MIN_INCOME_BANDS = [
  { id: "INC_IN_0_5", label: "₹0–₹5 lakh" },
  { id: "INC_IN_5_10", label: "₹5–₹10 lakh" },
  { id: "INC_IN_10_20", label: "₹10–₹20 lakh" },
  { id: "INC_IN_20_30", label: "₹20–₹30 lakh" },
  { id: "INC_IN_30_40", label: "₹30–₹40 lakh" },
  { id: "INC_IN_40_50", label: "₹40–₹50 lakh" },
  { id: "INC_IN_50_60", label: "₹50–₹60 lakh" },
  { id: "INC_IN_60_70", label: "₹60–₹70 lakh" },
  { id: "INC_IN_70_80", label: "₹70–₹80 lakh" },
  { id: "INC_IN_80_90", label: "₹80–₹90 lakh" },
  { id: "INC_IN_90_100", label: "₹90–₹100 lakh" },
  { id: "INC_IN_1P", label: "₹1 cr+" },
] as const;

export const INTL_MIN_INCOME_BANDS = [
  { id: "INC_INTL_0_20000", label: "$0–$20k" },
  { id: "INC_INTL_20000_40000", label: "$20k–$40k" },
  { id: "INC_INTL_40000_60000", label: "$40k–$60k" },
  { id: "INC_INTL_60000_80000", label: "$60k–$80k" },
  { id: "INC_INTL_80000_100000", label: "$80k–$100k" },
  { id: "INC_INTL_100000_150000", label: "$100k–$150k" },
  { id: "INC_INTL_150000_200000", label: "$150k–$200k" },
  { id: "INC_INTL_200000P", label: "$200k+" },
] as const;
```

### UI suggestions

- Default pool filter for India: show **India bands** only (most leads are Indian).
- Optional toggle or second dropdown for International bands if needed.
- Label in UI: **“Minimum income”** — selecting “₹30–₹40 lakh” sends `minIncomeBandId=INC_IN_30_40`.
- List rows may include `incomeLabel` and `incomePerYearUsd` for display (see [`FRONTEND_SALES_API_CONTRACT.md`](./FRONTEND_SALES_API_CONTRACT.md)).

### Saved views

Include in `filtersJson` when persisting:

```json
{
  "pool": true,
  "accountStatus": "ACTIVE",
  "minIncomeBandId": "INC_IN_30_40"
}
```

---

## Example request

```http
GET /api/admin/sales/leads?pool=true&accountStatus=ACTIVE&profileStatus=APPROVED&minIncomeBandId=INC_IN_30_40&page=0&size=20
Authorization: Bearer <accessToken>
```

---

## Related docs

- Full sales API: [`FRONTEND_SALES_API_CONTRACT.md`](./FRONTEND_SALES_API_CONTRACT.md)
- Admin panel contract: [`FRONTEND_ADMIN_API_CONTRACT.md`](./FRONTEND_ADMIN_API_CONTRACT.md)

**Source of truth (backend):** [`src/main/resources/income-bands.yaml`](../src/main/resources/income-bands.yaml) — update this doc if bands change in a future release.
