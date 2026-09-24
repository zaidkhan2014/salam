# Life Together Onboarding Gender API — client integration guide

This document is for the **admin web client** building graphs of male/female counts for:

1. Users who **completed onboarding** in a date window  
2. Those who **filled** Life Together questions  
3. Those who **skipped** Life Together questions (Self profiles only)

**Related:**
- [`FRONTEND_ADMIN_API_CONTRACT.md`](./FRONTEND_ADMIN_API_CONTRACT.md) — admin auth, base URL
- [`GENDER_MONITORING_CLIENT.md`](./GENDER_MONITORING_CLIENT.md) — broader gender monitoring (trends, cities)
- [`LIFE_TOGETHER_REPORT_CLIENT.md`](./LIFE_TOGETHER_REPORT_CLIENT.md) — product LT behavior (skippable at onboarding)

---

## Summary

| Item | Detail |
|------|--------|
| Endpoint | `GET /api/admin/analytics/life-together-onboarding` |
| Auth | Admin Bearer JWT (`ROLE_ADMIN`) |
| Purpose | Range-scoped male/female counts for onboarding complete / LT filled / LT skipped |
| Date field | `user_profiles.onboardingCompletedAt` |
| Window | `[start, end)` — inclusive start, exclusive end |
| Default range | Last **30 days** ending at `now` when params omitted |
| Trends | **None** — three snapshots only (use for bars / pies / KPIs) |

---

## Endpoint

```
GET /api/admin/analytics/life-together-onboarding
```

### Query parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `start` | Instant (ISO-8601) | No | `end − 30 days` | Inclusive lower bound on `onboardingCompletedAt` |
| `end` | Instant (ISO-8601) | No | `now` | Exclusive upper bound |

`400` when resolved `start` is not strictly before `end`.

### Example requests

```http
GET /api/admin/analytics/life-together-onboarding
GET /api/admin/analytics/life-together-onboarding?start=2026-09-01T00:00:00Z&end=2026-09-23T00:00:00Z
```

---

## Who is counted

### Base filter (all three cohorts)

| Field | Rule |
|-------|------|
| `onboardingComplete` | `true` |
| `accountStatus` | not `DELETED` |
| `onboardingCompletedAt` | in `[start, end)` |

Gender from `basicDetails.gender` (same normalization as gender-monitoring):

| Raw value | Bucket |
|-----------|--------|
| `"Male"` (case-insensitive) | `male` |
| `"Female"` (case-insensitive) | `female` |
| null, blank, other | `unknown` |

### Cohorts

| Response field | Extra rules |
|----------------|-------------|
| `onboardingComplete` | Base only — everyone who finished onboarding in the window |
| `lifeTogetherFilled` | Base + non-empty `user_deep_answers.answersByQuestionId` (filled at or after onboarding) |
| `lifeTogetherSkipped` | Base + `basicDetails.profileCreatedFor` = `Self` (case-insensitive) + no deep-answers doc **or** empty answers map |

**Important:** Life Together is only offered for `profileCreatedFor = Self`. Non-Self onboarded users appear in `onboardingComplete` only — they are **not** counted as skipped.

Therefore:

```text
lifeTogetherFilled.total + lifeTogetherSkipped.total  ≤  onboardingComplete.total
```

The gap is mostly non-Self (and any edge cases without Self / without answers).

There is **no** stored `lifeTogetherSkipped` flag — skip is inferred from missing/empty answers.

---

## Response — `AdminLifeTogetherOnboardingResponse`

### Full example

