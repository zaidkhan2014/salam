# Login Funnel API — client integration guide

This document is for the **admin web client** building charts for:

**OTP requested → OTP verified → existing-user login (by gender)**

Use this when you need relogin volume among already-registered users, split male/female.  
Do **not** use `/analytics/otp` alone for existing-user login — that endpoint has no `profileRegistered` filter and no gender.

**Related:**
- [`FRONTEND_ADMIN_API_CONTRACT.md`](./FRONTEND_ADMIN_API_CONTRACT.md) — admin auth, base URL
- [`GENDER_MONITORING_CLIENT.md`](./GENDER_MONITORING_CLIENT.md) — shared `GenderSnapshot` shape
- `/analytics/otp` — OTP request / success / fail with daily series (no existing-login step)

---

## Summary

| Item | Detail |
|------|--------|
| Endpoint | `GET /api/admin/analytics/login-funnel` |
| Auth | Admin Bearer JWT (`ROLE_ADMIN`) |
| Purpose | Funnel totals + existing-user relogin by gender |
| Collection | `auth_info` (+ `user_profiles` for gender on relogins) |
| Window | `[start, end)` — inclusive start, exclusive end |
| Default range | Last **7 days** ending at `now` when params omitted |
| Trends | **None** — totals + one `GenderSnapshot` for graphs |

---

## Endpoint

```
GET /api/admin/analytics/login-funnel
```

### Query parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `start` | Instant (ISO-8601) | No | `end − 7 days` | Inclusive lower bound |
| `end` | Instant (ISO-8601) | No | `now` | Exclusive upper bound |

`400` when resolved `start` is not strictly before `end`.

### Example requests

```http
GET /api/admin/analytics/login-funnel
GET /api/admin/analytics/login-funnel?start=2026-09-01T00:00:00Z&end=2026-09-24T00:00:00Z
```

---

## Step definitions

All counts are distinct `auth_info` documents matching the rule (one row per user).

| Response field | Rule |
|----------------|------|
| `otpRequested` | `lastOtpRequestedAt` in `[start, end)` |
| `otpVerified` | `otpVerifiedAt` in `[start, end)` |
| `existingUserLogin` | `lastLoginAt` in `[start, end)` **and** `profileRegistered = true` **and** `profileRegisteredAt` is present **and** `profileRegisteredAt < lastLoginAt` |

### Why `profileRegisteredAt < lastLoginAt`?

Every successful OTP verify sets `lastLoginAt` (new and returning users).  
`profileRegistered` is set later when onboarding completes. Without the timestamp guard, a user who OTP’d as new then registered later would be counted as an “existing” login for that earlier verify once you query with current flags.

Legacy rows with `profileRegistered=true` but **null** `profileRegisteredAt` are **excluded** from `existingUserLogin` (avoids false positives).

### Gender for `existingUserLogin`

| Step | Detail |
|------|--------|
| Join | `auth_info._id` → `user_profiles.userId` |
| Field | `basicDetails.gender` |
| Buckets | `Male` → `male`, `Female` → `female`, else / missing profile → `unknown` |

Same normalization as gender-monitoring / Life Together onboarding gender API.

---

## Response — `AdminLoginFunnelResponse`

### Full example

```json
{
  "start": "2026-09-17T07:00:00Z",
  "end": "2026-09-24T07:00:00Z",
  "otpRequested": 4200,
  "otpVerified": 3100,
  "existingUserLogin": {
    "total": 1800,
    "male": 1400,
    "female": 380,
    "unknown": 20,
    "femalePercent": 21.11,
    "malePercent": 77.78,
    "maleToFemaleRatio": "3.68:1"
  }
}
```

### Top-level fields

| Field | Type | Description |
|-------|------|-------------|
| `start` | string (Instant) | Resolved window start |
| `end` | string (Instant) | Resolved window end |
| `otpRequested` | number | OTP requests in window |
| `otpVerified` | number | Successful OTP verifies in window |
| `existingUserLogin` | `GenderSnapshot` | Relogins of already-registered users, by gender |

### `GenderSnapshot`

| Field | Type | Description |
|-------|------|-------------|
| `total` | number | `male + female + unknown` |
| `male` | number | Male relogins |
| `female` | number | Female relogins |
| `unknown` | number | Missing profile or unrecognized gender |
| `femalePercent` | number | `female / total * 100` (0 if total is 0) |
| `malePercent` | number | `male / total * 100` |
| `maleToFemaleRatio` | string | Display ratio (e.g. `"3.68:1"`) |

---

## Suggested UI / charts

```
┌─────────────────────────────────────────────────────┐
│ Funnel: otpRequested → otpVerified → existing total │
└─────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────────────┐
│ KPI: Requested│ KPI: Verified│ KPI: Existing login  │
│ otpRequested  │ otpVerified  │ existingUserLogin.   │
│               │              │ total (+ ♀ %)        │
└──────────────┴──────────────┴──────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Pie or bar: existingUserLogin male / female / unknown│
└─────────────────────────────────────────────────────┘
```

### Graph mapping

| Chart | Data | How to plot |
|-------|------|-------------|
| Funnel / horizontal steps | `otpRequested`, `otpVerified`, `existingUserLogin.total` | Three stages left → right |
| KPI cards | same three numbers; optional `existingUserLogin.femalePercent` | Three cards |
| Pie / stacked bar | `existingUserLogin.male` / `.female` / `.unknown` | Gender of relogins only |

**Conversion helpers (client-side):**

```text
verifyRate = otpVerified / otpRequested
existingShareOfVerifies = existingUserLogin.total / otpVerified
```

These are **illustrative** — the steps are not a strict nested subset (different timestamp fields; a user can request OTP without verifying in the same window).

**Subtitle suggestion:** *"OTP activity in range · existing login = profile registered before that login"*

---

## TypeScript interfaces

```typescript
interface GenderSnapshot {
  total: number;
  male: number;
  female: number;
  unknown: number;
  femalePercent: number;
  malePercent: number;
  maleToFemaleRatio: string;
}

interface AdminLoginFunnelResponse {
  start: string; // Instant ISO-8601
  end: string;
  otpRequested: number;
  otpVerified: number;
  existingUserLogin: GenderSnapshot;
}
```

---

## Pitfalls

1. **Not a nested funnel** — stages use different fields (`lastOtpRequestedAt`, `otpVerifiedAt`, `lastLoginAt`). Totals need not decrease strictly.
2. **No gender on steps 1–2** — many OTP rows have no profile yet; gender applies only to `existingUserLogin`.
3. **Legacy null `profileRegisteredAt`** — excluded from existing login even if `profileRegistered` is true.
4. **vs `/analytics/otp`** — use `/otp` for daily series and fail counts; use `/login-funnel` for existing-user + gender.
5. **Token refresh** — does **not** update `lastLoginAt` (only OTP success does), so this is OTP login volume, not session refresh volume.

---

## Errors

| Status | When |
|--------|------|
| `401` / `403` | Missing or non-admin auth |
| `400` | `start >= end` after defaults |
