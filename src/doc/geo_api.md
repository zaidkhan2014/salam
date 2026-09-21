# Geo API — country / state / city client guide

Guide for building **cascading location dropdowns with client-side search** (country → state → city) using `/api/geo`.

There is **no server-side `q=` search param**. Load the list for the current cascade step, then filter locally by `name`.

**Related:** sales lead filters that consume these names — [`FRONTEND_SALES_API_CONTRACT.md`](./FRONTEND_SALES_API_CONTRACT.md).

---

## Summary

| Item | Detail |
|------|--------|
| Base path | `/api/geo` |
| Auth | Authenticated JWT (`Authorization: Bearer <token>`). Not public. Admin sales Bearer or user onboarding/full-access tokens work. |
| Cascading keys | Country → use `iso2`. State → use `code`. City → use `name` for display / profile filters. |
| Search | Client-side on loaded arrays (case-insensitive match on `name`). |
| Spaces in names | Supported (e.g. `Uttar Pradesh`). URL-encode when putting names into other APIs. |

---

## Cascading UI flow

```text
1. On mount: GET /api/geo/countries  → cache list
2. User picks country (or searches within countries)
3. GET /api/geo/states?countries={iso2}  → replace state options; clear city
4. User picks state
5. GET /api/geo/cities?states={code}     → replace city options
6. User picks city
```

Rules:

- Changing **country** clears **state** and **city**.
- Changing **state** clears **city**.
- Dropdown **label** = `name`.
- Next-step request **id**:
  - countries → pass `iso2`
  - states → pass `code` (not the display name)

---

## Auth

```http
Authorization: Bearer <accessToken>
```

Unauthenticated calls return **401**.

---

## 1) Countries

```http
GET /api/geo/countries
```

No query params. Sorted by `name`.

### Response (`GeoCountry[]`)

```json
[
  { "iso2": "AE", "name": "United Arab Emirates" },
  { "iso2": "IN", "name": "India" },
  { "iso2": "US", "name": "United States" }
]
```

| Field | Type | Use |
|-------|------|-----|
| `iso2` | string | Pass to `/states?countries=` |
| `name` | string | Dropdown label + local search |

### Client search example

```ts
const filtered = countries.filter((c) =>
  c.name.toLowerCase().includes(query.trim().toLowerCase())
);
```

---

## 2) States

```http
GET /api/geo/states?countries=IN
```

### Query params

| Param | Required | Description |
|-------|----------|-------------|
| `countries` | Yes | One or more country **ISO2** codes (`IN`, `AE`, …) |

Accepted list forms:

```http
GET /api/geo/states?countries=IN
GET /api/geo/states?countries=IN&countries=AE
GET /api/geo/states?countries=IN,AE
```

### Response (`GeoState[]`)

Names are ASCII-normalized and sorted A–Z (case-insensitive).

```json
[
  {
    "code": "IN.02",
    "name": "Andhra Pradesh",
    "countryIso": "IN"
  },
  {
    "code": "IN.16",
    "name": "Maharashtra",
    "countryIso": "IN"
  },
  {
    "code": "IN.36",
    "name": "Uttar Pradesh",
    "countryIso": "IN"
  }
]
```

| Field | Type | Use |
|-------|------|-----|
| `code` | string | Pass to `/cities?states=` (e.g. `IN.36`) |
| `name` | string | Dropdown label; also value for sales `state=` filter |
| `countryIso` | string | Parent country ISO2 |

India state codes use the `IN.` prefix (e.g. `IN.36` = Uttar Pradesh).

---

## 3) Cities

```http
GET /api/geo/cities?states=IN.36
```

### Query params

| Param | Required | Description |
|-------|----------|-------------|
| `states` | Yes | One or more state **`code`** values from `/states` |

```http
GET /api/geo/cities?states=IN.36
GET /api/geo/cities?states=IN.36&states=IN.16
GET /api/geo/cities?states=IN.36,IN.16
```

Empty / missing `states` → empty array `[]`.

### Response (`GeoCity[]`)

```json
[
  {
    "geonameId": "1277333",
    "name": "Lucknow",
    "stateCode": "IN.36"
  },
  {
    "geonameId": "1261481",
    "name": "Kanpur",
    "stateCode": "IN.36"
  }
]
```

| Field | Type | Use |
|-------|------|-----|
| `geonameId` | string | Stable id (optional UI key) |
| `name` | string | Dropdown label; value for sales `city=` filter |
| `stateCode` | string | Parent state code |

India cities are served from a dedicated India dataset but returned in the **same** `GeoCity` shape.

---

## Mapping into sales / profile filters

Geo cascade uses **codes** internally. Profile and sales filters store / match **display names**.

| UI selection | Store for cascade | Send to sales `GET /api/admin/sales/leads` |
|--------------|-------------------|---------------------------------------------|
| Country India | `iso2 = "IN"` | Usually `country` / profile field = `"India"` (`name`) if used |
| State Uttar Pradesh | `code = "IN.36"` | `state=Uttar%20Pradesh` (**name**, URL-encoded) |
| City Lucknow | — | `city=Lucknow` (**name**) |

Example sales request after picking Uttar Pradesh + Lucknow:

```http
GET /api/admin/sales/leads?state=Uttar%20Pradesh&city=Lucknow&accountStatus=ACTIVE&profileStatus=APPROVED
```

Do **not** send `state=IN.36` to the sales API — that will not match `basicDetails.state`.

In JS:

```ts
params.set("state", selectedState.name); // "Uttar Pradesh" → encoded as Uttar%20Pradesh
params.set("city", selectedCity.name);
```

---

## Suggested UI state

```ts
type GeoCountry = { iso2: string; name: string };
type GeoState = { code: string; name: string; countryIso: string };
type GeoCity = { geonameId: string; name: string; stateCode: string };

// selectedCountryIso2 / selectedStateCode for cascade fetches
// selectedStateName / selectedCityName for sales/profile payloads
```

Pseudocode:

```ts
async function onCountryChange(iso2: string) {
  selectedCountryIso2 = iso2;
  selectedState = null;
  selectedCity = null;
  cities = [];
  states = await get(`/api/geo/states?countries=${encodeURIComponent(iso2)}`);
}

async function onStateChange(state: GeoState) {
  selectedState = state; // keep both code + name
  selectedCity = null;
  cities = await get(`/api/geo/cities?states=${encodeURIComponent(state.code)}`);
}
```

---

## TypeScript types

```ts
export interface GeoCountry {
  iso2: string;
  name: string;
}

export interface GeoState {
  code: string;
  name: string;
  countryIso: string;
}

export interface GeoCity {
  geonameId: string;
  name: string;
  stateCode: string;
}
```

---

## Notes

- Country list is small — load once and cache for the session.
- State/city lists can be large (especially India cities). Prefer searchable dropdowns / typeahead over plain `<select>`.
- Names in state/city responses are normalized to ASCII-friendly forms (accents/quotes stripped).
- Multi-country or multi-state requests are supported if your UI allows multi-select; most onboarding flows use a single country and single state.
