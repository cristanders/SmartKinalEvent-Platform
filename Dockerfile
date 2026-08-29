# Production Multi-Stage Dockerfile for Google Cloud Run
# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Final Light Production Image
FROM node:20-alpine
WORKDIR /app

# Security: Run as non-root user
USER node

# Copy dependencies and source code
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node . .

# Google Cloud Run dynamically injects the PORT environment variable (defaults to 8080)
ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "server.js"]
