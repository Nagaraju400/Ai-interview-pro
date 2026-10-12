# syntax=docker/dockerfile:1

# 1. Base image
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# 2. Dependencies stage
FROM base AS deps
WORKDIR /app

# Install native build tools required for node-gyp (better-sqlite3, pg)
RUN apk add --no-cache python3 make g++

# Copy package manifests and Prisma schema
COPY package.json package-lock.json* ./
COPY prisma ./prisma

# Install node dependencies
RUN npm ci

# 3. Builder stage
FROM base AS builder
WORKDIR /app

# Copy installed dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept build arguments for environment variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Set production build environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV DIRECT_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-"https://adbigszyxrqzlfnsflcm.supabase.co"}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYmlnc3p5eHJxemxmbnNmbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMTM2MTgsImV4cCI6MjEwMDg4OTYxOH0.lwwewvmtLvalTLhwMTlyA5WnFbneodTTBwrcmjMriaw"}

# Generate Prisma Client and build Next.js application
RUN npx prisma generate
RUN npm run build

# 4. Production Runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root system user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set up prerender cache directory permissions
RUN mkdir -p .next && chown nextjs:nodejs .next

# Copy standalone build output, public assets, and static files with correct ownership
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and generated Prisma client files for runtime queries & migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/lib/generated ./lib/generated

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
