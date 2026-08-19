# package.json

The backend application's manifest. Its scripts work only inside their own workspace — from the root they're called through a filter (`pnpm --filter backend dev`) or transitively from the root commands.

| Script                                          | Command              | What it does                                         |
| ----------------------------------------------- | -------------------- | ---------------------------------------------------- |
| `dev`                                           | `nest start --watch` | Local development with hot-reload                    |
| `build`                                         | `nest build`         | Production build into `dist/`                        |
| `start`                                         | `nest start`         | Runs the built `dist/` without watch mode            |
| `start:prod`                                    | `node dist/main`     | Runs in production mode (what the `Dockerfile` uses) |
| `lint`                                          | `eslint ... --fix`   | Linter with auto-fix                                 |
| `type-check`                                    | `tsc --noEmit`       | Type-checks without building                         |
| `test` / `test:watch` / `test:cov` / `test:e2e` | `jest ...`           | Unit and e2e tests                                   |

What lives where — [apps/backend](/en/guide/structure/apps/backend/).
