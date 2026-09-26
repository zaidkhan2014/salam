# Admin Chat Conversations — client integration guide

Admin APIs to **list conversations by match date** and **read full chat transcripts**. Match metadata lives in Mongo (`matches` / `user_match_inbox`); **message bodies live in Twilio** and are proxied by the backend.

**Related:**
- [`FRONTEND_ADMIN_API_CONTRACT.md`](./FRONTEND_ADMIN_API_CONTRACT.md) — auth, base URL (§3.5)
- `/analytics/chat` — aggregate chat metrics only (not transcripts)

---

## Summary

| Item | Detail |
|------|--------|
| List | `GET /api/admin/chat/conversations` |
| Messages | `GET /api/admin/chat/conversations/{matchId}/messages` |
| Auth | Admin Bearer JWT (`ROLE_ADMIN`) |
| Purpose | Date-scoped conversation browser + readable transcript |
| Collections | `matches` (+ `user_profiles` for names, `user_match_inbox` for snippet) |
| Messages source | Twilio Conversations API (server-side) |
| Window | `[start, end)` on **`matchedAt`** |
| Default range | Last **7 days** ending at `now` |
| List sort | `matchedAt` descending |

---

## Cohort (list)

A row is included when **all** of:

1. `status = ACTIVE`
2. `conversationId` exists and is non-blank (Twilio SID present)
3. `matchedAt` in `[start, end)`

Matches without a provisioned conversation are **excluded** (nothing to open/read).

---

## Endpoints

### 1) List conversations

```
GET /api/admin/chat/conversations
```

#### Query parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `start` | Instant (ISO-8601) | No | `end − 7 days` | Inclusive lower bound on `matchedAt` |
| `end` | Instant (ISO-8601) | No | `now` | Exclusive upper bound |
| `query` | string | No | — | Optional search: exact/regex on participant `userId`, or profile `memberId` / `phone` / `fullName` |
| `page` | int | No | `0` | Zero-based page |
| `size` | int | No | `20` | Page size, **max 100** |

`400` when resolved `start` is not strictly before `end`.

#### Example requests

```http
GET /api/admin/chat/conversations
GET /api/admin/chat/conversations?start=2026-09-20T00:00:00Z&end=2026-09-27T00:00:00Z&page=0&size=50
GET /api/admin/chat/conversations?query=QALBI001
```

#### Response — `AdminChatConversationSearchResponse`

```json
{
  "start": "2026-09-19T14:00:00Z",
  "end": "2026-09-26T14:00:00Z",
  "total": 42,
  "page": 0,
  "size": 20,
  "items": [
    {
      "matchId": "a1b2c3...",
      "conversationId": "CHxxxxxxxx",
      "userA": "user-aaa",
      "userB": "user-bbb",
      "matchedAt": "2026-09-24T10:15:00.000Z",
      "lastActivityAt": "2026-09-25T18:00:00.000Z",
      "chatStatus": "READY",
      "participantA": {
        "userId": "user-aaa",
        "memberId": "QALBI001",
        "fullName": "Priya Sharma",
        "phone": "+9198xxxxxxx"
      },
      "participantB": {
        "userId": "user-bbb",
        "memberId": "QALBI002",
        "fullName": "Aisha Khan",
        "phone": "+9199xxxxxxx"
      },
      "lastMessageText": "Assalamu alaikum",
      "lastMessageAt": "2026-09-25T18:00:00.000Z",
      "lastMessageAuthorId": "user-aaa"
    }
  ]
}
```

##### Top-level fields

| Field | Type | Description |
|-------|------|-------------|
| `start` / `end` | Instant | Resolved window |
| `total` | number | Matching matches (all pages) |
| `page` / `size` | number | Resolved pagination |
| `items` | `AdminChatConversationSummary[]` | Current page |

##### Item fields

| Field | Type | Description |
|-------|------|-------------|
| `matchId` | string | Match id (path key for messages) |
| `conversationId` | string | Twilio Conversation SID |
| `userA` / `userB` | string | Lexicographically ordered pair |
| `matchedAt` | Instant \| null | Match creation time (list filter) |
| `lastActivityAt` | Instant \| null | Last match activity |
| `chatStatus` | string \| null | e.g. `READY`, `PENDING`, `FAILED` |
| `participantA` / `participantB` | card | Lightweight profile for each side |
| `lastMessageText` | string \| null | Best-effort inbox snippet |
| `lastMessageAt` | Instant \| null | Snippet timestamp |
| `lastMessageAuthorId` | string \| null | Snippet author userId |

---

### 2) Read messages

```
GET /api/admin/chat/conversations/{matchId}/messages
```

