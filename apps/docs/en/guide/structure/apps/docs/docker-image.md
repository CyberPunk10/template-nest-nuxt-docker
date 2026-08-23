# apps/docs

Builds the VitePress static output into `.vitepress/dist` — and stops there. There's no `CMD` in the image and no server of its own: the reverse proxy picks up the finished files during its own build and serves them at `/dev/docs/`.

## How it works

The finished `dist` reaches the proxy image as a build context:

```yaml
nginx:
  build:
    dockerfile: infra/nginx/Dockerfile
    additional_contexts:
      docs: service:docs-builder

docs-builder:
  build:
    dockerfile: apps/docs/Dockerfile
  scale: 0        # needed as an image source, never started as a container
```

In `infra/nginx/Dockerfile` it looks like this:

```dockerfile
COPY --from=docs /app/apps/docs/.vitepress/dist /srv/docs
```

The point of the split: each application owns its build, and the proxy only serves the result.

`scale: 0` keeps `docs-builder` from starting on `docker compose up`. Compose builds it anyway — it's listed as a build context for nginx. But starting a container from it makes no sense: it would exit immediately, because there's nothing to run in the image.

The `service:docs-builder` syntax references another compose service as a source of files. Compose understands it **from version 2.33**; on older ones the build fails with `failed to get build context docs`.

## Seeing the result

You don't run this container on its own — there's nothing to run. The documentation appears together with the proxy:

```bash
docker compose up -d nginx   # → http://localhost/dev/docs/
```

For editing the texts themselves Docker isn't needed at all, the dev server is faster:

```bash
pnpm --filter @repo/docs dev   # → http://localhost:5173/dev/docs/
```

## Building the image by hand

Rarely needed — for example, to check that the build passes:

```bash
docker build -f apps/docs/Dockerfile -t docs-preview .
```

You won't be able to run it: the container exits at once, because there's no process in the image.

Clean up afterwards:

```bash
docker rmi docs-preview
```
