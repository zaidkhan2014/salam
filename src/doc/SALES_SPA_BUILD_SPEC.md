# Qalbi Sales SPA — Build Specification

**Purpose:** Build a **standalone sales-only web app** that reproduces the **exact Sales UI and behavior** currently embedded in the Qalbi admin panel, without Overview, Users, Analytics, Reports, or other admin sections.

**Reference implementation:** This repo’s `src/pages/sales/**`, `src/hooks/api/useAdminSales.ts`, `src/features/auth/**` (staff login), and API contract in [`doc.md`](./doc.md) §1, §2.4–§3.3, §4.10, §7.

**Target users:** `SALES_AGENT`, `SALES_MANAGER`, `SUPER_ADMIN` (staff login). Sales agents should land on Sales only and never see the full admin nav.

---

## 1. Product scope

### In scope (must match current admin Sales)

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Staff login | Email + password only (no bootstrap tab for production sales app) |
| `/` or `/leads` | Leads list | Filters, KPI summary, pool/my-leads presets, table, pagination, saved views |
| `/leads/:userId` | Lead detail | Profile photo, sales fields, full profile, claim/release, status/note/follow-up, activity timeline, WhatsApp log |
| `/follow-ups` | Follow-up queue | Buckets: `due_today` / `overdue` / `upcoming` + `assignedToMe` toggle |
| `/conversions` | Conversions | Date range + assignee filter, paginated table |
| `/performance` | Agent performance | Date range + `employeeId`; **hide nav for `SALES_AGENT`** |

### Out of scope

- Analytics (Overview, Funnel, Revenue, …)
- Users directory (`/users`)
- Reports
- Bootstrap token login (`POST /auth/token` + `X-Admin-Secret`) — optional dev-only, not in production UI
- Admin Staff CRUD UI

### Post-login redirect

| App | Redirect after login |
|-----|----------------------|
| Admin (current) | `/overview` |
| Sales SPA (target) | `/leads` (or `/` → redirect to `/leads`) |

---

## 2. Tech stack (match admin exactly)

```
Vite 8 + React 19 + TypeScript
Tailwind CSS 4 (@tailwindcss/vite)
React Router 7
TanStack React Query 5
Axios
date-fns (optional; admin uses small utils in src/utils/date.ts)
Vitest + Testing Library
```

**Path alias:** `@/` → `src/`

**Environment:**

```bash
VITE_ADMIN_API_BASE_URL=   # e.g. https://api.example.com or empty for same-origin
```

**SPA hosting:** `vercel.json` catch-all rewrite to `index.html` (same as admin [`vercel.json`](../../vercel.json)).

---

## 3. Visual theme & design system

Copy the admin’s **slate minimal** look. No separate brand — pixel-parity with current Sales pages.

### Global (`src/index.css`)

```css
@import "tailwindcss";

:root {
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  color: #111827;
  background-color: #f8fafc;
}

body {
  margin: 0;
  min-height: 100vh;
  background-color: #f8fafc;
}
```

### Color tokens (Tailwind classes used everywhere)

| Role | Classes |
|------|---------|
| Page background | `bg-slate-50` |
| Card | `rounded-xl border border-slate-200 bg-white shadow-sm` |
| Primary text | `text-slate-900` |
| Secondary text | `text-slate-600`, labels `text-slate-500` |
| Primary button | `bg-slate-900 text-white hover:bg-slate-700 rounded-lg` |
| Outline button | `border border-slate-300 bg-white hover:bg-slate-100` |
| Active pill/tab | `border-slate-900 bg-slate-900 text-white` |
| Inactive pill | `border-slate-200 text-slate-600 hover:bg-slate-50` |
| Table header | `bg-slate-100 text-slate-600` |
| Error alert | `border-red-200 bg-red-50 text-red-700` |
| Warning hint | `text-amber-800 text-xs` |

### UI primitives (copy from admin)

| Component | Admin source | Notes |
|-----------|--------------|-------|
| `Button` | `src/components/ui/button.tsx` | variants: default, outline, ghost, destructive |
| `Input` | `src/components/ui/input.tsx` | `h-10 w-full rounded-lg border border-slate-300 …` |
| `Select` | `src/components/ui/select.tsx` | `w-full min-w-0` |
| `Card` | `src/components/ui/card.tsx` | CardHeader, CardTitle, CardContent |
| `Alert` | `src/components/ui/alert.tsx` | |
| `Skeleton` | `src/components/ui/skeleton.tsx` | |
| `cn()` | `src/lib/cn.ts` | clsx + tailwind-merge |

