# Frontend Admin API Contract

This document is intended for frontend implementation (React web admin panel).

**Related:** [`ADMIN_API_POSTMAN_GUIDE.md`](./ADMIN_API_POSTMAN_GUIDE.md) — keep examples and URLs aligned with this contract when you change either file.

| Section | Topic |
|--------|--------|
| **§0** | Base URL, CORS, JSON conventions |
| **§1** | Auth, `ErrorResponse`, token DTOs |
| **§2** | Shared response JSON (`AdminMetricsResponse`, users, sales list/detail, reports) |
| **§3** | Endpoint catalog (analytics, users, reports, staff, sales) — sales SPA: [`FRONTEND_SALES_API_CONTRACT.md`](./FRONTEND_SALES_API_CONTRACT.md) |
| **§4** | Suggested UI pages |
| **§5** | Copy-paste request/response examples |
| **§6** | Integration notes |
| **§7** | TypeScript interfaces |

It describes:

- Authentication flow
- Endpoint catalog
- Query params and request bodies
- Exact response DTO shapes
- UI mapping suggestions
- Error payload shape and common HTTP status codes
- TypeScript interfaces aligned with backend DTOs

## 0) Base URL, CORS, and JSON

- **Base path:** all admin routes in this document are under **`/api/admin`** (prepend your deployment origin, e.g. `https://admin-api.example.com/api/admin/...`).
- **HTTPS:** use TLS in production; the contract assumes HTTPS for token and bearer traffic.
- **JSON:** request bodies use **`Content-Type: application/json`**. Query parameters that are enums must match the **Java enum constant names** (e.g. `APPROVED`, `REJECTED`) unless your Spring configuration documents otherwise; when in doubt, send uppercase enum names.
- **CORS (production):** allowed browser origins are usually configured at the **reverse proxy** (see [`NGINX_CORS_FIX_COMMANDS.md`](./NGINX_CORS_FIX_COMMANDS.md)). The admin web app’s origin must be permitted for `Authorization`, `X-Admin-Secret`, and preflight **`OPTIONS`** requests.
- **CORS (local / ngrok → Java only):** when the browser calls your machine or ngrok **without** nginx in front, enable Spring CORS so preflight succeeds:
  - Set **`app.admin.cors.enabled=true`** and either **`app.admin.cors.allowed-origins`** (comma-separated, e.g. `http://localhost:5174`) or **`app.admin.cors.allowed-origin-patterns`** (e.g. `http://localhost:*`). Environment variable: **`APP_ADMIN_CORS_ENABLED`**.
  - Keep **`app.admin.cors.enabled=false`** in production if nginx already sends `Access-Control-*` headers (duplicate CORS headers break browsers).
  - The browser **`Origin`** is still your admin dev URL (e.g. `http://localhost:5174`), not the ngrok hostname; you do not need to list `*.ngrok-free.app` in allowed origins for that setup.
  - **ngrok free browser warning:** ngrok may return **HTML** (often HTTP 200) instead of your API JSON. That response has **no** `Access-Control-Allow-Origin`, so the browser reports a CORS error (sometimes shown as `net::ERR_FAILED 200`). Mitigation: send request header **`ngrok-skip-browser-warning: true` on every admin API call** from the browser (including **`GET`** analytics), not only login. Spring CORS (when enabled) allows this header on preflight (`Access-Control-Allow-Headers`). The admin SPA must set it on its HTTP client defaults whenever the API base URL is an `*.ngrok-free.*` host (implementation lives in the admin frontend repo).
- **Rate limiting:** if enabled at the edge, handle **429** like other non-2xx errors (retry/backoff is product-specific).

## 1) Auth Model

Admin APIs are protected by `ROLE_ADMIN` under `/api/admin/**`.

### Token API

- **Endpoint:** `POST /api/admin/auth/token`
- **Headers:**
  - `Content-Type: application/json`
  - `X-Admin-Secret: <shared-secret>`
- **Body (`AdminTokenRequest`):**

```json
{
  "adminUserId": "admin-super-1"
}
```

- **Response DTO (`AdminTokenResponse`):**

```json
{
  "accessToken": "string",
  "expiresAt": "ISO_INSTANT",
  "scope": "full_access",
  "roles": ["ROLE_ADMIN"],
  "sessionId": "admin-uuid"
}
```

Use this bootstrap token only for internal/super-admin migration. **Sales employees should use staff login below.**

### Staff login (recommended for sales dashboard)

- **Endpoint:** `POST /api/admin/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{
  "email": "sales1@qalbi.co.in",
  "password": "your-password"
}
```

- **Response (`AdminStaffLoginResponse`):**

```json
{
  "accessToken": "string",
  "expiresAt": "ISO_INSTANT",
  "scope": "admin_access",
  "roles": ["ROLE_ADMIN", "ROLE_SALES_AGENT"],
  "sessionId": "admin-staff-uuid",
  "staff": {
    "id": "mongo-id",
    "employeeId": "SALES001",
    "name": "Sales Agent 1",
    "email": "sales1@qalbi.co.in",
    "phone": null,
    "role": "SALES_AGENT",
    "status": "ACTIVE",
    "createdAt": "ISO_INSTANT",
    "updatedAt": "ISO_INSTANT",
    "lastLoginAt": "ISO_INSTANT"
  }
}
```

- JWT **`sub`** (subject) is the staff **`employeeId`** (e.g. `SALES001`), used for lead assignment and `assignedToMe`.
- Staff roles: `SUPER_ADMIN`, `SALES_MANAGER`, `SALES_AGENT`, `SUPPORT`.
- Invalid credentials return **400** with `"Invalid email or password"`.
- Disabled staff cannot login.

### Role-based sales access

| Role | Sales list | Sales detail | Update status/note/follow-up | Assign leads | Manage staff |
|------|------------|--------------|------------------------------|--------------|--------------|
| `SUPER_ADMIN` | All | All | Yes | Yes | Yes (incl. other super admins) |
| `SALES_MANAGER` | All | All | Yes | Yes | Yes (not super admins) |
| `SALES_AGENT` | All filters (UI should use `pool=true` / `assignedToMe=true`) | Pool + own assigned | Own assigned only | No | No |
| `SUPPORT` | All (read) | All (read) | No | No | No |
| Bootstrap `ROLE_ADMIN` only | All | All | Yes | Yes | Yes |

### Frontend handling

- Store token in memory or secure storage.
- Send on all admin API calls:
  - `Authorization: Bearer <accessToken>`
- If `401`, redirect to admin login page and re-issue token.
- **`403`:** valid token but insufficient role or forbidden action — show an unauthorized/forbidden message; do not treat as “bad password” on the login form.

### Error responses (`ErrorResponse`)

Most failing admin requests return a JSON body shaped like Spring’s standard error object (see `com.qalbiapp.myapp.activity.dto.ErrorResponse`):

```json
{
  "timestamp": "2026-05-30T12:00:00.123Z",
  "status": 404,
  "error": "Not Found",
  "message": "Human-readable explanation"
}
```

| HTTP | Typical meaning | Examples |
|------|-----------------|----------|
| **400** | Bad input | Unknown enum in query, validation failure (`MethodArgumentNotValidException`), `IllegalArgumentException` (e.g. unknown `userId` on sales detail) |
| **401** | Not authenticated | Missing/invalid/expired Bearer token |
| **403** | Not allowed | `ForbiddenActionException`, missing `ROLE_ADMIN` |
| **404** | Missing resource | `ResourceNotFoundException` |
| **409** | Conflict | Lead already claimed by another agent (`LeadClaimConflictException` on `POST …/claim`) |
| **502** / **504** | Upstream / timeout | External HTTP client failures (rare on pure admin CRUD paths) |
| **500** | Server error | Unexpected exceptions (`"Something went wrong"`) |

Validation errors (**400**) concatenate field errors into a single `message` string.

Some non-admin paths may return ad-hoc **`Map`** bodies for AWS errors (**502**); admin controllers primarily use `ErrorResponse` above.

