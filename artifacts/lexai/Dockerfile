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

# Production stage - use nginx to serve static files
FROM nginx:alpine AS runner

# Copy built frontend assets
COPY --from=builder /app/artifacts/lexai/dist/public /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