```json
{
  "start": "2026-08-24T10:00:00Z",
  "end": "2026-09-23T10:00:00Z",
  "onboardingComplete": {
    "total": 1200,
    "male": 900,
    "female": 280,
    "unknown": 20,
    "femalePercent": 23.33,
    "malePercent": 75.0,
    "maleToFemaleRatio": "3.21:1"
  },
  "lifeTogetherFilled": {
    "total": 450,
    "male": 300,
    "female": 140,
    "unknown": 10,
    "femalePercent": 31.11,
    "malePercent": 66.67,
    "maleToFemaleRatio": "2.14:1"
  },
  "lifeTogetherSkipped": {
    "total": 500,
    "male": 420,
    "female": 70,
    "unknown": 10,
    "femalePercent": 14.0,
    "malePercent": 84.0,
    "maleToFemaleRatio": "6.00:1"
  }
}
```

### Top-level fields

| Field | Type | Description |
|-------|------|-------------|
| `start` | string (Instant) | Resolved window start |
| `end` | string (Instant) | Resolved window end |
| `onboardingComplete` | `GenderSnapshot` | All onboarded in window |
| `lifeTogetherFilled` | `GenderSnapshot` | Onboarded in window with LT answers |
| `lifeTogetherSkipped` | `GenderSnapshot` | Self + onboarded in window + no LT answers |

### `GenderSnapshot`

| Field | Type | Description |
|-------|------|-------------|
| `total` | number | `male + female + unknown` |
| `male` | number | Male count |
| `female` | number | Female count |
| `unknown` | number | Unrecognized / missing gender |
| `femalePercent` | number | `female / total * 100` (0 if total is 0) |
| `malePercent` | number | `male / total * 100` |
| `maleToFemaleRatio` | string | Display ratio (e.g. `"3.21:1"`) |

Same shape as gender-monitoring snapshots — reuse existing UI helpers if you already parse `GenderSnapshot`.

---

## Suggested UI / charts

```
┌──────────────┬──────────────┬──────────────┐
│ KPI: Complete│ KPI: Filled  │ KPI: Skipped │
│ total / ♀ %  │ total / ♀ %  │ total / ♀ %  │
└──────────────┴──────────────┴──────────────┘

┌────────────────────────────────────────────┐
│ Grouped bar: cohort × gender               │
│ X = onboardingComplete | filled | skipped  │
│ Series = male, female (optional: unknown)  │
└────────────────────────────────────────────┘

Optional row: three pie charts (one per cohort)
```

### Graph mapping

| Chart | Data | How to plot |
|-------|------|-------------|
| KPI cards | each cohort’s `total`, `femalePercent` | Three cards |
| Grouped bar | three cohorts × `male` / `female` | X = cohort label; series = gender |
| Stacked bar (optional) | same | Stack male+female per cohort |
| Pie × 3 (optional) | each `GenderSnapshot` | Segments = `male` / `female` / `unknown` |

**Skip rate among Self (approx):**

```text
skipRate = lifeTogetherSkipped.total
         / (lifeTogetherFilled.total + lifeTogetherSkipped.total)
```

Do **not** divide skipped by `onboardingComplete.total` if you want Self-only skip rate — that denominator includes non-Self.

**Subtitle suggestion:** *"Onboarding completed in selected range · Self-only for skipped"*

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

interface AdminLifeTogetherOnboardingResponse {
  start: string; // Instant ISO-8601
  end: string;
  onboardingComplete: GenderSnapshot;
  lifeTogetherFilled: GenderSnapshot;
  lifeTogetherSkipped: GenderSnapshot;
}
```

---

## Pitfalls

1. **Non-Self gap** — `filled.total + skipped.total` will usually be less than `onboardingComplete.total`. Expected.
2. **Filled after onboarding** — users who skipped at `/complete` then later answered via `PUT /api/life-together/answers` count as **filled** (current answers state).
3. **No daily series** — this endpoint does not return inflow trends. For time series of onboarding completions by gender, use `/analytics/gender-monitoring`.
4. **Deleted accounts** — excluded (`accountStatus ≠ DELETED`).
5. **Empty window** — all snapshots return zeros with `0` percents / empty ratio string as produced by the shared snapshot helper.

---

## Errors

| Status | When |
|--------|------|
| `401` / `403` | Missing or non-admin auth |
| `400` | `start >= end` after defaults |