## 2) Shared Response Structures

## 2.1 `AdminMetricsResponse`

```json
{
  "start": "ISO_INSTANT",
  "end": "ISO_INSTANT",
  "granularity": "DAILY | WEEKLY | MONTHLY",
  "metrics": [
    {
      "key": "string",
      "total": 0,
      "series": [
        { "bucket": "string", "value": 0 }
      ],
      "breakdown": [
        { "key": "string", "value": 0 }
      ]
    }
  ]
}
```

### Notes

- `series` is chart-friendly time data.
- `breakdown` is category split (e.g., by reason, gender, plan).
- Some cards return only `total`; `series`/`breakdown` may be empty arrays.

### DAU metric (`active_users` in overview)

- **Source:** MongoDB collection `user_daily_activity` — one document per user per **UTC calendar day** when the app first calls `POST /api/active-users/mark-today` that day (same rule as the Redis daily-active set).
- **`total` (over a date range):** number of **distinct** `userId` values with at least one such day in `[start, end)` — not a sum of daily DAU (so a user active 5 days in the range counts once in `total`).
- **`series` with `granularity=daily`:** value per bucket = **DAU** (unique users that UTC day).
- **`series` with `granularity=weekly` or `monthly`:** value per bucket = **distinct users** who had at least one active day in that ISO week or calendar month (not the sum of daily DAUs).
- **History:** rows are retained **24 months** from their activity day (Mongo TTL on `purgeAt`). There is **no** backfill for days before this feature shipped; charts fill in from the deploy date forward as users hit `mark-today`.
- **Product requirement:** the mobile/web client must call `mark-today` (cold start / foreground) or DAU will be undercounted.

## 2.2 `AdminUserSearchResponse`

Each element of `items` uses the same row shape as **`AdminUserSummary`** (see TypeScript below). Convenience list endpoints (`/users/newly-joined`, etc.) return this same wrapper type. Many string fields may be JSON **`null`** when missing in MongoDB or auth rows (`memberId`, `phone`, `fullName`, `profileStatus`, `lastLoginAt`, etc.).

```json
{
  "items": [
    {
      "userId": "string",
      "memberId": "string",
      "phone": "string",
      "fullName": "string",
      "gender": "string",
      "city": "string",
      "state": "string",
      "country": "string",
      "subscribed": true,
      "profileStatus": "string",
      "accountStatus": "string",
      "createdAt": "ISO_INSTANT",
      "lastLoginAt": "ISO_INSTANT",
      "lastActivityAt": "ISO_INSTANT"
    }
  ],
  "page": 0,
  "size": 20,
  "total": 100
}
```

## 2.3 `AdminUserDetailResponse`

```json
{
  "userId": "string",
  "memberId": "string",
  "phone": "string",
  "fullName": "string",
  "gender": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "profileStatus": "string",
  "accountStatus": "string",
  "subscribed": true,
  "otpVerified": true,
  "profileRegistered": true,
  "signupAt": "ISO_INSTANT",
  "otpVerifiedAt": "ISO_INSTANT",
  "onboardingCompletedAt": "ISO_INSTANT",
  "profileCompletedAt": "ISO_INSTANT",
  "lastLoginAt": "ISO_INSTANT",
  "lastActivityAt": "ISO_INSTANT",
  "reportsAgainstUser": 0,
  "blocksByUser": 0,
  "blocksAgainstUser": 0,
  "activeMatches": 0,
  "initiatedChats": 0,
  "interactionsSent": 0,
  "profile": {
    "id": "string",
    "userId": "string",
    "phone": "string",
    "memberId": "string",
    "onboardingComplete": true,
    "onboardingCompletedAt": "ISO_INSTANT",
    "profileComplete": true,
    "profileCompletedAt": "ISO_INSTANT",
    "firstProfileCompletedAt": "ISO_INSTANT",
    "profileCreationPercentage": 100,
    "basicDetails": {
      "profileCreatedFor": "string | null",
      "fullName": "string | null",
      "gender": "string | null",
      "dateOfBirth": "string | null",
      "maritalStatus": "string | null",
      "height": 170,
      "city": "string | null",
      "state": "string | null",
      "country": "string | null",
      "ethnicity": "string | null"
    },
    "careerEducation": {
      "education": "string | null",
      "profession": "string | null",
      "industry": "string | null",
      "incomeBandId": "string | null",
      "incomeLabel": "string | null",
      "incomePerYearUsd": 0,
      "incomeCurrency": "string | null",
      "savingAssetsBandId": "string | null",
      "savingAssetsLabel": "string | null",
      "savingAssetsCurrency": "string | null",
      "savingAssetsUsd": 0
    },
    "faithPractice": {
      "sect": "string | null",
      "caste": "string | null",
      "islamicDress": "string | null",
      "religiousPractice": "string | null",
      "bornMuslim": "string | null",
      "faithPoints": ["string"]
    },
    "personality": {
      "personalityPoints": ["string"]
    },
    "health": {
      "smoke": "string | null",
      "alcohol": "string | null",
      "emotionalWellBeing": "string | null",
      "therapyStatus": "string | null",
      "physicalHealth": "string | null",
      "marryingWithHealthChallenges": "string | null",
      "halalFood": "string | null"
    },
    "family": {
      "familyType": "string | null",
      "familyStatus": "string | null",
      "fatherOccupation": "string | null",
      "motherOccupation": "string | null",
      "brothers": "string | null",
      "sisters": "string | null"
    },
    "mediaGallery": {
      "items": [
        {
          "publicId": "string",
          "url": "string",
          "type": "image",
          "orderIndex": 0,
          "createdAt": "ISO_INSTANT",
          "accessMode": "public",
          "format": "jpg",
          "moderationState": "PENDING_REVIEW",
          "moderationReasons": [],
          "moderationQueuedAt": "ISO_INSTANT",
          "moderationAttemptCount": 0,
          "lastModerationError": "string | null",
          "decidedAt": "ISO_INSTANT"
        }
      ],
      "visibility": "OPEN"
    },
    "partnerPreferences": {
      "age": { "minAge": 25, "maxAge": 35 },
      "country": ["string"],
      "sect": ["string"],
      "height": { "values": { "minHeight": 150, "maxHeight": 190 }, "isStrict": true },
      "maritalStatus": { "values": ["string"], "isStrict": true },
      "state": { "values": ["string"], "isStrict": true },
      "city": { "values": ["string"], "isStrict": true },
      "caste": { "values": ["string"], "isStrict": true },
      "ethnicity": { "values": ["string"], "isStrict": true },
      "education": { "values": ["string"], "isStrict": true },
      "profession": { "values": ["string"], "isStrict": true },
      "savingAssets": { "values": "string | null", "isStrict": true },
      "income": { "values": "string | null", "isStrict": true },
      "religiousPractice": { "values": ["string"], "isStrict": true },
      "bornMuslim": { "values": "string | null", "isStrict": true },
      "smoke": { "values": "string | null", "isStrict": true },
      "alcohol": { "values": "string | null", "isStrict": true },
      "islamicDress": { "values": ["string"], "isStrict": true }
    },
    "bio": "string",
    "bioModerationStatus": "APPROVED | PENDING_REVIEW | REJECTED",
    "bioModerationReasons": ["string"],
    "bioModeratedAt": "ISO_INSTANT",
    "subscribed": true,
    "lastSeen": "ISO_INSTANT",
    "verifiedProfile": true,
    "createdAt": "ISO_INSTANT",
    "location": {
      "latitude": 12.34,
      "longitude": 56.78,
      "updatedAt": "ISO_INSTANT"
    },
    "approvedPhotoCount": 0,
    "profileStatus": "APPROVED | PENDING | REJECTED",
    "photoFirstApprovedAt": "ISO_INSTANT",
    "contactPrivacy": "PREMIUM | PREFERENCE",
    "accountStatus": "ACTIVE | DELETED | BANNED",
    "deletedAt": "ISO_INSTANT",
    "purgeAt": "ISO_INSTANT"
  }
}
```

