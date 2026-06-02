# Admin React Web App

React + TypeScript admin panel for `/api/admin` endpoints described in the API contract.

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS (with shadcn-style component primitives)
- React Router
- React Query
- Axios
- Recharts
- Vitest + Testing Library

## Setup

1. Install dependencies:
   - `npm install`
2. Create environment file:
   - `cp .env.example .env`
3. Start development server:
   - `npm run dev`

## Environment Variables

- `VITE_ADMIN_API_BASE_URL`:
  - Example: `https://example.com`
  - Leave empty if frontend and API are served from the same origin.

## Deployment (static / Vercel)

This app is a SPA: routes like `/sales`, `/sales/:userId`, and `/users/:userId` must fall back to `index.html` on the host. The repo includes [`vercel.json`](vercel.json) with a catch-all rewrite so deep links and hard refresh do not return 404. For other hosts (e.g. Netlify), add the equivalent “single-page app” redirect rules.

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run preview` - preview built app
- `npm run test` - run unit tests once
- `npm run test:watch` - run tests in watch mode

## Implemented Pages

- Login page (`/login`)
- Overview dashboard (`/overview`)
- Funnel (`/funnel`)
- Revenue (`/revenue`)
- Matching (`/matching`)
- Chat (`/chat`)
- Safety (`/safety`)
- Demographics (`/demographics`)
- Retention (`/retention`)
- User directory (`/users`)
- User detail (`/users/:userId`)

## Notes and Assumptions

- Auth token is stored in local storage and read into memory on app bootstrap.
- Axios interceptor attaches `Authorization: Bearer <token>` automatically.
- `401/403` responses clear session and redirect to `/login`.
- Date controls submit UTC ISO timestamps.
- UI renders safely for missing metrics and empty `series`/`breakdown`.
