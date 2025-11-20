# ============================================
# Stage 1: Build Frontend
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy frontend source files and configuration
COPY client ./client
COPY shared ./shared
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY tsconfig.json ./
COPY postcss.config.js ./
COPY components.json ./

# Build frontend only (not backend - it runs with tsx)
RUN npx vite build

# ============================================
# Stage 2: Build Backend
# ============================================
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy backend source files
COPY server ./server
COPY shared ./shared

# ============================================
# Stage 3: Production Runtime
# ============================================
FROM node:20-alpine AS production

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy backend dependencies and source from builder
COPY --from=backend-builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=backend-builder --chown=nodejs:nodejs /app/server ./server
COPY --from=backend-builder --chown=nodejs:nodejs /app/shared ./shared
COPY --from=backend-builder --chown=nodejs:nodejs /app/package.json ./

# Copy built frontend assets from frontend builder
COPY --from=frontend-builder --chown=nodejs:nodejs /app/dist ./dist

# Create uploads directory for file storage
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app/uploads

# Switch to non-root user
USER nodejs

# Expose port 5000
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start application using tsx for TypeScript support
CMD ["npx", "tsx", "server/index.ts"]
