# Docker

The project has four independent [Dockerfiles](/en/guide/docker/dockerfiles) — one per application (`backend`, `frontend`, `docs`) plus the reverse proxy (`nginx`) — and a single [docker-compose.yml](/en/guide/structure/docker-compose) that assembles them into a stack.

## Single entry point

Only **one port** is published — `NGINX_HOST_PORT` (`80` by default). Backend and frontend declare their ports with `expose`: inside the Docker network they reach each other, but nothing is forwarded to the host. All external traffic goes through the reverse proxy.

```
browser  →  nginx:80
  │
  ├── /dev/docs/  →  /srv/docs       VitePress static files
  ├── /api/docs   →  backend:3100    Swagger UI
  └── /*          →  frontend:3200   Nuxt SSR
                          │
                          └──  backend:3100   API via the BFF proxy
```

How the routing works and what else the proxy does — see [Reverse proxy](/en/guide/reverse-proxy).

## Where to start

- [Dockerfiles](/en/guide/docker/dockerfiles) — how the images are built: stages, layers, versions
- [docker compose](/en/guide/structure/docker-compose) — how to bring up the stack: variables, network, start and stop

If you just want to run the project — [Running with Docker](/en/guide/getting-started/run-docker).
