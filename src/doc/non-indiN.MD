# Non-Indian onboarded users — client integration guide

Admin list of users who **completed onboarding** and whose **phone is not Indian** (E.164 does not start with `+91`).

**Related:**
- [`FRONTEND_ADMIN_API_CONTRACT.md`](./FRONTEND_ADMIN_API_CONTRACT.md) — auth, base URL (§3.2)

---

## Summary

| Item | Detail |
|------|--------|
| Endpoint | `GET /api/admin/users/non-indian-onboarded` |
| Auth | Admin Bearer JWT (`ROLE_ADMIN`) |
| Collection | `user_profiles` |
| Window | `[start, end)` on **`onboardingCompletedAt`** |
| Default range | Last **7 days** ending at `now` |
| Sort | `onboardingCompletedAt` descending |

---

## Cohort

A row is included when **all** of:

1. `onboardingComplete == true`
2. `accountStatus != DELETED`
3. `onboardingCompletedAt` in `[start, end)`
4. `phone` is non-blank and does **not** match `^\+91`

`basicDetails.country` is **not** used for filtering (returned for display only). A `+1…` user with country `India` still appears; a `+91…` user with country `UAE` does **not**.

---

## Endpoint

```
GET /api/admin/users/non-indian-onboarded
```

### Query parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `start` | Instant (ISO-8601) | No | `end − 7 days` | Inclusive lower bound on `onboardingCompletedAt` |
| `end` | Instant (ISO-8601) | No | `now` | Exclusive upper bound |
| `page` | int | No | `0` | Zero-based page |
| `size` | int | No | `20` | Page size, **max 100** |

`400` when resolved `start` is not strictly before `end`.

### Example requests

```http
GET /api/admin/users/non-indian-onboarded
GET /api/admin/users/non-indian-onboarded?start=2026-09-20T00:00:00Z&end=2026-09-27T00:00:00Z&page=0&size=50
```

---

## Response — `AdminNonIndianOnboardedResponse`

```json
{
  "start": "2026-09-20T08:00:00Z",
  "end": "2026-09-27T08:00:00Z",
  "total": 12,
  "page": 0,
  "size": 20,
  "items": [
    {
      "userId": "user-abc",
      "memberId": "QALBI099",
      "phone": "+9715xxxxxxx",
      "fullName": "Aisha Khan",
      "gender": "Female",
      "city": "Dubai",
      "state": "Dubai",
      "country": "United Arab Emirates",
      "onboardingCompletedAt": "2026-09-25T14:22:00.000Z",
      "profileStatus": "APPROVED",
      "accountStatus": "ACTIVE",
      "subscribed": false,
      "createdAt": "2026-09-24T10:00:00.000Z"
    }
  ]
}
```

### Item fields

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Profile / auth id |
| `memberId` | string \| null | Public member id |
| `phone` | string \| null | E.164; never starts with `+91` in this list |
| `fullName` / `gender` / `city` / `state` / `country` | string \| null | From `basicDetails` |
| `onboardingCompletedAt` | Instant \| null | Filter/sort field |
| `profileStatus` / `accountStatus` | string \| null | Enum names |
| `subscribed` | boolean | Premium flag |
| `createdAt` | Instant \| null | Profile created |

---

## TypeScript

```typescript
type IsoInstant = string;

interface AdminNonIndianOnboardedItem {
  userId: string;
  memberId: string | null;
  phone: string | null;
  fullName: string | null;
  gender: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  onboardingCompletedAt: IsoInstant | null;
  profileStatus: string | null;
  accountStatus: string | null;
  subscribed: boolean;
  createdAt: IsoInstant | null;
}

interface AdminNonIndianOnboardedResponse {
  start: IsoInstant;
  end: IsoInstant;
  total: number;
  page: number;
  size: number;
  items: AdminNonIndianOnboardedItem[];
}
```

---

## Pitfalls

1. **Phone prefix only** — not the same as “lives outside India”.
2. **Default 7-day window** — widen `start`/`end` for historical pulls.
3. **Deleted accounts** — excluded.
4. **Privacy** — phones are PII; restrict to trusted admin roles.

---

## Errors

| Status | When |
|--------|------|
| `401` / `403` | Missing or non-admin auth |
| `400` | `start >= end` after defaults |
