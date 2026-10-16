# Matched-Day Users Sales List API Contract

Admin list of **distinct users** who participated in at least one match on a selected day/range (`matches.matchedAt`). Response rows use the same shape as live sales [`AdminSalesLeadSummary`](./frontend_sales_api).

Related: live sales [`frontend_sales_api`](./frontend_sales_api); conversation-centric chat list remains under `/api/admin/chat`.

---

## 1) Purpose

| | Live `/api/admin/sales/leads` | Matched `/api/admin/sales/matched/leads` |
|--|--|--|
| Seed | `user_profiles` by `createdAt` | `matches` by `matchedAt` |
| Rows | One per profile | **One per distinct user** in ≥1 match that day |
| Filters | Many (status, bio, etc.) | **None** — only date + pagination |
| CRM | Full | List only (lead fields joined if present) |

---

## 2) Endpoint

Base: `/api/admin/sales/matched`

| Method | Path | Notes |
|--------|------|--------|
| GET | `/leads` | Distinct matched users + sales summary fields |

### Query params

| Param | Default | Notes |
|-------|---------|--------|
| `start` | start of **today UTC** if both omitted | Inclusive; `matchedAt ≥ start` |
| `end` | end of **today UTC** if both omitted | Exclusive; `matchedAt < end` |
| `page` | `0` | Zero-based |
| `size` | `20` | Max `100` |

- Max range: **93 days** (`400` if wider).
- All match statuses with `matchedAt` set are included (ACTIVE / UNMATCHED / etc.).
- `conversationId` is **not** required.
- Sort: newest `lastMatchedAt` first (internal; not exposed on the summary DTO).

```http
GET /api/admin/sales/matched/leads?start=2026-10-15T00:00:00Z&end=2026-10-16T00:00:00Z&page=0&size=20
```

---

## 3) Response

Same as live sales search:

```ts
export interface AdminSalesLeadSearchResponse {
  items: AdminSalesLeadSummary[];
  page: number;
  size: number;
  total: number; // distinct users in range (with a live profile)
}
```

`AdminSalesLeadSummary` fields match live sales (phone, bio, education, profession, primaryImageUrl, salesStatus, etc.). Users without a `user_profiles` row are dropped after lookup.

---

## 4) Auth

Same as other `/api/admin/**` routes (`ROLE_ADMIN`).

---

## 5) FAQ

**Q: Same as `/api/admin/chat` conversations?**  
A: No. Chat lists **conversations**; this lists **distinct users** in sales-card shape.

**Q: User matched twice in the day?**  
A: One row.
