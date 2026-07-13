FROM node:24-alpine AS base
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/docs/package.json ./apps/docs/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @repo/docs build

# ---- production image ----
# Доки — статический сайт.
FROM nginx:alpine AS runner
COPY apps/docs/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/docs/.vitepress/dist /srv/docs
EXPOSE 80
