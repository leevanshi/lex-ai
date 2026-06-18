<div align="center">

# ⚖️ LexAI

### Legal documents for startups, generated in minutes — not weeks.

A full-stack SaaS platform that turns a short questionnaire into a polished, lawyer-style legal document: NDAs, service agreements, employment contracts, IP assignments, and more — gated behind tiered subscription plans.

<img src="artifacts/lexai/public/hero.png" alt="LexAI hero banner" width="100%" />

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](#-license)
![Node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-workspaces-F69220?logo=pnpm&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle_ORM-4169E1?logo=postgresql&logoColor=white)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Document Types & Plans](#-document-types--plans)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Available Scripts](#-available-scripts)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🧭 Overview

LexAI lets a founder describe their situation in a short, guided wizard and walk away with a complete legal document — no lawyer, no blank-page problem. The app pairs a contract-first API (OpenAPI → generated TypeScript client) with a Postgres-backed document store, Clerk authentication, and a tiered subscription model that unlocks more document types and higher monthly quotas as users upgrade.

It's built as a pnpm monorepo so the API contract, validation schemas, generated client hooks, and database schema all live as shared packages consumed by both the Express backend and the React frontend.

## ✨ Features

- 🧙 **Guided document wizard** — a multi-step questionnaire (text, textarea, select, and date fields) tailored per document type, with required/optional field validation.
- 🔐 **Authentication via Clerk** — same-domain cookie auth with a proxy-based setup so sign-in works seamlessly behind the API server.
- 💳 **Tiered subscriptions** — Free, Pro, and Enterprise plans that gate document types, monthly generation quotas, and download formats.
- 📊 **Dashboard & usage stats** — see documents generated this month, breakdown by type, and remaining quota at a glance.
- 📁 **Document management** — list, filter, view, edit, and download generated documents.
- 📦 **Contract-first API** — a single OpenAPI spec (`lib/api-spec/openapi.yaml`) is the source of truth, with Orval generating both Zod validators and React Query hooks from it — so the frontend and backend can never drift out of sync.
- 🗄️ **Type-safe data layer** — Drizzle ORM schemas with `drizzle-zod` for end-to-end type safety from the database up to the UI.

## 📑 Document Types & Plans

| Document | Category | Plan Required |
|---|---|---|
| Non-Disclosure Agreement | Confidentiality | Free |
| Service Agreement | Contracts | Pro |
| IP Assignment Agreement | Intellectual Property | Pro |
| Employment Contract | Employment | Pro |
| Terms of Service | Compliance | Enterprise |
| Privacy Policy | Compliance | Enterprise |
| Co-Founder Agreement | Corporate | Enterprise |

| Plan | Price | Docs / Month | Highlights |
|---|---|---|---|
| **Free** | $0 | 3 | NDA templates only, PDF download |
| **Pro** | $29/mo | 20 | NDAs, Service Agreements, IP Assignments, Employment Contracts; PDF & Word; document history |
| **Enterprise** | $99/mo | Unlimited | All document types, all formats, custom branding, team collaboration |

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Package management | pnpm workspaces |
| Frontend | React + Vite, Wouter (routing), TanStack Query, shadcn/ui, Framer Motion, Recharts |
| Authentication | Clerk (cookie-based, proxy middleware) |
| Backend API | Express 5, contract-first OpenAPI → Orval codegen |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod, `drizzle-zod` |
| Build | esbuild |
| Logging | Pino |

## 🏗 Architecture

```
                       ┌──────────────────────────┐
                       │   lib/api-spec/openapi    │
                       │   (source of truth)       │
                       └────────────┬─────────────┘
                                    │  Orval codegen
                 ┌──────────────────┴──────────────────┐
                 ▼                                       ▼
     ┌────────────────────────┐            ┌─────────────────────────┐
     │   lib/api-zod           │            │  lib/api-client-react    │
     │   (request/response     │            │  (generated React Query  │
     │    validators)          │            │   hooks)                 │
     └────────────┬────────────┘            └────────────┬─────────────┘
                  │                                        │
                  ▼                                        ▼
     ┌────────────────────────┐            ┌─────────────────────────┐
     │ artifacts/api-server     │◄──────────►│  artifacts/lexai         │
     │ Express 5 + Clerk auth   │   HTTP     │  React + Vite frontend   │
     └────────────┬────────────┘            └─────────────────────────┘
                  │
                  ▼
     ┌────────────────────────┐
     │   lib/db                 │
     │   Drizzle ORM + Postgres  │
     │   users · subscriptions   │
     │   · documents             │
     └────────────────────────┘
```

## 📂 Project Structure

```
lex-ai/
├── artifacts/
│   ├── api-server/        # Express 5 backend
│   │   └── src/
│   │       ├── routes/        # users, subscriptions, documents, health
│   │       ├── lib/            # auth, document-templates, logger
│   │       └── middlewares/    # Clerk proxy middleware
│   ├── lexai/              # React + Vite frontend
│   │   └── src/
│   │       └── pages/          # LandingPage, Dashboard, Documents,
│   │                            # DocumentWizard, DocumentDetail,
│   │                            # Subscription, Settings
│   └── mockup-sandbox/     # Design/preview sandbox
├── lib/
│   ├── api-spec/            # OpenAPI spec (source of truth) + Orval config
│   ├── api-zod/             # Generated Zod schemas
│   ├── api-client-react/    # Generated React Query hooks
│   └── db/                  # Drizzle schema (users, subscriptions, documents)
├── scripts/                 # Workspace utility scripts
├── .env.example
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20+ (v24 recommended)
- **pnpm** v9+ (v10 recommended)
- **PostgreSQL** running locally or hosted

### 1. Clone & configure environment

```bash
git clone https://github.com/leevanshi/lex-ai.git
cd lex-ai
cp .env.example .env
```

Fill in `.env` with your database connection string and [Clerk](https://clerk.com) credentials (see [Environment Variables](#-environment-variables) below).

### 2. Install dependencies

```bash
pnpm install
```

### 3. Push the database schema

```bash
pnpm --filter @workspace/db run push
```

### 4. Run the app

In two terminals:

```bash
# Backend API
pnpm --filter @workspace/api-server run dev

# Frontend
pnpm --filter @workspace/lexai run dev
```

The API server listens on the port set in `.env` (default `8080`); the Vite dev server will print its local URL in the terminal.

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port for the Express API server (default `8080`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key (backend) |
| `CLERK_SECRET_KEY` | Clerk secret key (backend) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Same publishable key, exposed to the Vite frontend |
| `VITE_CLERK_PROXY_URL` | *(optional)* Clerk proxy URL for production deployments |

## 🔌 API Reference

All endpoints are served under `/api` and defined in `lib/api-spec/openapi.yaml`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/healthz` | Health check |
| `GET` | `/users/me` | Get the current authenticated user |
| `GET` | `/users/me/subscription` | Get the current user's subscription |
| `GET` | `/subscriptions/plans` | List available plans |
| `POST` | `/subscriptions/upgrade` | Upgrade the current subscription |
| `POST` | `/subscriptions/cancel` | Cancel the current subscription |
| `GET` | `/document-types` | List supported document types and their form fields |
| `GET` | `/documents` | List the current user's documents |
| `POST` | `/documents` | Create a new document |
| `GET` | `/documents/:id` | Get a single document |
| `PATCH` | `/documents/:id` | Update a document |
| `GET` | `/documents/:id/download` | Download a generated document |
| `GET` | `/documents/dashboard-stats` | Usage stats for the dashboard |
| `GET` | `/documents/recent` | Recently generated documents |

## 📜 Available Scripts

Run from the repo root:

| Command | Description |
|---|---|
| `pnpm install` | Install all workspace dependencies |
| `pnpm run build` | Typecheck and build all packages |
| `pnpm run typecheck` | Typecheck shared libraries and apps |
| `pnpm --filter @workspace/db run push` | Push the Drizzle schema to Postgres |
| `pnpm --filter @workspace/api-server run dev` | Run the API server in watch mode |
| `pnpm --filter @workspace/lexai run dev` | Run the frontend in dev mode |

## 🗺 Roadmap

- [ ] E-signature integration
- [ ] Team/multi-seat workspaces for Enterprise plan
- [ ] Custom document templates
- [ ] Stripe billing integration for plan upgrades

## 📄 License

Licensed under the [MIT License](LICENSE).