Detail endpoints now include the full nested `UserProfile` document in `profile`, while list endpoints stay lightweight. Any nested object may be **omitted** or **null** depending on what was stored in MongoDB.

## 2.4 `AdminSalesLeadDetailResponse`

Top-level fields (plus required **`profile`**, identical to §2.3 — omitted in this snippet for length):

```json
{
  "otpVerified": true,
  "profileRegistered": true,
  "signupAt": "ISO_INSTANT",
  "otpVerifiedAt": "ISO_INSTANT",
  "lastLoginAt": "ISO_INSTANT",
  "lastActivityAt": "ISO_INSTANT",
  "reportsAgainstUser": 0,
  "blocksByUser": 0,
  "blocksAgainstUser": 0,
  "activeMatches": 0,
  "initiatedChats": 0,
  "interactionsSent": 0,
  "salesStatus": "CALL_REMAINING",
  "note": "Latest note text or null",
  "notes": [
    {
      "text": "Earlier note",
      "adminUserId": "admin-super-1",
      "createdAt": "ISO_INSTANT"
    }
  ],
  "followUpAt": "ISO_INSTANT",
  "lastCalledAt": "ISO_INSTANT",
  "assignedToAdminId": "SALES001",
  "claimedAt": "ISO_INSTANT",
  "outcomeReason": "PRICE_ISSUE",
  "convertedAt": "ISO_INSTANT",
  "leadScore": 72,
  "salesCreatedAt": "ISO_INSTANT",
  "salesUpdatedAt": "ISO_INSTANT"
}
```

- **`profile`:** required on the wire; same tree as **`profile`** inside `AdminUserDetailResponse` (§2.3).
- **`salesStatus`:** string name of `AdminSalesStatus`; if no lead row exists yet, backend treats lead as **`CALL_REMAINING`**.
- **`notes`:** chronological note history (`AdminSalesNoteEntry`); may be `[]`.
- Nullable instants (`signupAt`, `followUpAt`, etc.) may be JSON **`null`** when source `AuthInfo` or lead fields are missing.

## 2.4.1 `AdminSalesLeadSummary` (sales list row)

Used by `GET /sales/leads`, `GET /sales/follow-ups`, and follow-up queue tabs. Lightweight — no nested `profile`.

```json
{
  "userId": "user-abc-123",
  "memberId": "M10042",
  "phone": "+919876543210",
  "fullName": "Priya Sharma",
  "gender": "Female",
  "city": "Lucknow",
  "state": "Uttar Pradesh",
  "country": "India",
  "createdAt": "2026-06-20T08:15:00.000Z",
  "profileStatus": "APPROVED",
  "accountStatus": "ACTIVE",
  "subscribed": false,
  "salesStatus": "CALL_REMAINING",
  "note": null,
  "followUpAt": null,
  "lastCalledAt": null,
  "assignedToAdminId": null,
  "claimedAt": null,
  "outcomeReason": null,
  "convertedAt": null,
  "leadScore": 68,
  "updatedAt": null
}
```

- **`salesStatus`:** effective status (`CALL_REMAINING` when no lead document exists).
- **`leadScore`:** 0–100 priority hint; with `sort=leadScore`, ordering is **within the current page only**.
- **`outcomeReason`:** set when status is `NOT_INTERESTED` or `CALL_NOT_PICKED`; otherwise usually `null`.

**Sales SPA:** see [`FRONTEND_SALES_API_CONTRACT.md`](./FRONTEND_SALES_API_CONTRACT.md) for pool/claim workflow, UI button rules, and complete endpoint examples.

## 2.5 `AdminReportDetailResponse` / list row

List and detail use the same field set; **`reason`** and **`reportTargetType`** serialize as enum **names** (strings).

```json
{
  "reportId": "string",
  "reporterUserId": "string",
  "reportedUserId": "string",
  "reason": "HARASSMENT",
  "reportTargetType": "PROFILE",
  "details": "string",
  "createdAt": "ISO_INSTANT"
}
```

**`ReportReason`:** `HARASSMENT`, `FAKE_PROFILE`, `INAPPROPRIATE_CONTENT`, `SPAM_OR_SCAM`, `NOT_INTERESTED_IN_THIS_PERSON`, `UNDERAGE_OR_MINOR`, `NUDITY`, `PERSONAL`, `HATE_SPEECH`, `OTHER`

**`ReportTargetType`:** `PROFILE`, `PHOTO`, `BIO`, `NAME`

## 3) Endpoint Catalog

Base URL assumed: **`/api/admin`** (see §0).

Resource prefixes:

| Area | Prefix |
|------|--------|
| Analytics | `/api/admin/analytics` |
| Users | `/api/admin/users` |
| Reports | `/api/admin/reports` |
| Sales | `/api/admin/sales` |
| Auth | `/api/admin/auth` |

Relative URLs below omit `/api/admin`; prepend it for absolute paths.

## 3.1 Analytics

All analytics endpoints are `GET` and require bearer token.

### Common query parameters

- `start` (optional, ISO instant)
- `end` (optional, ISO instant)
- `granularity` (optional for most endpoints): `daily | weekly | monthly`

### A) Overview

- **URL:** `/analytics/overview`
- **Params:** `start`, `end`, `granularity`
- **Response:** `AdminMetricsResponse`
- **Typical metric keys:** `otp_verified`, `onboarding_completed`, `onboarding_dropoff`, `paid_users`, `matches`, `active_users`, `reports`, `interactions`, `unique_interaction_initiators`, `chat_messages`, `chat_initiated`, `photo_uploads`, `account_deleted`, `deleted_gender_ratio`, `profile_rejected`, `bio_moderation_rejected`, `selfie_verification_rate`, `like_limit_reached`

### B) Funnel

- **URL:** `/analytics/funnel`
- **Params:** `start`, `end`, `granularity`
- **Response:** `AdminMetricsResponse`
- **Typical metric keys:** `otp_requested`, `otp_verified`, `onboarding_completed`, `onboarding_dropoff`
- **`otp_requested`:** Counts `auth_info` rows whose **`lastOtpRequestedAt`** falls in `[start, end)` (most recent OTP **request** time; **not** cleared on successful verify). Same field as `/analytics/otp` `otp_requested`.

### C) Revenue

- **URL:** `/analytics/revenue`
- **Params:** `start`, `end`, `granularity`
- **Response:** `AdminMetricsResponse`
- **Typical metric keys:** `subscription_purchases`, `revenue_inr`

### D) Matching

- **URL:** `/analytics/matching`
- **Params:** `start`, `end`, `granularity`
- **Response:** `AdminMetricsResponse`
- **Typical metric keys:** `interest_sent`, `passes`, `shortlists`, `profile_visits`, `matches_created`

### E) Chat

- **URL:** `/analytics/chat`
- **Params:** `start`, `end`, `granularity`
- **Response:** `AdminMetricsResponse`
- **Typical metric keys:** `chat_messages`, `chat_initiated`

### F) Safety

- **URL:** `/analytics/safety`
- **Params:** `start`, `end`, `granularity`
- **Response:** `AdminMetricsResponse`
- **Typical metric keys:** `user_reports`, `user_blocks`, `selfie_verified`, `selfie_failed`

### G) Demographics

- **URL:** `/analytics/demographics`
- **Params:** `start`, `end`
- **Response:** `AdminMetricsResponse`
- **Typical metric keys:** `gender_ratio`, `city_distribution`, `country_distribution`
- **Breakdown semantics:** Each metric filters profiles by `createdAt` in `[start, end)`. `breakdown` lists the **top N** categories by count (gender N=10, city/country N=20). Remaining users are rolled into a single bucket **`Other`** (only present when that remainder is greater than zero). For each card, **`total`** equals the sum of all `breakdown` entries (including `Other` when present). `Other` aggregates every category outside the top N, not a literal profile field value.

### H) Retention

