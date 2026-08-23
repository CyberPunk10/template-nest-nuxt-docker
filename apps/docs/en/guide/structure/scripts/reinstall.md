# reinstall.mjs

Removes `node_modules` and `pnpm-lock.yaml` (if present), then runs `pnpm install` from scratch.

::: warning Not a way to update dependencies
Deleting `pnpm-lock.yaml` wipes the pinned versions of all transitive dependencies — `pnpm install` resolves them again within the ranges allowed by `package.json` (`^`/`~`), which means it can silently pull in newer minor/patch versions of transitive packages, including breaking changes in them. Early in a template's life, while there aren't many dependencies yet, this is a cheap way to fix a locally drifted state (e.g. after switching between branches with different lockfiles). But once the project grows into production with a settled dependency tree, updating this way is no longer appropriate — any version bump should be deliberate and visible in the `pnpm-lock.yaml` diff, not the result of a full recompute from scratch.

The idiomatic way to update dependencies is `pnpm update` (updates within the ranges from `package.json`, only extending the existing lockfile, not deleting it) or `pnpm update --interactive` (shows a list of available updates and lets you pick which to accept). For updating a single package — `pnpm update <package>`.
:::

Useful when the local dependency state has drifted (e.g. after switching branches with different lockfiles) and you need a clean start — but not as an everyday tool.

## Usage

```bash
pnpm reinstall
```
