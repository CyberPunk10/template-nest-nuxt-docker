FROM node:24.18-alpine AS base
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/docs/package.json ./apps/docs/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @repo/docs build

# ---- production image ----
# Доки — статический сайт. nginx:alpine уже запускает worker-процессы
# от непривилегированного пользователя nginx — отдельный USER не нужен.
#
# nginx.conf.template — не готовый конфиг: встроенный entrypoint-скрипт
# образа сам прогоняет *.template из /etc/nginx/templates/ через envsubst
# и кладёт результат в /etc/nginx/conf.d/, подставляя реальные значения ENV
# (${PORT} → значение переменной PORT) до старта nginx.
FROM nginx:alpine AS runner
ENV PORT=80
COPY apps/docs/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/apps/docs/.vitepress/dist /srv/docs
EXPOSE ${PORT}
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:${PORT}/ || exit 1