- **URL:** `/analytics/retention`
- **Params:** `cohortStart`, `cohortEnd`
- **Response:** `AdminMetricsResponse`
- **Typical metric keys:** `retention_d1`, `retention_d7`, `retention_d30`
- **Semantics:** Cohort = `auth_info` rows whose `createdAt` falls in `[cohortStart, cohortEnd)`. For each user, **last seen** = the **later** of `lastActivityAt` (OTP success or token refresh) and `lastLoginAt` (OTP success). Users with **both** fields null are excluded. **`retention_d1` / `d7` / `d30`** count cohort users whose last seen is **not before** signup + 1 / 7 / 30 days (same instant-based rule as before).

### I) Life Together

- **URL:** `/analytics/life-together`
- **Params:** `start`, `end`, `granularity`
- **Response:** `AdminMetricsResponse`
- **Typical metric keys:** `life_together_used`

### J) Selfie Analytics

- **URL:** `/analytics/selfie`
- **Params:** `start`, `end`, `granularity`
- **Response:** `AdminMetricsResponse`
- **Typical metric keys:** `selfie_verified`, `selfie_pending`, `selfie_failed`, `selfie_verification_rate`

### K) Search Index Health

- **URL:** `/analytics/search-index`
- **Params:** `start`, `end`, `granularity` (included for response consistency)
- **Response:** `AdminMetricsResponse`
- **Typical metric keys:** `mongo_profile_count`, `elastic_profile_count`, `index_count_delta`
- **Semantics (Mongo vs ES differ on purpose):**
  - **`mongo_profile_count`** — Count of `user_profiles` in MongoDB where **`onboardingComplete` is `true`** only (excludes users still in onboarding).
  - **`elastic_profile_count`** — Total document count in the Elasticsearch profile index (**unfiltered**). The product does not auto-index profiles until onboarding is complete, so this is “search index size”; the backend does **not** apply an `onboardingComplete` filter on ES for this endpoint.
  - **`index_count_delta`** — `mongo_profile_count - elastic_profile_count` (onboarded-complete Mongo vs total ES docs). Near zero when sync is healthy; a non-zero value can indicate backlog, drift, or legacy index documents.

**Frontend labels:** Prefer copy such as “Onboarding complete (Mongo)” vs “Search index documents” so operators are not confused by different denominators.

### L) OTP Analytics

- **URL:** `/analytics/otp`
- **Params:** `start`, `end`, `granularity`
- **Response:** `AdminMetricsResponse`
- **Typical metric keys:** `otp_requested`, `otp_success`, `otp_failed`
- **Semantics:** Each metric counts **`auth_info`** documents whose timestamp falls in `[start, end)` (per-bucket for `series`).
  - **`otp_requested`** — **`lastOtpRequestedAt`**: updated on every successful **request OTP** API path (send or retry); **not** cleared when the user verifies, so it aligns with login volume. One user per bucket at most (distinct documents). Legacy rows may have null until the user requests OTP again after deploy.
  - **`otp_success`** — **`otpVerifiedAt`** (successful verify time).
  - **`otp_failed`** — **`lastOtpFailedAt`** (last failed verify attempt in range).

### M) Likes Analytics

- **URL:** `/analytics/likes`
- **Params:** `start`, `end`, `granularity`
- **Response:** `AdminMetricsResponse`
- **Typical metric keys:** `likes_used`, `like_limit_reached`

## 3.2 User Management Read APIs

### A) Search users

- **URL:** `/users/search`
- **Method:** `GET`
- **Params:**
  - `query` (optional; matches userId/memberId/phone/fullName)
  - `profileStatus` (optional): `APPROVED` | `PENDING` | `REJECTED` (`ProfileStatus`)
  - `bioModerationStatus` (optional): `PENDING_REVIEW` | `APPROVED` | `REJECTED` (`BioModerationStatus`)
  - `accountStatus` (optional): `ACTIVE` | `DELETED` | `BANNED` (`AccountStatus`)
  - `gender` (optional string)
  - `subscribed` (optional boolean)
  - `createdStart` (optional ISO instant)
  - `createdEnd` (optional ISO instant)
  - `page` (default `0`)
  - `size` (default `20`, max `100`)
- **Response:** `AdminUserSearchResponse`

### B) User detail

- **URL:** `/users/{userId}`
- **Method:** `GET`
- **Response:** `AdminUserDetailResponse`

### C) Convenience filtered user lists

- **URL:** `/users/newly-joined`
  - **Params:** `start`, `end`, `page`, `size`
- **URL:** `/users/profile-rejected`
  - **Params:** `start`, `end`, `page`, `size`
- **URL:** `/users/bio-rejected`
  - **Params:** `start`, `end`, `page`, `size`
- **URL:** `/users/deleted`
  - **Params:** `start`, `end`, `gender`, `page`, `size`

### D) User reports

- **URL:** `/reports`
  - **Method:** `GET`
  - **Params:** `start`, `end`, `reason` (optional; `ReportReason` enum name, see §2.5), `fromUserId`, `toUserId`, `page`, `size`
  - **Response:** `AdminReportSearchResponse` — each row matches §2.5 (`AdminReportSummary` / `AdminReportDetailResponse` field set).
- **URL:** `/reports/{reportId}`
  - **Method:** `GET`
  - **Response:** `AdminReportDetailResponse` (same fields as list row; see §2.5)

## 3.3 Sales Team APIs

Base URL: `/api/admin/sales`

Full paths are therefore: `GET /api/admin/sales/leads`, `GET /api/admin/sales/leads/{userId}`, `PATCH /api/admin/sales/leads/{userId}/status`, etc.

### A) Sales leads list

- **URL:** `/leads`
- **Method:** `GET`
- **Params:**
  - `start`, `end` (optional; filter profiles by `createdAt` with `gte(start)` and `lt(end)` when each is provided; if both omitted, no date filter on `createdAt`)
  - `status` (optional string):
    - Omit, blank, or **`ALL`** → no status filter (include all effective statuses).
    - Otherwise must be an **`AdminSalesStatus`** name: `CALL_REMAINING`, `IN_PROCESS`, `ALREADY_CALLED`, `CALL_NOT_PICKED`, `CALL_BACK_LATER`, `INTERESTED`, `NOT_INTERESTED`, `CONVERTED` (case-insensitive).
  - `followUpStart`, `followUpEnd` (optional; filter leads whose `followUpAt` is within `[followUpStart, followUpEnd)`; leads with no follow-up date are excluded when either bound is set)
  - `query` (optional; matches userId/memberId/phone/fullName)
  - **Profile filters (optional; same semantics as `GET /users/search` on `user_profiles`):**
    - `profileStatus` — `APPROVED` | `PENDING` | `REJECTED` (`ProfileStatus`)
    - `accountStatus` — `ACTIVE` | `DELETED` | `BANNED` (`AccountStatus`). The API does **not** default this; the Sales UI should usually send **`ACTIVE`** so deleted/banned members are excluded from the call queue.
    - `gender` — exact match on `basicDetails.gender` (trimmed string), same as user search.
    - `subscribed` — boolean filter on `user_profiles.subscribed`.
    - `verifiedProfile` — boolean filter on `user_profiles.verifiedProfile`.
    - `birthYear` (optional integer, 1900–2100) — keeps profiles whose `basicDetails.dateOfBirth` is an ISO `yyyy-MM-dd` string **born in that calendar year** (prefix match `yyyy-` on the stored string). Invalid years return **400**.
    - `maritalStatus` (optional string) — exact match on `basicDetails.maritalStatus` after trim (values are whatever the app stores, e.g. `Never married`).
    - `state` (optional string) — exact match on `basicDetails.state` after trim.
    - `city` (optional string) — exact match on `basicDetails.city` after trim.
  - **Assignment / pool filters (optional):**
    - `pool=true` — leads available to claim (unassigned `CALL_REMAINING` or stale `IN_PROCESS`).
    - `assignedToAdminId` — staff **`employeeId`**, or **`UNASSIGNED`**.
    - `assignedToMe=true` — leads assigned to logged-in staff (`employeeId` from JWT).
    - `sort=leadScore` — sort by computed priority score (within page).
  - `page` (default `0`)
  - `size` (default `20`, max `100`)
