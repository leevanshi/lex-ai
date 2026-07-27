# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@9

# Set working directory
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY .npmrc ./

# Copy library dependencies
COPY lib ./lib
COPY artifacts ./artifacts

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the workspace
RUN pnpm run build

# Production stage
FROM node:20-alpine AS runner

# Install pnpm
RUN npm install -g pnpm@9

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built artifacts
COPY --from=builder /app/artifacts/api-server/dist ./dist
COPY --from=builder /app/artifacts/api-server/package.json ./package.json
COPY --from=builder /app/artifacts/api-server/node_modules ./node_modules
COPY --from=builder /app/lib/db/node_modules ./lib/db/node_modules
COPY --from=builder /app/lib/api-zod/node_modules ./lib/api-zod/node_modules

# Set environment to production
ENV NODE_ENV=production

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