### Shared layout components

| Component | Admin source | Behavior |
|-----------|--------------|----------|
| `PageHeader` | `src/components/common/PageHeader.tsx` | `h1 text-2xl font-semibold` + optional description |
| `QueryFeedback` | `src/components/common/QueryFeedback.tsx` | Loading / error with Retry; maps 403 and `ErrorResponse.message` |
| `EmptyState` | `src/components/common/EmptyState.tsx` | Title + subtitle when no rows |
| `SalesSubNav` | `src/pages/sales/SalesSubNav.tsx` | Pill nav: Leads, Follow-ups, Conversions, Performance |

### Sales shell (replaces admin `AppShell`)

**Do not** use the 240px sidebar with 15+ admin links from [`src/components/layout/AppShell.tsx`](../components/layout/AppShell.tsx).

Use a **minimal top bar**:

```
┌─────────────────────────────────────────────────────────┐
│ Qalbi Sales          [Leads][Follow-ups][Conversions]…  │
│                      Staff name (SALES001)    [Logout]  │
├─────────────────────────────────────────────────────────┤
│  <Outlet />  (page content, max-w-7xl mx-auto p-4 md:p-6) │
└─────────────────────────────────────────────────────────┘
```

- `min-w-0` on shell and main (mobile overflow fix)
- Sub-nav can live in shell or per-page (admin uses per-page `SalesSubNav`)

---

## 4. Repository structure

```
sales-web/                    # new repo recommended
├── index.html
├── vite.config.ts
├── vercel.json
├── package.json
└── src/
    ├── main.tsx
    ├── index.css
    ├── api/
    │   ├── client.ts          # axios + Bearer + ngrok header + 401 redirect
    │   ├── endpoints.ts       # sales + authLogin ONLY
    │   ├── params.ts          # cleanQueryParams
    │   └── types.ts           # sales + auth DTOs from doc §7
    ├── features/auth/
    │   ├── session.ts
    │   └── useAuth.ts         # staffLogin only (production)
    ├── hooks/api/
    │   └── useAdminSales.ts   # copy all sales hooks
    ├── components/
    │   ├── ui/                # button, input, select, card, alert, skeleton
    │   ├── common/            # PageHeader, QueryFeedback, EmptyState
    │   ├── layout/
    │   │   └── SalesShell.tsx
    │   └── users/
    │       └── UserProfileDetailSections.tsx
    ├── pages/
    │   ├── login/LoginPage.tsx
    │   └── sales/
    │       ├── SalesPage.tsx
    │       ├── SalesLeadDetailPage.tsx
    │       ├── SalesFollowUpsPage.tsx
    │       ├── SalesConversionsPage.tsx
    │       ├── SalesPerformancePage.tsx
    │       ├── SalesSubNav.tsx
    │       ├── SalesSavedViews.tsx
    │       ├── salesConstants.ts
    │       └── salesListSearchParams.ts
    ├── router/
    │   ├── paths.ts
    │   ├── index.tsx
    │   └── guards.tsx         # redirect to /leads when authed
    └── utils/
        ├── date.ts            # toUtcIso, toDatetimeLocalInput
        ├── format.ts          # formatDateTime, formatNumber, formatCompactNumber
        └── profileMedia.ts    # getPrimaryGalleryImageUrl, getInitialsFromFullName
```

Copy source files from admin where listed; change route paths (`/sales` → `/leads`) and remove admin-only navigation.

---

## 5. Authentication

### API

`POST /api/admin/auth/login`

```json
{
  "email": "sales1@qalbi.co.in",
  "password": "your-password"
}
```

Response: `AdminStaffLoginResponse` — store `accessToken`, `roles`, `staff` (`employeeId`, `name`, `role`, …).

JWT **`sub`** = staff **`employeeId`** (e.g. `SALES001`).

### Session

```ts
interface AdminSession extends AdminTokenResponse {
  staff: AdminStaffSummary
}
```

- Persist in `localStorage` (e.g. key `qalbi.sales.session`)
- `getStaffEmployeeId()` → `session.staff.employeeId`
- All API calls: `Authorization: Bearer <accessToken>`
- **401:** clear session, redirect `/login`
- **403:** show message in UI (do not logout)

### Login page UI

- Centered card `max-w-md`, same as admin [`LoginPage`](../pages/login/LoginPage.tsx) **Staff tab only**
- Email + password fields
- Error from `ErrorResponse.message`
- On success → `navigate('/leads')`

