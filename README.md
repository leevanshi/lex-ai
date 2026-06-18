# LexAI — Legal Document Generator

A SaaS platform that lets startups generate legally-sound documents (NDAs, service agreements, employment contracts, IP assignments, and more) in minutes, with tiered subscription plans.

## Local Development Setup

Follow these steps to run the application on your local machine.

### 1. Prerequisites

Ensure you have the following installed:
- **Node.js** (v20+ or v24 recommended)
- **pnpm** (v9+ or v10 recommended)
- **PostgreSQL** database running locally or hosted

### 2. Environment Configuration

Create a `.env` file in the root of the project by copying the `.env.example` template:

```bash
cp .env.example .env
```

Open `.env` and fill in the required environment variables:
- `DATABASE_URL`: Your local or remote PostgreSQL connection string.
- `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`: Get these from your Clerk Dashboard to enable authentication.
- `VITE_CLERK_PUBLISHABLE_KEY`: Same as `CLERK_PUBLISHABLE_KEY` (prefix required for Vite client-side access).

### 3. Install Dependencies

Install all package dependencies in the workspace:

```bash
pnpm install
```

### 4. Database Setup

Once your `DATABASE_URL` is set, push the Drizzle schema to your PostgreSQL database:

```bash
pnpm --filter @workspace/db run push
```

### 5. Running the Application

To run both the backend API server and the React frontend concurrently:

- Run the API server:
  ```bash
  pnpm --filter @workspace/api-server run dev
  ```
- Run the Frontend application:
  ```bash
  pnpm --filter @workspace/lexai run dev
  ```

Alternatively, you can start the entire workspace in development mode (if a root dev command is set up).

## Stack

- **Package Manager**: pnpm workspaces
- **Frontend**: React + Vite, Wouter routing, TanStack Query, shadcn/ui, Framer Motion, Recharts
- **Authentication**: Clerk (same-domain cookie auth / proxy-based)
- **Backend API**: Express 5, contract-first OpenAPI spec → Orval codegen
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, `drizzle-zod`
- **Build**: esbuild (CommonJS/ESM bundling)

## Project Structure

- `lib/db/src/schema/` — DB schema (users, subscriptions, documents tables)
- `lib/api-spec/openapi.yaml` — OpenAPI specification (source of truth for API contracts)
- `lib/api-client-react/src/generated/api.ts` — Generated API hooks
- `artifacts/api-server/src/routes/` — Express API routes (users, subscriptions, documents)
- `artifacts/api-server/src/lib/documentGenerator.ts` — Document templates & generation logic
- `artifacts/lexai/src/pages/` — React frontend pages
