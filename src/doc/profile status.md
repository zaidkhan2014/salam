# Profile Review Queue — client integration guide

This document is for the **admin web client** building a monitoring UI for profiles stuck in **REJECTED** or **PENDING** after onboarding (live-selfie / gender / face-match review).

Use these APIs when you need to:

1. List rejected/pending profiles **by gender** with **why** they were rejected
2. Show photos + review details so an admin can decide if the reject was a mistake
3. Force-approve a single profile (Mongo + Elasticsearch) via an **Approve** button

**Related:** [`FRONTEND_ADMIN_API_CONTRACT.md`](./FRONTEND_ADMIN_API_CONTRACT.md) — admin auth, base URL, shared conventions.

Do **not** use `GET /users/profile-rejected` for this UI — it returns a thin summary without review code/message/photos. Prefer the review-queue endpoint below.

---

## Summary

| Item | Detail |
|------|--------|
| List endpoint | `GET /api/admin/users/review-queue` |
| Approve endpoint | `POST /api/admin/users/{userId}/force-approve-review` |
| Auth | Admin Bearer JWT (`ROLE_ADMIN`) |
| Purpose | Catch mistaken rejects; force-approve genuine profiles |
| Existing APIs | Left unchanged (`/profile-rejected`, `/approve-face-mismatch-rejects`) |

---

## Suggested UI flow

```
┌──────────────────────────────────────────────────────────────┐
│ Filters: Gender [Female ▾]  Status [All ▾]  Code [All ▾]   │
│          Date range  Page size                               │
├──────────────────────────────────────────────────────────────┤
│ Row: Name | Gender | Status | Code | Similarity | Photos     │
│      [Approve]  (only if canForceApprove === true)           │
├──────────────────────────────────────────────────────────────┤
│ Detail drawer: reviewMessage + gallery + full profile JSON   │
└──────────────────────────────────────────────────────────────┘
```

1. Load `GET /review-queue?gender=Female` (or Male / omit).
2. Show `reviewCode` + `reviewMessage` + `faceSimilarity`.
3. Show `liveSelfieUrl` and `reviewedPrimaryUrl` (or gallery from `profile`).
4. If `canForceApprove`, show **Approve** → `POST /users/{userId}/force-approve-review` → refresh list on `success: true`.

---

## API 1 — Review queue list

```
GET /api/admin/users/review-queue
```

