# VIP Consultation Leads — Admin API

Admin-panel client guide for the VIP consultation lead dashboard.

VIP leads live in a **separate** collection (`vip_consultation_leads`), not `admin_sales_leads`.  
Ops UX (status, claim, assign, notes, follow-ups) mirrors `/api/admin/sales`, with VIP-specific fields (`requestCount`, price snapshot).

Mobile CTA docs: [VIP_PLAN_API.md](./VIP_PLAN_API.md).

## Base path and auth

- Base path: `/api/admin/vip`
- Auth: same as other admin sales APIs — `ROLE_ADMIN` (and sales staff roles enforced in service for claim/write/assign)
- Content-Type: `application/json`

## Status enum

Reused from admin sales (`AdminSalesStatus`):

| Value |
|---|
| `CALL_REMAINING` |
| `IN_PROCESS` |
| `ALREADY_CALLED` |
| `CALL_NOT_PICKED` |
| `CALL_BACK_LATER` |
| `INTERESTED` |
| `NOT_INTERESTED` |
| `CONVERTED` |

`NOT_INTERESTED` and `CALL_NOT_PICKED` require `outcomeReason` on status update (same contract as sales).

## Endpoints

### `GET /api/admin/vip/leads`

List / filter VIP consultation leads.

**Query params**

| Param | Type | Notes |
|---|---|---|
| `start` / `end` | Instant (ISO-8601) | Filter on `lastRequestedAt` (`end` exclusive) |
| `status` | string | One of the status enum values |
| `followUpStart` / `followUpEnd` | Instant | Filter on `followUpAt` |
| `query` | string | Matches `userId`, `vipTitle`, or profile `memberId` / `phone` / `fullName` |
| `assignedToAdminId` | string | Filter by assignee employee id |
| `assignedToMe` | boolean | When true, filter to current staff employee |
| `pool` | boolean | When true, unassigned `CALL_REMAINING` + stale `IN_PROCESS` claims |
| `sort` | string | `newest` (default), `oldest`, `follow_up`, `updated` |
| `page` | int | Default `0` |
| `size` | int | Default `20`, max `100` |

**Example**

```http
GET /api/admin/vip/leads?status=CALL_REMAINING&pool=true&page=0&size=20
```

**Response**

```json
{
  "items": [
    {
      "userId": "user_abc",
      "memberId": "Q12345",
      "phone": "+9198...",
      "fullName": "Aisha Khan",
      "gender": "FEMALE",
      "city": "Mumbai",
      "state": "MH",
      "country": "IN",
      "profileCreatedAt": "2026-01-10T08:00:00Z",
      "profileStatus": "APPROVED",
      "accountStatus": "ACTIVE",
      "subscribed": false,
      "status": "CALL_REMAINING",
      "note": null,
      "followUpAt": null,
      "lastCalledAt": null,
      "assignedToAdminId": null,
      "claimedAt": null,
      "outcomeReason": null,
      "convertedAt": null,
      "requestedAt": "2026-09-20T06:00:00Z",
      "lastRequestedAt": "2026-09-20T06:00:00Z",
      "requestCount": 1,
      "vipPlanId": "66f0a9...",
      "vipTitle": "Qurb VIP",
      "originalPriceInr": 99000,
      "discountedPriceInr": 65000,
      "currency": "INR",
      "updatedAt": "2026-09-20T06:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "total": 1
}
```

### `GET /api/admin/vip/follow-ups`

Follow-up buckets for the current UTC day window.

| Param | Default | Values |
|---|---|---|
| `bucket` | `due_today` | `due_today`, `overdue`, `upcoming` |
| `assignedToMe` | — | optional boolean |
| `page` / `size` | `0` / `20` | pagination |

Same response shape as `GET /leads`.

### `GET /api/admin/vip/leads/{userId}`

Lead detail with full `UserProfile` plus VIP lead fields.

```json
{
  "profile": { "...": "full UserProfile document" },
  "status": "IN_PROCESS",
  "note": "Asked about discreet meetings",
  "notes": [
    {
      "text": "Asked about discreet meetings",
      "adminUserId": "emp_01",
      "createdAt": "2026-09-20T07:00:00Z"
    }
  ],
  "followUpAt": "2026-09-21T10:00:00Z",
  "lastCalledAt": "2026-09-20T07:05:00Z",
  "assignedToAdminId": "emp_01",
  "claimedAt": "2026-09-20T06:30:00Z",
  "outcomeReason": null,
  "convertedAt": null,
  "requestedAt": "2026-09-20T06:00:00Z",
  "lastRequestedAt": "2026-09-20T06:15:00Z",
  "requestCount": 2,
  "vipPlanId": "66f0a9...",
  "vipTitle": "Qurb VIP",
  "originalPriceInr": 99000,
  "discountedPriceInr": 65000,
  "currency": "INR",
  "ctaLabel": "Book free consultation",
  "createdAt": "2026-09-20T06:00:00Z",
  "updatedAt": "2026-09-20T07:05:00Z"
}
```

`404` when the VIP lead or user profile is missing.

### `POST /api/admin/vip/leads/{userId}/claim`

Claims an existing VIP lead for the current agent (`status → IN_PROCESS`, sets assignee + `claimedAt`).

- Does **not** create a lead if the user never tapped the mobile CTA
- `409`-style conflict when already claimed by another agent (non-stale)

### `POST /api/admin/vip/leads/{userId}/release`

Returns lead to pool (`CALL_REMAINING`, clears assignee). Assignee or manager only.

### `PATCH /api/admin/vip/leads/{userId}/status`

```json
{
  "status": "CALL_NOT_PICKED",
  "outcomeReason": "NO_ANSWER",
  "lastCalledAt": "2026-09-20T07:05:00Z"
}
```

- `status` required
- `outcomeReason` required for `NOT_INTERESTED` / `CALL_NOT_PICKED`
- `lastCalledAt` optional; auto-stamped for call-related statuses (same rules as sales)

### `PATCH /api/admin/vip/leads/{userId}/note`

```json
{
  "note": "Prefers evening call",
  "adminUserId": "emp_01"
}
```

Sets latest `note` and appends to `notes[]`.

### `PATCH /api/admin/vip/leads/{userId}/follow-up`

```json
{
  "followUpAt": "2026-09-22T09:00:00Z"
}
```

Pass `null` / omit to clear follow-up.

### `PATCH /api/admin/vip/leads/{userId}/assign`

Manager assign / unassign.

```json
{
  "assignedToAdminId": "emp_02"
}
```

Empty / null assignee releases to `CALL_REMAINING`.

## How this differs from `/api/admin/sales`

| | Admin sales | VIP consultation |
|---|---|---|
| Collection | `admin_sales_leads` | `vip_consultation_leads` |
| Lead creation | Profile/signup driven | Mobile `POST .../vip-plan/consultation` only |
| Extra fields | — | `requestCount`, VIP price/title snapshot, `requestedAt` / `lastRequestedAt` |
| Analytics / saved views / communications | Yes (sales) | Out of scope for v1 |

## Non-goals (v1)

- Agent performance / conversions analytics
- Saved views
- Merge into `admin_sales_leads`
