# Multi-Stage Production Dockerfile for Backend Service
# ── Stage 1: Build & Dependencies ──
FROM node:20-alpine AS dependencies

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies
RUN npm ci --only=production

# ── Stage 2: Runtime Production Image ──
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S expressuser -u 1001

# Copy dependencies and application code
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY prisma ./prisma/
COPY server.js ./
COPY src ./src/

# Create uploads directory and set permissions
RUN mkdir -p uploads && chown -R expressuser:nodejs /app

USER expressuser

EXPOSE 5000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

CMD ["node", "server.js"]