### Query parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `gender` | string | No | — | Exact match on `basicDetails.gender` (`Male` / `Female`) |
| `profileStatus` | enum | No | both | `REJECTED` or `PENDING`. Omit = both. Other values → **400** |
| `reviewCode` | enum | No | — | See [Review codes](#review-codes) below |
| `start` | ISO instant | No | — | Filter `profileReview.reviewedAt >= start` |
| `end` | ISO instant | No | — | Filter `profileReview.reviewedAt < end` |
| `page` | int | No | `0` | Zero-based page |
| `size` | int | No | `20` | Page size, **max 50** (rich payload) |

### Always applied server-side

- `onboardingComplete = true`
- `accountStatus != DELETED`
- `profileStatus` in `{ REJECTED, PENDING }` (or the single requested status)

### Sort

1. `profileReview.reviewedAt` descending (nulls last)
2. `createdAt` descending

### Example requests

```http
GET /api/admin/users/review-queue?gender=Female
GET /api/admin/users/review-queue?gender=Female&profileStatus=REJECTED
GET /api/admin/users/review-queue?reviewCode=GENDER_MISMATCH&page=0&size=20
GET /api/admin/users/review-queue?start=2026-09-01T00:00:00Z&end=2026-09-03T00:00:00Z
```

---

## Response — `AdminReviewQueueResponse`

```json
{
  "items": [ { "...": "AdminReviewQueueItem" } ],
  "page": 0,
  "size": 20,
  "total": 42
}
```

| Field | Type | Description |
|-------|------|-------------|
| `items` | `AdminReviewQueueItem[]` | Current page |
| `page` | number | Resolved page index |
| `size` | number | Resolved page size |
| `total` | number | Total matching documents |

---

## Response item — `AdminReviewQueueItem`

Flat fields are for the table / Approve button. `profile` is the full Mongo `UserProfile` for a detail drawer.

### Identity / quick scan

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Primary id for approve URL |
| `memberId` | string \| null | Public member id |
| `phone` | string \| null | Phone |
| `fullName` | string \| null | From `basicDetails` |
| `gender` | string \| null | `Male` / `Female` |
| `city` / `state` / `country` | string \| null | Location |
| `profileStatus` | string \| null | `REJECTED` or `PENDING` |
| `accountStatus` | string \| null | Usually `ACTIVE` |
| `subscribed` | boolean | Subscription flag |
| `verifiedProfile` | boolean | Selfie-verified flag |
| `createdAt` | ISO instant \| null | Profile created |
| `onboardingCompletedAt` | ISO instant \| null | Onboarding completed |

### Why rejected / pending (use these for the row)

| Field | Type | Description |
|-------|------|-------------|
| `reviewStatus` | string \| null | `PENDING` / `REJECTED` / `APPROVED` / `NONE` |
| `reviewCode` | string \| null | Reason code — see table below |
| `reviewMessage` | string \| null | Human-readable reason from backend |
| `faceSimilarity` | number \| null | Face-match score (selfie vs primary); useful for `SELFIE_FACE_MISMATCH` |
| `liveSelfiePublicId` | string \| null | Live selfie Cloudinary id |
| `liveSelfieUrl` | string \| null | **Rewritten delivery URL** for selfie preview |
| `reviewedPrimaryPublicId` | string \| null | Primary photo id used in last review |
| `reviewedPrimaryUrl` | string \| null | **Rewritten delivery URL** for primary preview |
| `reviewSubmittedAt` | ISO instant \| null | When review was submitted |
| `reviewReviewedAt` | ISO instant \| null | When review outcome was written |
| `canForceApprove` | boolean | If `true`, show **Approve** button |

### Full document

| Field | Type | Description |
|-------|------|-------------|
| `profile` | `UserProfile` | Full profile document (gallery, review, basicDetails, etc.). Gallery URLs are rewritten for display. |

### `canForceApprove` rules

`true` only when **all** of:

- Onboarding complete
- Account is `ACTIVE` (not deleted/banned)
- `profileStatus` is `REJECTED` or `PENDING`
- `reviewCode` is **not** `NSFW_BANNED`

If `canForceApprove === false`, hide or disable Approve and show a short explanation (e.g. NSFW ban).

---

## Review codes

| `reviewCode` | Meaning | Typical `profileStatus` | Force-approve? |
|--------------|---------|-------------------------|----------------|
| `SELFIE_REQUIRED` | Live selfie missing / required | `PENDING` | Yes |
| `SELFIE_FACE_MISMATCH` | Selfie face ≠ primary photo | `REJECTED` | Yes |
| `GENDER_MISMATCH` | Photo gender ≠ claimed gender | `REJECTED` | Yes |
| `GENDER_CHANGED_PENDING_REVIEW` | User changed gender; awaiting re-review | usually `PENDING` | Yes |
| `NSFW_BANNED` | Serious NSFW; account/device banned | `REJECTED` | **No** |
| `null` | No code set (e.g. gender inconclusive pending) | `PENDING` / `REJECTED` | Yes if other rules pass |

**Suggested row labels:**

| Code | Label |
|------|-------|
| `SELFIE_FACE_MISMATCH` | Face mismatch |
| `GENDER_MISMATCH` | Gender mismatch |
| `SELFIE_REQUIRED` | Selfie required |
| `NSFW_BANNED` | NSFW ban |
| `GENDER_CHANGED_PENDING_REVIEW` | Gender change pending |

Also show `reviewMessage` under the label when present.

---

## Example list item (abbreviated)

```json
{
  "userId": "user-abc",
  "memberId": "QLB123",
  "phone": "+91...",
  "fullName": "Aisha Khan",
  "gender": "Female",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "profileStatus": "REJECTED",
  "accountStatus": "ACTIVE",
  "subscribed": false,
  "verifiedProfile": false,
  "createdAt": "2026-09-01T10:00:00Z",
  "onboardingCompletedAt": "2026-09-01T10:30:00Z",
  "reviewStatus": "REJECTED",
  "reviewCode": "SELFIE_FACE_MISMATCH",
  "reviewMessage": "Live selfie does not match primary photo",
  "faceSimilarity": 42.5,
  "liveSelfiePublicId": "selfie/...",
  "liveSelfieUrl": "https://res.cloudinary.com/.../selfie.jpg",
  "reviewedPrimaryPublicId": "primary/...",
  "reviewedPrimaryUrl": "https://res.cloudinary.com/.../primary.jpg",
  "reviewSubmittedAt": "2026-09-01T10:31:00Z",
  "reviewReviewedAt": "2026-09-01T10:32:00Z",
  "canForceApprove": true,
  "profile": {
    "userId": "user-abc",
    "profileStatus": "REJECTED",
    "basicDetails": { "fullName": "Aisha Khan", "gender": "Female" },
    "profileReview": {
      "status": "REJECTED",
      "code": "SELFIE_FACE_MISMATCH",
      "faceSimilarity": 42.5
    },
    "mediaGallery": { "items": [ /* photos with delivery URLs */ ] }
  }
}
```

---

## API 2 — Force-approve one profile

```
POST /api/admin/users/{userId}/force-approve-review
```

- **Path:** `userId` from the list row
- **Body:** none
- **Auth:** `ROLE_ADMIN`

### What the server does

1. Refuses NSFW bans / inactive accounts / profiles not in REJECTED|PENDING
2. Approves pending gallery media
3. Clears gender-mismatch media rejects and marks gender check verified
4. Sets `profileReview` to APPROVED (clears code/message)
5. Sets `verifiedProfile = true`
6. Recomputes `profileStatus` and publishes so **Mongo + Elasticsearch** update

### Response — `AdminForceApproveReviewResponse`

```json
{
  "userId": "user-abc",
  "memberId": "QLB123",
  "previousProfileStatus": "REJECTED",
  "previousReviewCode": "GENDER_MISMATCH",
  "previousReviewStatus": "REJECTED",
  "profileStatus": "APPROVED",
  "reviewStatus": "APPROVED",
  "verifiedProfile": true,
  "success": true,
  "message": null
}
```

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Target user |
| `memberId` | string \| null | Member id |
| `previousProfileStatus` | string \| null | Status before override |
| `previousReviewCode` | string \| null | Review code before override |
| `previousReviewStatus` | string \| null | Review status before override |
| `profileStatus` | string \| null | Status after override (expect `APPROVED` on success) |
| `reviewStatus` | string \| null | Review status after (expect `APPROVED`) |
| `verifiedProfile` | boolean | After override |
| `success` | boolean | **`true` only if final `profileStatus` is APPROVED** |
| `message` | string \| null | Failure reason when `success` is false |

### Failure `message` values

| `message` | Meaning | Client UI |
|-----------|---------|-----------|
| `MISSING_USER_ID` | Empty path | Should not happen from list |
| `PROFILE_NOT_FOUND` | Unknown user | Toast error |
| `ONBOARDING_INCOMPLETE` | Not onboarded | Hide approve |
| `ACCOUNT_NOT_ACTIVE` | Deleted/banned | Hide approve |
| `PROFILE_NOT_IN_QUEUE` | Already approved / not REJECTED\|PENDING | Refresh list |
| `NSFW_BANNED` | NSFW ban — never force-approve | Show “Cannot approve NSFW ban” |
| `POST_RECOMPUTE_NOT_APPROVED:<status>` | Override ran but rollup still not APPROVED (e.g. other rejected media) | Toast + keep row / open detail |
| `ERROR:<text>` | Unexpected server error | Toast + retry |

### Client handling

```typescript
const res = await post(`/api/admin/users/${userId}/force-approve-review`);
if (res.success) {
  // remove row or refresh page; show “Approved”
} else {
  // toast res.message; do not remove row
}
```

HTTP status is still **200** for refused cases (`success: false`). Branch on **`success`**, not only HTTP status.

---

## TypeScript interfaces

```typescript
type ProfileStatusQueue = "REJECTED" | "PENDING";

type ProfileReviewCode =
  | "SELFIE_REQUIRED"
  | "SELFIE_FACE_MISMATCH"
  | "GENDER_MISMATCH"
  | "NSFW_BANNED"
  | "GENDER_CHANGED_PENDING_REVIEW";

interface AdminReviewQueueItem {
  userId: string;
  memberId: string | null;
  phone: string | null;
  fullName: string | null;
  gender: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  profileStatus: string | null;
  accountStatus: string | null;
  subscribed: boolean;
  verifiedProfile: boolean;
  createdAt: string | null;
  onboardingCompletedAt: string | null;
  reviewStatus: string | null;
  reviewCode: string | null;
  reviewMessage: string | null;
  faceSimilarity: number | null;
  liveSelfiePublicId: string | null;
  liveSelfieUrl: string | null;
  reviewedPrimaryPublicId: string | null;
  reviewedPrimaryUrl: string | null;
  reviewSubmittedAt: string | null;
  reviewReviewedAt: string | null;
  canForceApprove: boolean;
  profile: Record<string, unknown>; // full UserProfile
}

interface AdminReviewQueueResponse {
  items: AdminReviewQueueItem[];
  page: number;
  size: number;
  total: number;
}

interface AdminForceApproveReviewResponse {
  userId: string | null;
  memberId: string | null;
  previousProfileStatus: string | null;
  previousReviewCode: string | null;
  previousReviewStatus: string | null;
  profileStatus: string | null;
  reviewStatus: string | null;
  verifiedProfile: boolean;
  success: boolean;
  message: string | null;
}
```

---

## Difference from older endpoints

| | `/users/profile-rejected` | `/users/review-queue` (use this) |
|--|---------------------------|----------------------------------|
| Statuses | REJECTED only | REJECTED + PENDING |
| Gender filter | No | Yes |
| Review code / message | No | Yes |
| Photos / selfie URLs | No | Yes |
| Full `UserProfile` | No | Yes |
| `canForceApprove` | No | Yes |
| Approve action | Separate bulk face-mismatch only | Per-user force-approve |

| | `/users/approve-face-mismatch-rejects` | `/users/{id}/force-approve-review` |
|--|----------------------------------------|-------------------------------------|
| Scope | Bulk, `SELFIE_FACE_MISMATCH` only | Single user, most codes |
| Gender mismatch | Not handled | Clears gender mismatch media |
| NSFW ban | Skipped by eligibility | Explicitly refused |

---

## Common pitfalls

1. **Branching on HTTP status for approve** — refused cases return 200 with `success: false`.
2. **Showing Approve for NSFW** — always respect `canForceApprove`.
3. **Using `profile-rejected` for this page** — missing reasons/photos; use `review-queue`.
4. **Date filter** — `start`/`end` apply to `profileReview.reviewedAt`, not signup `createdAt`.
5. **Gender values** — send `Male` / `Female` (exact casing used in profiles).
6. **Page size** — max 50; larger values are capped server-side.

---

## Error handling (list)

| Status | Cause | Client action |
|--------|-------|---------------|
| 400 | Invalid `profileStatus` (not REJECTED/PENDING) | Fix filter UI |
| 401 / 403 | Auth | Redirect to login |
| 500 | Server error | Retry + toast |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-09-03 | Initial `review-queue` + `force-approve-review` client guide |
