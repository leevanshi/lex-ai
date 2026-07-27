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

## Production Deployment

### Prerequisites

- **Docker** (v20+)
- **Docker Compose** (v2+)
- Production Clerk API keys
- PostgreSQL database (or use the included PostgreSQL container)

### Quick Start with Docker Compose

1. **Configure environment variables:**

```bash
cp .env.example .env.production
```

Edit `.env.production` with your production values:
- Set strong `POSTGRES_PASSWORD`
- Replace Clerk keys with production keys (`pk_live_...`, `sk_live_...`)
- Configure any other required environment variables

2. **Deploy using Docker Compose:**

```bash
# On Linux/Mac
./scripts/deploy.sh

# On Windows PowerShell
./scripts/deploy.ps1

# Or manually
docker-compose -f docker-compose.yml --env-file .env.production up -d
```

3. **Access the application:**
- Frontend: http://localhost
- API: http://localhost:8080
- Database: localhost:5432

### Production Deployment with Monitoring

For production with monitoring (Prometheus + Grafana):

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production --profile monitoring up -d
```

This adds:
- **Prometheus** on port 9090 for metrics collection
- **Grafana** on port 3001 for visualization (default password: `admin`)

### Stopping the Application

```bash
# On Linux/Mac
./scripts/stop.sh

# On Windows PowerShell
./scripts/stop.ps1

# Or manually
docker-compose down
docker-compose down -v  # Remove volumes as well
```

### CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/ci-cd.yml`) that:

1. Runs tests and type checking on every push/PR
2. Builds and pushes Docker images to Docker Hub on main branch
3. Deploys to production server via SSH on main branch

**Required GitHub Secrets:**
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password/token
- `DEPLOY_HOST` - Production server hostname
- `DEPLOY_USER` - SSH username on production server
- `DEPLOY_SSH_KEY` - SSH private key for deployment

### Manual Docker Build

If you prefer to build images manually:

```bash
# Build API server
docker build -f artifacts/api-server/Dockerfile -t lexai-api:latest .

# Build frontend
docker build -f artifacts/lexai/Dockerfile -t lexai-frontend:latest .

# Run containers
docker run -d -p 8080:8080 --name lexai-api lexai-api:latest
docker run -d -p 80:80 --name lexai-frontend lexai-frontend:latest
```

### Health Checks

The application includes health check endpoints:
- Frontend: `GET /health`
- API: `GET /api/health` or `GET /api/healthz`

Docker Compose automatically monitors these endpoints and restarts containers if they become unhealthy.

### Security Considerations

1. **Environment Variables:** Never commit `.env.production` to version control
2. **Database Passwords:** Use strong, unique passwords in production
3. **Clerk Keys:** Use production keys, never test keys in production
4. **SSL/TLS:** Configure SSL termination at your reverse proxy or load balancer
5. **Network Security:** Use Docker networks to isolate services
6. **Regular Updates:** Keep Docker images and dependencies updated

### Scaling

For horizontal scaling:

1. **Database:** Use a managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
2. **Load Balancer:** Add a load balancer (nginx, HAProxy, or cloud LB) in front of multiple frontend instances
3. **API Server:** Run multiple API server instances behind the load balancer
4. **Session Storage:** Configure Clerk to use a shared session store if using multiple API instances

### Monitoring

- **Logs:** View logs with `docker-compose logs -f [service-name]`
- **Metrics:** Enable the monitoring profile for Prometheus/Grafana
- **Health Checks:** Monitor health endpoints with your monitoring solution
- **Database:** Use PostgreSQL monitoring tools for database performance
