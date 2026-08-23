# Getting started

## Quick start

You need [Node.js >= 24 and pnpm](/en/guide/getting-started/setup) — the script handles the rest:

```bash
git clone git@github.com:CyberPunk10/template-nest-nuxt-docker.git
cd template-nest-nuxt-docker
pnpm install
pnpm dev
```

It opens at [http://localhost:3200](http://localhost:3200). Everything else on this page is about how this mode differs from Docker, and what to configure if something didn't start.

## Two modes

Two ways to run the project, each with its own purpose:

|                                                    | What for                                                             |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| [**pnpm**](/en/guide/getting-started/run-pnpm)     | Everyday development: hot reload, fast start, no containers          |
| [**Docker**](/en/guide/getting-started/run-docker) | A production rehearsal: the same images and layout that go to deploy |

Both modes run the same applications and differ only in how you reach them: under pnpm each listens on its own port, under Docker everything arrives at the reverse proxy.

## Where to start

1. [Setup](/en/guide/getting-started/setup) — Node.js, pnpm, Docker, `.env` files
2. [Run with pnpm](/en/guide/getting-started/run-pnpm) or [with Docker](/en/guide/getting-started/run-docker)

## How the modes differ

| What          | pnpm dev                          | Docker                       |
| ------------- | --------------------------------- | ---------------------------- |
| Application   | `http://localhost:3200`           | `http://localhost/`          |
| Documentation | `http://localhost:5173/dev/docs/` | `http://localhost/dev/docs/` |
| Swagger       | `http://localhost:3100/api/docs`  | `http://localhost/api/docs`  |
| Hot reload    | yes                               | no                           |
| Reverse proxy | no                                | yes                          |

The paths match — only the host and port differ. Addresses live in environment variables so the code doesn't need to know them.