- **Response:** `AdminSalesLeadSearchResponse` with lightweight user+sales summary rows.
- **Pagination `total`:** `total` is always the **global** count of rows matching **all** filters (profile + sales `status` + follow-up range), after applying the same rules as the current page. Sales `status` and follow-up filters are applied **before** pagination so each page reflects the filtered queue.
- **`SALES_AGENT` list scoping:** the API does **not** auto-restrict list results to assigned leads. Sales UIs must pass **`pool=true`** (shared queue) and/or **`assignedToMe=true`** (my leads). Detail reads enforce pool + assignment rules separately (see [`FRONTEND_SALES_API_CONTRACT.md`](./FRONTEND_SALES_API_CONTRACT.md) §8).

### B) Sales lead detail

- **URL:** `/leads/{userId}`
- **Method:** `GET`
- **Response:** `AdminSalesLeadDetailResponse` (§2.4 + full `profile` per §2.3)
  - Includes full nested `UserProfile` **`profile`**
  - Includes auth snapshot, admin counters, sales status, latest `note`, `notes[]`, follow-up and call metadata

### C) Update sales status

- **URL:** `/leads/{userId}/status`
- **Method:** `PATCH`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer …`
- **Body (`UpdateSalesStatusRequest`):**

```json
{
  "status": "NOT_INTERESTED",
  "outcomeReason": "PRICE_ISSUE",
  "lastCalledAt": "2026-06-27T10:00:00.000Z"
}
```

- **`status`:** required (`AdminSalesStatus`).
- **`outcomeReason`:** **required** when `status` is **`NOT_INTERESTED`** or **`CALL_NOT_PICKED`**; otherwise omit or send `null` (server clears stored reason).
- **`lastCalledAt`:** optional. If omitted/`null` and `status` is **`ALREADY_CALLED`** or **`CALL_NOT_PICKED`**, the server sets `lastCalledAt` to the current time automatically.
- Setting **`CONVERTED`** sets `convertedAt` to now.
- **Response:** **`AdminSalesLeadDetailResponse`** (same shape as GET detail) — useful to refresh UI without a second GET.

### D) Update note

- **URL:** `/leads/{userId}/note`
- **Method:** `PATCH`
- **Body (`UpdateSalesNoteRequest`):**

```json
{
  "note": "User interested, call again next week.",
  "adminUserId": "SALES001"
}
```

- **`note`:** required, non-blank after trim.
- **`adminUserId`:** stored on the appended `AdminSalesNoteEntry`; use staff **`employeeId`** from login (e.g. `SALES001`), not email.
- **Response:** **`AdminSalesLeadDetailResponse`**.

### E) Update follow-up

- **URL:** `/leads/{userId}/follow-up`
- **Method:** `PATCH`
- **Body (`UpdateSalesFollowUpRequest`):**

```json
{
  "followUpAt": "ISO_INSTANT"
}
```

- **`followUpAt`:** may be `null` to clear follow-up (request body may be `{}` or `{ "followUpAt": null }` depending on client defaults).
- **Response:** **`AdminSalesLeadDetailResponse`**.

### F) Claim / release (pool workflow)

- **URL:** `/leads/{userId}/claim`
- **Method:** `POST`
- **Permission:** any sales writer (`SALES_AGENT`+).
- Atomically sets `status=IN_PROCESS`, `assignedToAdminId=current employeeId`, `claimedAt=now`.
- **409** if actively claimed by another agent (message: `"Lead is already claimed by another agent"`).
- **Response:** **`AdminSalesLeadDetailResponse`**.

- **URL:** `/leads/{userId}/release`
- **Method:** `POST`
- Assignee or manager+ clears assignee and returns lead to pool (`CALL_REMAINING`).
- **Response:** **`AdminSalesLeadDetailResponse`**.

### G) Assign lead (manager override)

- **URL:** `/leads/{userId}/assign`
- **Method:** `PATCH`
- **Permission:** `SALES_MANAGER` or above only.
- **Body (`AssignSalesLeadRequest`):**

```json
{
  "assignedToAdminId": "SALES001"
}
```

- **`assignedToAdminId`:** staff **`employeeId`** of an **ACTIVE** `SALES_AGENT` or `SALES_MANAGER`; send `null` to unassign.
- **Response:** **`AdminSalesLeadDetailResponse`**.

### H) Follow-up queue

- **URL:** `/follow-ups`
- **Method:** `GET`
- **Params:**
  - `bucket` (default `due_today`): `due_today` | `overdue` | `upcoming` — buckets use **UTC calendar days** on `followUpAt`:
    - **`due_today`:** `[today 00:00 UTC, tomorrow 00:00 UTC)`
    - **`overdue`:** `< today 00:00 UTC`
    - **`upcoming`:** `[tomorrow 00:00 UTC, today+7 days 00:00 UTC)`
  - `assignedToMe` (optional boolean)
  - `page`, `size`
- **Response:** `AdminSalesLeadSearchResponse` (§2.4.1 list rows)

### I) Activity timeline

- **URL:** `/leads/{userId}/activities`
- **Method:** `GET`
- **Params:** optional `type` (`AdminSalesActivityType`: `CLAIMED`, `RELEASED`, `STATUS_CHANGED`, `NOTE_ADDED`, `FOLLOW_UP_SET`, `WHATSAPP_SENT`, `CONVERTED`, `ASSIGNED`), `page`, `size`
- **Response:** `AdminSalesActivitySearchResponse`

```json
{
  "items": [
    {
      "id": "activity-id",
      "userId": "user-abc-123",
      "type": "STATUS_CHANGED",
      "message": "Status changed to INTERESTED",
      "metadata": { "from": "IN_PROCESS", "to": "INTERESTED" },
      "actorEmployeeId": "SALES001",
      "createdAt": "2026-06-27T10:00:00.000Z"
    }
  ],
  "page": 0,
  "size": 20,
  "total": 15
}
```

### J) Communications

- **URL:** `/leads/{userId}/communications`
- **GET:** paginated WhatsApp history (activities where `type=WHATSAPP_SENT`); same response shape as §3.3 I.
- **POST:** log outbound message; body (`CreateAdminSalesCommunicationRequest`):

```json
{
  "channel": "WHATSAPP",
  "templateName": "intro_v1",
  "note": "Sent plan details"
}
```

- **`channel`:** required (non-blank). Use **`WHATSAPP`** for WhatsApp log entries.
- **Response (POST):** `AdminSalesLeadDetailResponse` (updated lead, not activity list).

### K) Conversions

- **URL:** `/conversions`
- **Method:** `GET`
- **Params:** `start`, `end` (profile `createdAt` range), `assignedToAdminId` (staff `employeeId`), `page`, `size`
- Subscribed profiles joined with sales assignee metadata.
- **Response:** `AdminSalesConversionSearchResponse`

```json
{
  "items": [
    {
      "userId": "user-abc-123",
      "memberId": "M10042",
      "fullName": "Priya Sharma",
      "phone": "+919876543210",
      "assignedToAdminId": "SALES001",
      "convertedAt": "2026-06-28T11:00:00.000Z",
      "subscribedAt": "2026-06-20T08:15:00.000Z"
    }
  ],
  "page": 0,
  "size": 20,
  "total": 42
}
```

### L) Agent performance

- **URL:** `/agents/performance`
- **Method:** `GET`
- **Params:** `start`, `end` (optional; filter leads by `updatedAt`), `employeeId`
  - **`SALES_AGENT`:** omit or `employeeId=self` → only own row
  - **Manager+:** omit → all sales staff; or filter one `employeeId`
- **Response:** `AdminSalesAgentPerformanceResponse`

```json
{
  "items": [
    {
      "employeeId": "SALES001",
      "name": "Sales Agent 1",
      "claimedCount": 45,
      "callsCount": 38,
      "interestedCount": 12,
      "convertedCount": 3,
      "overdueFollowUps": 2,
      "avgMinutesToFirstCall": 18.5
    }
  ]
}
```

`avgMinutesToFirstCall` may be JSON **`null`**.

### M) Saved filter views

- **URL:** `/saved-views`
- **POST** body:

```json
{
  "name": "Approved unsubscribed UP",
  "filtersJson": "{\"pool\":true,\"state\":\"Uttar Pradesh\",\"subscribed\":false,\"profileStatus\":\"APPROVED\"}"
}
```

- **`filtersJson`:** string containing JSON of `GET /leads` query keys (see [`FRONTEND_SALES_API_CONTRACT.md`](./FRONTEND_SALES_API_CONTRACT.md) §11).
- **GET:** agents see own views only; managers may pass `employeeId` filter.
- **PATCH** `/{viewId}`: optional `name`, `filtersJson`.
- **DELETE** `/{viewId}`: no body.
- **Response row:** `AdminSalesSavedViewSummary` — `id`, `ownerEmployeeId`, `name`, `filtersJson`, `createdAt`, `updatedAt`.

### N) Sales summary

- **URL:** `/summary`
- **Method:** `GET`
- **Params:** `start`, `end`
- **Response:** `AdminMetricsResponse`
- **Metric keys:** `sales_total_leads` (profiles created in range), then one card per status: `sales_call_remaining`, `sales_in_process`, `sales_already_called`, `sales_call_not_picked`, `sales_call_back_later`, `sales_interested`, `sales_not_interested`, `sales_converted`, plus `sales_follow_up_due_today`, `sales_follow_up_overdue` (UTC day buckets on `followUpAt`).

## 3.4 Admin Staff APIs

Base URL: `/api/admin/staff`

Requires staff-management permission (`SUPER_ADMIN`, `SALES_MANAGER`, or bootstrap `ROLE_ADMIN`).

### A) Create staff

- **URL:** `/`
- **Method:** `POST`
- **Body (`CreateAdminStaffRequest`):**

```json
{
  "employeeId": "SALES001",
  "name": "Sales Agent 1",
  "email": "sales1@qalbi.co.in",
  "phone": "+91...",
  "password": "minimum-8-chars",
  "role": "SALES_AGENT"
}
```

- Only **`SUPER_ADMIN`** may create or modify **`SUPER_ADMIN`** users.
- **`employeeId`** and **`email`** must be unique.

### B) List staff

- **URL:** `/`
- **Method:** `GET`
- **Params:** `role`, `status`, `query`, `page`, `size`
- **Response:** `AdminStaffSearchResponse`

### C) Staff detail

- **URL:** `/{staffId}`
- **Method:** `GET`
- **`staffId`:** Mongo `_id` or **`employeeId`**.

### D) Update staff

- **URL:** `/{staffId}`
- **Method:** `PATCH`
- **Body (`UpdateAdminStaffRequest`):** optional `name`, `phone`, `role`

### E) Update staff status

- **URL:** `/{staffId}/status`
- **Method:** `PATCH`
- **Body:** `{ "status": "ACTIVE" | "DISABLED" }`

### F) Reset password

- **URL:** `/{staffId}/password`
- **Method:** `PATCH`
- **Body:** `{ "password": "new-password-min-8" }`

## 4) Frontend Pages Suggested

## 4.1 Login Page

- Form: `adminUserId`, `adminSecret`
- Calls: `POST /api/admin/auth/token`
- On success: store token and go to dashboard

## 4.2 Dashboard (Overview)

- Cards from `overview` endpoint
- Date range picker + granularity selector
- Line/bar charts from `series`

## 4.3 Funnel Page

- Use `funnel` metrics
- Show conversion and drop-off

## 4.4 Revenue Page

- Use `revenue`
- Show purchases, revenue total, plan breakdown pie/table

## 4.5 Matching/Chat/Safety Pages

- Dedicated charts and tables per endpoint
- Reuse date range + granularity controls

## 4.5.1 Additional analytics pages

- Life Together page: `/analytics/life-together`
- Selfie analytics page: `/analytics/selfie`
- Search-index health widget/page: `/analytics/search-index`
  - Show **Mongo** as onboarded-complete only (`mongo_profile_count`); **ES** as total index documents (`elastic_profile_count`); delta is their difference (see §3.1 K).
- OTP analytics page: `/analytics/otp`
- Likes analytics page: `/analytics/likes`

## 4.6 Demographics Page

- Use `demographics`
- Display `breakdown` by gender/city/country (top N plus optional **Other** so slice totals match each card’s `total`)

## 4.7 Retention Page

- Use `retention` with cohort date inputs
- Show D1/D7/D30 cards

## 4.8 User Directory + Detail

- Search/list via `/users/search`
- Open detail drawer/page via `/users/{userId}`
- Add quick tabs for `/users/newly-joined`, `/users/profile-rejected`, `/users/bio-rejected`, `/users/deleted`

## 4.9 Reports page

- Use `/reports` with date/reason/from/to filters
- Open report detail via `/reports/{reportId}`
- Both reporter and reported user IDs should be tappable to open `/users/{userId}`

## 4.10 Sales Team Page

**Dedicated sales SPA:** full workflow, permissions, and copy-paste examples in [`FRONTEND_SALES_API_CONTRACT.md`](./FRONTEND_SALES_API_CONTRACT.md).

- **Pool:** `GET /sales/leads?pool=true` with **`accountStatus=ACTIVE`** (and usually **`profileStatus=APPROVED`**, **`subscribed=false`**).
- **My leads:** `GET /sales/leads?assignedToMe=true`.
- **Claim / release:** `POST …/claim` (handle **409**), `POST …/release`.
- Every lead row opens `GET /sales/leads/{userId}` detail (full `profile` only on detail).
- Status actions include all **`AdminSalesStatus`** values; **`outcomeReason`** required for `NOT_INTERESTED` and `CALL_NOT_PICKED`.
- Notes: pass **`adminUserId`** = staff **`employeeId`** from login.
- Follow-up queues: `GET /sales/follow-ups?bucket=due_today|overdue|upcoming`.
- PATCH responses return **`AdminSalesLeadDetailResponse`** — no second GET needed.
- List stays lightweight (`AdminSalesLeadSummary` §2.4.1); load full profile only on detail.

## 5) Request/Response Examples for Frontend Dev

### Example: admin token

`POST /api/admin/auth/token`

Headers:

```http
Content-Type: application/json
X-Admin-Secret: <shared-secret>
```

Body:

```json
{
  "adminUserId": "admin-super-1"
}
```

### Example: error body

```json
{
  "timestamp": "2026-05-30T12:00:00.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "User profile not found"
}
```

### Example request (overview)

`GET /api/admin/analytics/overview?start=2026-05-01T00:00:00Z&end=2026-05-08T00:00:00Z&granularity=daily`

Headers:

```http
Authorization: Bearer <admin_access_token>
```

### Example response (overview)

```json
{
  "start": "2026-05-01T00:00:00Z",
  "end": "2026-05-08T00:00:00Z",
  "granularity": "DAILY",
  "metrics": [
    {
      "key": "otp_verified",
      "total": 120,
      "series": [
        { "bucket": "2026-05-01", "value": 18 },
        { "bucket": "2026-05-02", "value": 22 }
      ],
      "breakdown": []
    }
  ]
}
```

### Example: sales status PATCH

`PATCH /api/admin/sales/leads/user-123/status`

Headers:

```http
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