### Role helpers (from `src/features/auth/session.ts`)

```ts
isSalesAgent(session)           // ROLE_SALES_AGENT in roles
isSalesManagerOrAbove(session)  // SUPER_ADMIN | SALES_MANAGER | ROLE_ADMIN
```

---

## 6. API endpoints (sales SPA uses only these)

Base path: **`/api/admin`**

| Method | Path | React Query hook |
|--------|------|------------------|
| POST | `/auth/login` | `staffLogin` (auth context) |
| GET | `/sales/leads` | `useAdminSalesLeads` |
| GET | `/sales/leads/{userId}` | `useAdminSalesLeadDetail` |
| PATCH | `/sales/leads/{userId}/status` | `useUpdateSalesStatus` |
| PATCH | `/sales/leads/{userId}/note` | `useUpdateSalesNote` |
| PATCH | `/sales/leads/{userId}/follow-up` | `useUpdateSalesFollowUp` |
| POST | `/sales/leads/{userId}/claim` | `useClaimSalesLead` |
| POST | `/sales/leads/{userId}/release` | `useReleaseSalesLead` |
| PATCH | `/sales/leads/{userId}/assign` | `useAssignSalesLead` (managers+) |
| GET | `/sales/leads/{userId}/activities` | `useAdminSalesActivities` |
| POST | `/sales/leads/{userId}/communications` | `useLogSalesCommunication` |
| GET | `/sales/follow-ups` | `useAdminSalesFollowUps` |
| GET | `/sales/conversions` | `useAdminSalesConversions` |
| GET | `/sales/agents/performance` | `useAdminSalesAgentPerformance` |
| GET | `/sales/summary` | `useAdminSalesSummary` |
| GET | `/sales/saved-views` | `useAdminSalesSavedViews` |
| POST | `/sales/saved-views` | `useCreateSalesSavedView` |
| PATCH | `/sales/saved-views/{viewId}` | `useUpdateSalesSavedView` |
| DELETE | `/sales/saved-views/{viewId}` | `useDeleteSalesSavedView` |

Full request/response shapes: [`doc.md`](./doc.md) §2.4, §2.4.1, §3.3, §7.

### Axios client (copy `src/api/client.ts`)

- Base URL from `VITE_ADMIN_API_BASE_URL`
- Request interceptor: Bearer token; if URL matches `*.ngrok-free.*`, set `ngrok-skip-browser-warning: true`
- Response interceptor: 401 → clear session + redirect login; attach server `message` to Error

### Query params

Use `cleanQueryParams()` from `src/api/params.ts` — strips empty strings; keeps `0` and `false`; numbers serialize correctly for `birthYear`.

---

## 7. Routes (sales SPA)

```ts
export const routes = {
  login: '/login',
  leads: '/leads',                        // admin uses /sales
  leadDetail: (userId: string) => `/leads/${userId}`,
  followUps: '/follow-ups',               // admin uses /sales/follow-ups
  conversions: '/conversions',
  performance: '/performance',
}
```

**Router order:** static paths before `:userId`:

```
/leads              → SalesPage
/follow-ups         → SalesFollowUpsPage
/conversions        → SalesConversionsPage
/performance        → SalesPerformancePage
/leads/:userId      → SalesLeadDetailPage
/                   → Navigate to /leads (if authed)
/login              → LoginPage (public)
```

**Back navigation:** Lead detail “Back to leads” restores list filters via `location.state.salesListSearch` (query string without leading `?`).

---

## 8. Page specifications

### 8.1 Leads list (`SalesPage.tsx`)

**Layout (top → bottom):**

1. `PageHeader` — title “Sales”, description about pipeline
2. `SalesSubNav`
3. **View presets** (pill buttons): `All leads` | `Pool` | `My leads`
   - Pool → URL `pool=true`, clears `assignedToMe`
   - My leads → `assignedToMe=true`, clears `pool`
   - All → clear both
4. **Filters card** (`min-w-0`, `CardContent overflow-x-auto`)
   - Saved views: load / save / delete (`SalesSavedViews.tsx`)
   - Profile created: datetime-local From/To
   - Follow-up scheduled: datetime-local From/To
   - Profile filters grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, labels `min-w-0`):
     - Account status (default **ACTIVE**)
     - Profile status (default **APPROVED**)
     - Gender, Born on or before (year), Marital status, State, City
     - Minimum income (India + International optgroups; band **id** in URL/API, label in UI)
     - Subscribed, Verified profile
   - Sales status (ALL + 8 statuses), Search, Sort (Default | Lead score), Assigned to employeeId
