# reinstall.mjs

Removes `node_modules` and `pnpm-lock.yaml` (if present), then runs `pnpm install` from scratch.

::: warning Not a way to update dependencies
Deleting `pnpm-lock.yaml` wipes the pinned versions of all transitive dependencies — `pnpm install` resolves them again within the ranges allowed by `package.json` (`^`/`~`), which means it can silently pull in newer minor/patch versions of transitive packages, including breaking changes in them. Early in a template's life, while there aren't many dependencies yet, this is a cheap way to fix a locally drifted state (e.g. after switching between branches with different lockfiles). But once the project grows into production with a settled dependency tree, updating this way is no longer appropriate — any version bump should be deliberate and visible in the `pnpm-lock.yaml` diff, not the result of a full recompute from scratch.

The idiomatic way to update dependencies is `pnpm update` (updates within the ranges from `package.json`, only extending the existing lockfile, not deleting it) or `pnpm update --interactive` (shows a list of available updates and lets you pick which to accept). For updating a single package — `pnpm update <package>`.
:::

## Why package.json versions fall behind

`reinstall` has a non-obvious side effect: it installs fresh versions but **leaves the ranges in `package.json` untouched**. The manifest says `^11.0.1`, the installed version is `11.2.1` — both are correct, the range allows either, and nothing signals the gap.

Over time the drift grows and `package.json` stops answering the question "what is this project actually running on". That hurts a template in particular: a newcomer reads the manifest and sees year-old versions.

To pull the ranges up to what is installed:

```bash
pnpm deps:sync
```

This is `pnpm update -r` — it updates packages within their ranges and **writes the new values back into `package.json`** across every workspace. Unlike `reinstall`, the lockfile is kept, so transitive dependencies aren't recomputed from scratch.


Useful when the local dependency state has drifted (e.g. after switching branches with different lockfiles) and you need a clean start — but not as an everyday tool.

## Usage

```bash
pnpm reinstall
```