Body:

```json
{
  "status": "CALL_NOT_PICKED",
  "outcomeReason": "NO_RESPONSE",
  "lastCalledAt": null
}
```

When `status` is `ALREADY_CALLED` or `CALL_NOT_PICKED` and `lastCalledAt` is omitted/null, the server stamps **`lastCalledAt`** to the current time.

**Response:** same JSON shape as **`AdminSalesLeadDetailResponse`** (§2.4 + full `profile` §2.3) — elided here.

## 6) Frontend Integration Notes

- Use **`Content-Type: application/json`** on `POST`/`PATCH` bodies (including sales updates).
- Timezone: send UTC ISO timestamps from frontend to avoid off-by-one day issues.
- `granularity` accepted values are case-insensitive (`daily|weekly|monthly` preferred).
- Handle empty arrays safely (`series: []`, `breakdown: []`).
- Some metrics may be absent depending on data availability; render defensively by `key`.
- On **`401`**, clear the session and return to login (see §1).
- On **`403`**, show “not allowed” (do not loop token refresh indefinitely).
- Parse **`ErrorResponse`** (`timestamp`, `status`, `error`, `message`) for user-visible error text (see §1).

## 7) TypeScript interfaces

The following mirrors backend DTOs (`com.qalbiapp.myapp.admin.dto.*`, `userprofile.model.*`, `media.model.Media`). Instants serialize as ISO-8601 strings in JSON.