Requires an **ACTIVE** match with a non-blank `conversationId`. Otherwise **404**.

#### Query parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `size` | int | No | `50` | Page size, **max 100** |
| `order` | string | No | `asc` | `asc` = oldest first (transcript); `desc` = newest first. Invalid → **400** |
| `pageToken` | string | No | — | Opaque next-page token from previous response |

#### Example requests

```http
GET /api/admin/chat/conversations/a1b2c3.../messages
GET /api/admin/chat/conversations/a1b2c3.../messages?size=50&order=asc
GET /api/admin/chat/conversations/a1b2c3.../messages?pageToken=https%3A%2F%2Fconversations.twilio.com%2F...
```

#### Response — `AdminChatMessagesResponse`

```json
{
  "matchId": "a1b2c3...",
  "conversationId": "CHxxxxxxxx",
  "items": [
    {
      "sid": "IMxxxxxxxx",
      "authorUserId": "user-aaa",
      "body": "Assalamu alaikum",
      "sentAt": "2026-09-24T10:20:00.000Z"
    },
    {
      "sid": "IMyyyyyyyy",
      "authorUserId": "user-bbb",
      "body": "Wa alaikum assalam",
      "sentAt": "2026-09-24T10:21:00.000Z"
    }
  ],
  "nextPageToken": "https://conversations.twilio.com/v1/Conversations/CH.../Messages?Page=1&..."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `matchId` | string | Echo of path |
| `conversationId` | string | Twilio SID used |
| `items` | `AdminChatMessageItem[]` | Current page of messages |
| `nextPageToken` | string \| null | Pass as `pageToken` for next page; `null` when done |

`authorUserId` is the Twilio participant identity (app `userId`).

---

## Suggested UI

```
┌──────────────────────────────────────────────────────────────┐
│ Date range [Last 7 days ▾]   Search [member / phone / name] │
│ Total conversations: 42                                      │
├───────────────────────────┬──────────────────────────────────┤
│ Match list                │ Thread                           │
│ Priya ↔ Aisha  24 Sep     │ Priya: Assalamu alaikum          │
│ …                         │ Aisha: Wa alaikum assalam        │
│                           │ [Load more]                      │
└───────────────────────────┴──────────────────────────────────┘
```

1. Load list with default 7-day window; show participant names + last snippet.
2. On row click → `GET .../messages?order=asc` and render as a chat transcript.
3. If `nextPageToken` is present, append the next page (pass `pageToken` URL-encoded).
4. Do **not** call Twilio from the browser; use these admin APIs only.

---

## TypeScript interfaces

```typescript
type IsoInstant = string;

interface AdminChatParticipantCard {
  userId: string;
  memberId: string | null;
  fullName: string | null;
  phone: string | null;
}

interface AdminChatConversationSummary {
  matchId: string;
  conversationId: string;
  userA: string;
  userB: string;
  matchedAt: IsoInstant | null;
  lastActivityAt: IsoInstant | null;
  chatStatus: string | null;
  participantA: AdminChatParticipantCard;
  participantB: AdminChatParticipantCard;
  lastMessageText: string | null;
  lastMessageAt: IsoInstant | null;
  lastMessageAuthorId: string | null;
}

interface AdminChatConversationSearchResponse {
  start: IsoInstant;
  end: IsoInstant;
  total: number;
  page: number;
  size: number;
  items: AdminChatConversationSummary[];
}

interface AdminChatMessageItem {
  sid: string;
  authorUserId: string | null;
  body: string | null;
  sentAt: IsoInstant | null;
}

interface AdminChatMessagesResponse {
  matchId: string;
  conversationId: string;
  items: AdminChatMessageItem[];
  nextPageToken: string | null;
}
```

---

## Pitfalls

1. **Messages are not in Mongo** — list snippets can lag; open the thread for the source of truth.
2. **No `conversationId` → not listed** — ACTIVE matches still provisioning chat never appear here.
3. **Default 7-day window** — widen `start`/`end` to browse older matches.
4. **`pageToken` is opaque** — treat as a black-box URL; always URL-encode when placing in the query string.
5. **Closed / deleted Twilio conversations** — list may still show the match; messages call returns **502**.
6. **Privacy** — transcripts and phones are PII; restrict to trusted admin roles and avoid logging bodies client-side.

---

## Errors

| Status | When |
|--------|------|
| `401` / `403` | Missing or non-admin auth |
| `400` | `start >= end`, or invalid `order` |
| `404` | Unknown `matchId`, or not ACTIVE / no `conversationId` |
| `502` | Twilio unavailable or conversation cannot be read |