5. **Summary KPI grid** — `GET /sales/summary?start&end` from profile-created dates
   - Map keys via `salesSummaryMetricLabel()` in `salesConstants.ts`
   - Grid: `md:grid-cols-3 xl:grid-cols-5`
6. **Leads table** — columns: Lead, Status, Assigned, **Score** (`leadScore` 0–100 priority hint), **Income** (`incomeLabel`), Outcome, Note, Follow-up, Manage
7. **Pagination** — page 0-based in URL; Previous/Next

**URL state:** All filters in query string via `salesListSearchParams.ts`.

**sessionStorage:** Key `qalbi.admin.salesListSearch` — hydrate empty URL on first visit.

**Marital status / gender URL fix:** When writing URL params, do **not** trim stored values — only use `.trim()` to decide whether to emit the param (preserves trailing space while typing).

**birthYear:** Maximum birth year (inclusive) — profiles born on or before Dec 31 of that year (`DOB ≤ YYYY-12-31`). Only send to API if integer 1900–2100; show amber hint if invalid.

**minIncomeBandId:** Hardcoded band ids from `salesIncomeBands.ts` (see `incomedoc.md`). Server filters `incomePerYearUsd >= band lower bound`; profiles without income are excluded. Invalid ids in URL are ignored (not sent to API).

---

### 8.2 Lead detail (`SalesLeadDetailPage.tsx`)

**Top actions:** Claim lead | Release to pool (409 on claim conflict → show alert with server message)

**Hero row** (`flex-col lg:flex-row`, `min-w-0`):

- Left: square profile photo or initials
- Right: **Sales & activity** card + **Engagement counters** grid

**Fields displayed:** userId, salesStatus, leadScore, assignedTo, claimedAt, outcomeReason, convertedAt, note, follow-up, last called, sales timestamps, OTP/signup/login activity.

**Full profile card:** `UserProfileDetailSections` — profile key/value blocks; stack on mobile.

**Quick actions:**

- Status select (8 `AdminSalesStatus` values)
- Outcome reason — **required** for `NOT_INTERESTED` / `CALL_NOT_PICKED`
- Last called datetime-local (optional; server auto-stamps for `ALREADY_CALLED` / `CALL_NOT_PICKED`)
- Note — `adminUserId: getStaffEmployeeId()` (e.g. `SALES001`)
- Follow-up save / clear
- **Managers only:** Assign to employeeId
- WhatsApp log: `POST …/communications` with `channel: WHATSAPP`

**Note history** + **Activity timeline** (`GET …/activities`)

**Form sync:** On detail load / after PATCH mutations, sync local form from server response.

---

### 8.3 Follow-ups (`SalesFollowUpsPage.tsx`)

- Bucket pills: `due_today` | `overdue` | `upcoming`
- Toggle “My leads only” → `assignedToMe=true`
- Table + pagination (page size 20)

---

### 8.4 Conversions (`SalesConversionsPage.tsx`)

- Filters: profile created from/to, `assignedToAdminId`
- Table: User, Phone, Assigned, Converted, Subscribed, Open
- Pagination

---

### 8.5 Performance (`SalesPerformancePage.tsx`)

- Hidden from `SalesSubNav` when `isSalesAgent(session)`
- Filters: updated from/to, employeeId (managers)
- Table: claimed, calls, interested, converted, overdue follow-ups, avg min to first call

---

## 9. Sales constants (`salesConstants.ts`)

Copy from admin:

- `ADMIN_SALES_STATUSES` — 8 values including `IN_PROCESS`, `CONVERTED`
- `ADMIN_SALES_STATUS_FILTER_OPTIONS` — `ALL` + statuses
- `ADMIN_SALES_OUTCOME_REASONS` — 8 values
- `SALES_SUMMARY_METRIC_LABELS` — e.g. `sales_in_process`, `sales_converted`
- `statusRequiresOutcomeReason()`
- `birthYearForLeadsApi()`

---

## 10. Role-based behavior

| Role | Leads list | Detail writes | Assign | Performance nav |
|------|------------|---------------|--------|-----------------|
| `SALES_AGENT` | Use Pool / My leads presets | Own assigned (API enforces) | No | Hidden |
| `SALES_MANAGER`+ | All filters | All | Yes | Visible |

**Important:** API does **not** auto-restrict list results for agents. UI must pass `pool=true` and/or `assignedToMe=true`.

