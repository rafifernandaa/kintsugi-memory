# Multi-stage Dockerfile for Kintsugi Memory on Google Cloud Run
FROM node:22-slim AS builder

WORKDIR /app

# Install all build dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build frontend & backend bundle
COPY . .
RUN npm run build

# Production runtime image
FROM node:22-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
RUN npm install --omit=dev

# Copy built server and static assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/.env.example ./.env

EXPOSE 8080

CMD ["node", "dist/server.cjs"]
