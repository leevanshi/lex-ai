# LexAI — Legal Document Generator

A SaaS platform that lets startups generate legally-sound documents (NDAs, service agreements, employment contracts, IP assignments, and more) in minutes, with tiered subscription plans.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/lexai run dev` — run the frontend (dynamic port)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Wouter routing, TanStack Query, shadcn/ui, Framer Motion, Recharts
- Auth: Clerk (whitelabel, proxy-based, same-domain cookie auth)
- API: Express 5, contract-first OpenAPI spec → Orval codegen
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Build: esbuild (CJS bundle)

## Where things live

- DB schema: `lib/db/src/schema/` — users, subscriptions, documents tables
- OpenAPI spec: `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- Generated API hooks: `lib/api-client-react/src/generated/api.ts`
- API routes: `artifacts/api-server/src/routes/` — users, subscriptions, documents
- Document templates: `artifacts/api-server/src/lib/documentGenerator.ts`
- Frontend pages: `artifacts/lexai/src/pages/`

## Architecture decisions

- Contract-first API: OpenAPI spec drives both server validation (Zod) and client hooks (Orval codegen). Never hand-write API types on the client.
- Clerk auth uses proxy middleware on the same domain — no Bearer tokens. The session cookie is automatically included in all API requests.
- Plan limits enforced server-side: free=3 docs/month (NDA only), pro=20 (NDA+SA+IP+Employment), enterprise=unlimited (all types).
- Document generation is synchronous and template-based — no external AI dependency in v1.
- Wouter uses `to=` prop (not `href=`) for Link components.

## Product

- **Landing page** — marketing page with pricing tiers and feature overview
- **Auth** — Clerk-powered sign-up/sign-in with whitelabel branding
- **Dashboard** — stats overview (total docs, plan usage, recent docs, charts)
- **Document Wizard** — 3-step form to generate NDAs, service agreements, employment contracts, IP assignments, ToS
- **Document Detail** — view, edit, and download generated documents
- **Subscription** — upgrade/downgrade plans, view usage meter
- **Settings** — account profile linked to Clerk user data

## Gotchas

- After changing `lib/db` schema, run `pnpm run typecheck:libs` before typechecking leaf packages.
- Do NOT run `pnpm dev` at the workspace root — use workflows or `--filter` commands.
- Wouter's `Link` component uses `to=` not `href=`.
- The `useDownloadDocument` hook is a query (not mutation) — use the raw `downloadDocument()` function for imperative calls.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