---

## 11. Mobile layout requirements

Apply on all sales pages (already implemented in admin):

- `section` / main: `min-w-0`
- Filters card: `overflow-x-auto` on CardContent
- Grids: `grid-cols-1` by default
- Tables: `overflow-x-auto` wrapper
- Profile rows: `flex-col` on xs, `sm:flex-row` on wider screens
- Lead detail hero: `flex-col` → `lg:flex-row`

---

## 12. Tests to include

Copy/adapt from admin:

- `src/tests/pages/salesListSearchParams.test.ts`
- `src/tests/api/endpoints.test.ts` (sales paths)
- `src/tests/api/session.test.ts` (`getStaffEmployeeId`)

Run: `npm run build && npm test`

---

## 13. Implementation checklist

1. Scaffold Vite React TS + Tailwind 4 + `@/` alias
2. Copy API layer, auth, utils, UI primitives, sales pages from admin (see §15)
3. Replace `AppShell` with `SalesShell` (no admin sidebar)
4. Change routes `/sales` → `/leads`; update all `routes.*` references
5. Login: staff only; post-login → `/leads`
6. Guards: authed users on `/login` → `/leads`
7. **UserLink:** show userId as text only — no link to `/users/:id` (users app not in sales SPA)
8. Wire all React Query hooks; verify network calls match §6
9. Deploy with SPA rewrite + `VITE_ADMIN_API_BASE_URL`
10. Run manual verification (§14)

---

## 14. Manual verification

- [ ] Staff login with `SALES001` → lands on Leads
- [ ] Pool preset sends `pool=true` in network tab
- [ ] Claim → status `IN_PROCESS`; Release → pool
- [ ] `NOT_INTERESTED` blocked without `outcomeReason`
- [ ] Note saves with employeeId `SALES001`
- [ ] Summary shows `sales_in_process`, `sales_converted`
- [ ] Marital status “Never married” — space while typing works
- [ ] Follow-ups / conversions / performance pages load
- [ ] Back from detail restores filter URL
- [ ] Mobile: phone value + date inputs visible
- [ ] `SALES_AGENT` does not see Performance in nav
- [ ] 409 on claim shows server message

---

## 15. Source file map (admin → sales SPA)

| Admin path | Action |
|------------|--------|
| `src/pages/sales/*` | Copy all 9 files; rename routes `/sales` → `/leads` |
| `src/hooks/api/useAdminSales.ts` | Copy as-is |
| `src/features/auth/session.ts`, `useAuth.ts` | Copy; staff login only in production UI |
| `src/pages/login/LoginPage.tsx` | Copy Staff tab only |
| `src/components/users/UserProfileDetailSections.tsx` | Copy |
| `src/components/common/PageHeader.tsx`, `QueryFeedback.tsx`, `EmptyState.tsx` | Copy |
| `src/components/ui/*` | Copy all |
| `src/utils/date.ts`, `format.ts`, `profileMedia.ts` | Copy |
| `src/lib/cn.ts` | Copy |
| `src/api/client.ts`, `params.ts` | Copy |
| `src/api/endpoints.ts` | Copy; trim to sales + `authLogin` |
| `src/api/types.ts` | Copy sales + auth + UserProfile types |
| `src/doc/doc.md` | API contract reference (link in README) |

---

## 16. Intentional differences from full admin

| Item | Admin | Sales SPA |
|------|-------|-----------|
| Default route after login | `/overview` | `/leads` |
| Navigation | 15+ sidebar links | Sales sub-nav only |
| Login | Staff + Bootstrap tabs | Staff only |
| User profile link | Links to `/users/:id` | Text only |
| Analytics | Yes | No |

---

## 17. Key API semantics (quick reference)

- **`leadScore`:** 0–100 priority hint from backend; sort via `sort=leadScore` (within current page only)
- **`outcomeReason`:** Required on status PATCH when status is `NOT_INTERESTED` or `CALL_NOT_PICKED`
- **Notes:** `adminUserId` in request body = staff **`employeeId`**, not Mongo id
- **Claim:** `POST …/claim` → sets `IN_PROCESS`, assignee = current employee; **409** if already claimed
- **Release:** `POST …/release` → returns lead to pool (`CALL_REMAINING`)
- **Summary KPIs:** Driven by profile `createdAt` date range in filters

---

**End of spec.** Treat this document plus [`doc.md`](./doc.md) as the source of truth for building a pixel- and behavior-matched sales-only application.