```ts
/** ISO-8601 instant from server JSON */
export type IsoInstant = string;

export interface ErrorResponse {
  timestamp: IsoInstant;
  status: number;
  error: string;
  message: string;
}

// --- Auth ---

export interface AdminTokenRequest {
  adminUserId: string;
}

export interface AdminTokenResponse {
  accessToken: string;
  expiresAt: IsoInstant;
  scope: string;
  roles: string[];
  sessionId: string;
}

// --- Analytics ---

export type Granularity = "DAILY" | "WEEKLY" | "MONTHLY";

export interface AdminMetricPoint {
  bucket: string;
  value: number;
}

export interface AdminBreakdownItem {
  key: string;
  value: number;
}

export interface AdminMetricCard {
  key: string;
  total: number;
  series: AdminMetricPoint[];
  breakdown: AdminBreakdownItem[];
}

export interface AdminMetricsResponse {
  start: string;
  end: string;
  granularity: Granularity;
  metrics: AdminMetricCard[];
}

// --- User profile (nested on user detail + sales detail) ---

export type ProfileStatus = "APPROVED" | "PENDING" | "REJECTED";
export type BioModerationStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";
export type AccountStatus = "ACTIVE" | "DELETED" | "BANNED";
export type ContactPrivacy = "PREMIUM" | "PREFERENCE";
export type MediaModerationState = "PENDING_REVIEW" | "APPROVED" | "REJECTED";
export type GalleryVisibility = "OPEN" | "BLUR_ALL" | "SHOW_TO_LIKED";

export interface BasicDetails {
  profileCreatedFor?: string | null;
  fullName?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  maritalStatus?: string | null;
  height?: number | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  ethnicity?: string | null;
}

export interface Location {
  latitude: number;
  longitude: number;
  updatedAt?: IsoInstant | null;
}

export interface CareerEducation {
  education?: string | null;
  profession?: string | null;
  industry?: string | null;
  incomeBandId?: string | null;
  incomeLabel?: string | null;
  incomePerYearUsd?: number | null;
  incomeCurrency?: string | null;
  savingAssetsBandId?: string | null;
  savingAssetsLabel?: string | null;
  savingAssetsCurrency?: string | null;
  savingAssetsUsd?: number | null;
}

export interface FaithPractice {
  sect?: string | null;
  caste?: string | null;
  islamicDress?: string | null;
  religiousPractice?: string | null;
  bornMuslim?: string | null;
  faithPoints?: string[] | null;
}

export interface Personality {
  personalityPoints?: string[] | null;
}

export interface Health {
  smoke?: string | null;
  alcohol?: string | null;
  emotionalWellBeing?: string | null;
  therapyStatus?: string | null;
  physicalHealth?: string | null;
  marryingWithHealthChallenges?: string | null;
  halalFood?: string | null;
}

export interface Family {
  familyType?: string | null;
  familyStatus?: string | null;
  fatherOccupation?: string | null;
  motherOccupation?: string | null;
  brothers?: string | null;
  sisters?: string | null;
}

export interface Media {
  publicId?: string | null;
  url?: string | null;
  type?: string | null;
  orderIndex?: number;
  createdAt?: IsoInstant | null;
  accessMode?: string | null;
  format?: string | null;
  moderationState?: MediaModerationState | null;
  moderationReasons?: string[] | null;
  moderationQueuedAt?: IsoInstant | null;
  moderationAttemptCount?: number;
  lastModerationError?: string | null;
  decidedAt?: IsoInstant | null;
}

export interface MediaGallery {
  items?: Media[] | null;
  visibility?: GalleryVisibility | null;
}

export interface Age {
  minAge?: number | null;
  maxAge?: number | null;
}

export interface Height {
  minHeight?: number | null;
  maxHeight?: number | null;
}

export interface FilterField<T> {
  values?: T | null;
  isStrict?: boolean;
}

export interface PartnerPreferences {
  age?: Age | null;
  country?: string[] | null;
  sect?: string[] | null;
  height?: FilterField<Height> | null;
  maritalStatus?: FilterField<string[]> | null;
  state?: FilterField<string[]> | null;
  city?: FilterField<string[]> | null;
  caste?: FilterField<string[]> | null;
  ethnicity?: FilterField<string[]> | null;
  education?: FilterField<string[]> | null;
  profession?: FilterField<string[]> | null;
  savingAssets?: FilterField<string | null> | null;
  income?: FilterField<string | null> | null;
  religiousPractice?: FilterField<string[]> | null;
  bornMuslim?: FilterField<string | null> | null;
  smoke?: FilterField<string | null> | null;
  alcohol?: FilterField<string | null> | null;
  islamicDress?: FilterField<string[]> | null;
}

export interface UserProfile {
  id?: string | null;
  userId?: string | null;
  phone?: string | null;
  memberId?: string | null;
  onboardingComplete?: boolean;
  onboardingCompletedAt?: IsoInstant | null;
  profileComplete?: boolean;
  profileCompletedAt?: IsoInstant | null;
  firstProfileCompletedAt?: IsoInstant | null;
  profileCreationPercentage?: number;
  basicDetails?: BasicDetails | null;
  careerEducation?: CareerEducation | null;
  faithPractice?: FaithPractice | null;
  personality?: Personality | null;
  health?: Health | null;
  family?: Family | null;
  mediaGallery?: MediaGallery | null;
  partnerPreferences?: PartnerPreferences | null;
  bio?: string | null;
  bioModerationStatus?: BioModerationStatus | null;
  bioModerationReasons?: string[] | null;
  bioModeratedAt?: IsoInstant | null;
  subscribed?: boolean;
  lastSeen?: IsoInstant | null;
  verifiedProfile?: boolean;
  createdAt?: IsoInstant | null;
  location?: Location | null;
  approvedPhotoCount?: number;
  profileStatus?: ProfileStatus | null;
  photoFirstApprovedAt?: IsoInstant | null;
  contactPrivacy?: ContactPrivacy | null;
  accountStatus?: AccountStatus | null;
  deletedAt?: IsoInstant | null;
  purgeAt?: IsoInstant | null;
}

// --- Users ---

export interface AdminUserSummary {
  userId: string;
  memberId: string | null;
  phone: string | null;
  fullName: string | null;
  gender: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  subscribed: boolean;
  profileStatus: string | null;
  accountStatus: string | null;
  createdAt: IsoInstant | null;
  lastLoginAt: IsoInstant | null;
  lastActivityAt: IsoInstant | null;
}

export interface AdminUserSearchResponse {
  items: AdminUserSummary[];
  page: number;
  size: number;
  total: number;
}

export interface AdminUserDetailResponse {
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
  otpVerified: boolean;
  profileRegistered: boolean;
  signupAt: IsoInstant | null;
  otpVerifiedAt: IsoInstant | null;
  onboardingCompletedAt: IsoInstant | null;
  profileCompletedAt: IsoInstant | null;
  lastLoginAt: IsoInstant | null;
  lastActivityAt: IsoInstant | null;
  reportsAgainstUser: number;
  blocksByUser: number;
  blocksAgainstUser: number;
  activeMatches: number;
  initiatedChats: number;
  interactionsSent: number;
  profile: UserProfile;
}

// --- Reports ---

export type ReportReason =
  | "HARASSMENT"
  | "FAKE_PROFILE"
  | "INAPPROPRIATE_CONTENT"
  | "SPAM_OR_SCAM"
  | "NOT_INTERESTED_IN_THIS_PERSON"
  | "UNDERAGE_OR_MINOR"
  | "NUDITY"
  | "PERSONAL"
  | "HATE_SPEECH"
  | "OTHER";

export type ReportTargetType = "PROFILE" | "PHOTO" | "BIO" | "NAME";

export interface AdminReportSummary {
  reportId: string;
  reporterUserId: string;
  reportedUserId: string;
  reason: ReportReason;
  reportTargetType: ReportTargetType;
  details: string;
  createdAt: IsoInstant;
}

/** Detail payload matches list row shape. */
export type AdminReportDetailResponse = AdminReportSummary;

export interface AdminReportSearchResponse {
  items: AdminReportSummary[];
  page: number;
  size: number;
  total: number;
}

// --- Sales ---

export type AdminSalesStatus =
  | "CALL_REMAINING"
  | "IN_PROCESS"
  | "ALREADY_CALLED"
  | "CALL_NOT_PICKED"
  | "CALL_BACK_LATER"
  | "INTERESTED"
  | "NOT_INTERESTED"
  | "CONVERTED";

export type AdminSalesOutcomeReason =
  | "PRICE_ISSUE"
  | "NOT_LOOKING_NOW"
  | "WRONG_NUMBER"
  | "NO_RESPONSE"
  | "ALREADY_MARRIED"
  | "COMPETITOR"
  | "LANGUAGE_BARRIER"
  | "OTHER";

/** Query params for `GET /api/admin/sales/leads` (build from form state). */
export interface SalesLeadsFilters {
  start?: IsoInstant;
  end?: IsoInstant;
  status?: AdminSalesStatus | "ALL";
  followUpStart?: IsoInstant;
  followUpEnd?: IsoInstant;
  query?: string;
  profileStatus?: ProfileStatus;
  accountStatus?: AccountStatus;
  gender?: string;
  subscribed?: boolean;
  verifiedProfile?: boolean;
  /** 1900–2100; filters `basicDetails.dateOfBirth` ISO strings for that birth year */
  birthYear?: number;
  /** Exact match on `basicDetails.maritalStatus` (trimmed) */
  maritalStatus?: string;
  state?: string;
  city?: string;
  pool?: boolean;
  /** Staff employeeId, or literal UNASSIGNED */
  assignedToAdminId?: string;
  assignedToMe?: boolean;
  sort?: "leadScore";
  page?: number;
  size?: number;
}

export interface AdminSalesNoteEntry {
  text: string;
  adminUserId: string | null;
  createdAt: IsoInstant;
}

export interface AdminSalesLeadSummary {
  userId: string;
  memberId: string | null;
  phone: string | null;
  fullName: string | null;
  gender: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  createdAt: IsoInstant | null;
  profileStatus: string | null;
  accountStatus: string | null;
  subscribed: boolean;
  salesStatus: string;
  note: string | null;
  followUpAt: IsoInstant | null;
  lastCalledAt: IsoInstant | null;
  assignedToAdminId: string | null;
  claimedAt: IsoInstant | null;
  outcomeReason: AdminSalesOutcomeReason | null;
  convertedAt: IsoInstant | null;
  leadScore: number;
  updatedAt: IsoInstant | null;
}

export interface AdminSalesLeadSearchResponse {
  items: AdminSalesLeadSummary[];
  page: number;
  size: number;
  total: number;
}

export interface AdminSalesLeadDetailResponse {
  profile: UserProfile;
  otpVerified: boolean;
  profileRegistered: boolean;
  signupAt: IsoInstant | null;
  otpVerifiedAt: IsoInstant | null;
  lastLoginAt: IsoInstant | null;
  lastActivityAt: IsoInstant | null;
  reportsAgainstUser: number;
  blocksByUser: number;
  blocksAgainstUser: number;
  activeMatches: number;
  initiatedChats: number;
  interactionsSent: number;
  salesStatus: string;
  note: string | null;
  notes: AdminSalesNoteEntry[];
  followUpAt: IsoInstant | null;
  lastCalledAt: IsoInstant | null;
  assignedToAdminId: string | null;
  claimedAt: IsoInstant | null;
  outcomeReason: AdminSalesOutcomeReason | null;
  convertedAt: IsoInstant | null;
  leadScore: number;
  salesCreatedAt: IsoInstant | null;
  salesUpdatedAt: IsoInstant | null;
}

export interface UpdateSalesStatusRequest {
  status: AdminSalesStatus;
  lastCalledAt?: IsoInstant | null;
  outcomeReason?: AdminSalesOutcomeReason | null;
}

export interface UpdateSalesNoteRequest {
  note: string;
  adminUserId: string | null;
}

export interface UpdateSalesFollowUpRequest {
  followUpAt?: IsoInstant | null;
}

export type AdminStaffRole =
  | "SUPER_ADMIN"
  | "SALES_MANAGER"
  | "SALES_AGENT"
  | "SUPPORT";

export type AdminStaffStatus = "ACTIVE" | "DISABLED";

export interface AdminStaffSummary {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string | null;
  role: AdminStaffRole;
  status: AdminStaffStatus;
  createdAt: IsoInstant | null;
  updatedAt: IsoInstant | null;
  lastLoginAt: IsoInstant | null;
}

export interface AdminStaffSearchResponse {
  items: AdminStaffSummary[];
  page: number;
  size: number;
  total: number;
}

export interface AdminStaffLoginResponse {
  accessToken: string;
  expiresAt: IsoInstant;
  scope: string;
  roles: string[];
  sessionId: string;
  staff: AdminStaffSummary;
}

export interface AssignSalesLeadRequest {
  assignedToAdminId?: string | null;
}

export type AdminSalesActivityType =
  | "CLAIMED" | "RELEASED" | "STATUS_CHANGED" | "NOTE_ADDED" | "FOLLOW_UP_SET"
  | "WHATSAPP_SENT" | "CONVERTED" | "ASSIGNED";

export interface AdminSalesActivityEntry {
  id: string;
  userId: string;
  type: AdminSalesActivityType;
  message: string;
  metadata: Record<string, unknown>;
  actorEmployeeId: string | null;
  createdAt: IsoInstant;
}

export interface AdminSalesActivitySearchResponse {
  items: AdminSalesActivityEntry[];
  page: number;
  size: number;
  total: number;
}

export interface CreateAdminSalesCommunicationRequest {
  channel: string;
  templateName?: string | null;
  note?: string | null;
}

export interface AdminSalesConversionSummary {
  userId: string;
  memberId: string | null;
  fullName: string | null;
  phone: string | null;
  assignedToAdminId: string | null;
  convertedAt: IsoInstant | null;
  subscribedAt: IsoInstant | null;
}

export interface AdminSalesConversionSearchResponse {
  items: AdminSalesConversionSummary[];
  page: number;
  size: number;
  total: number;
}

export interface AdminSalesAgentPerformance {
  employeeId: string;
  name: string;
  claimedCount: number;
  callsCount: number;
  interestedCount: number;
  convertedCount: number;
  overdueFollowUps: number;
  avgMinutesToFirstCall: number | null;
}

export interface AdminSalesAgentPerformanceResponse {
  items: AdminSalesAgentPerformance[];
}

export interface AdminSalesSavedViewSummary {
  id: string;
  ownerEmployeeId: string;
  name: string;
  filtersJson: string;
  createdAt: IsoInstant;
  updatedAt: IsoInstant;
}

export interface AdminSalesSavedViewSearchResponse {
  items: AdminSalesSavedViewSummary[];
  page: number;
  size: number;
  total: number;
}

export interface CreateAdminSalesSavedViewRequest {
  name: string;
  filtersJson: string;
}

export interface UpdateAdminSalesSavedViewRequest {
  name?: string;
  filtersJson?: string;
}
```
