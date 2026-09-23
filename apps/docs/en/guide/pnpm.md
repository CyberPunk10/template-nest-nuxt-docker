# pnpm and Corepack

## Project requirements

```json
"packageManager": "pnpm@11.27.1",
"engines": {
  "node": ">=24",
  "pnpm": ">=11",
  "npm": "please-use-pnpm"
}
```

`.npmrc` has `engine-strict=true` — `pnpm install` **refuses** to install dependencies on an unsupported Node version, instead of a silent install that could break later at runtime.

## The problem: multiple pnpm versions installed at once

On a single machine, pnpm can be installed at least three different ways, and they **don't know about each other**:

| Method                                       | Example path                                              | Managed by                            |
| -------------------------------------------- | --------------------------------------------------------- | ------------------------------------- |
| Standalone script (`get.pnpm.io/install.sh`) | `~/.local/share/pnpm/pnpm`                                | itself, version fixed at install time |
| `npm install -g pnpm`                        | `~/.nvm/versions/node/vX.Y.Z/bin/pnpm`                    | the currently active nvm Node version |
| System package / global npm                  | `/usr/bin/pnpm` → `/usr/lib/node_modules/pnpm`            | system Node, outside nvm              |
| **Corepack**                                 | a shim that substitutes the version from `packageManager` | **each** project's `package.json`     |

If several of these exist at once, running `pnpm ...` in a terminal runs **whichever comes first in `$PATH`** — not necessarily the one the current project needs. A standalone install via `~/.zshrc` (`export PATH="$PNPM_HOME:$PATH"`) deliberately puts itself at the front of `PATH`, so it intercepts the call before the Corepack shim gets a chance to run.

### How this shows up in practice

Symptom — an old pnpm version doesn't understand a lockfile built by a newer version:

```
[ERROR] Cannot use 'in' operator to search for 'integrity' in undefined
```

Or an explicit mismatch with `engines.pnpm` in `package.json`:

```
ERR_PNPM_UNSUPPORTED_ENGINE  Unsupported environment (bad pnpm and/or Node.js version)
Expected version: >=11
Got: 8.15.5
```

Check what's actually being called:

```bash
which pnpm       # which binary resolves first
pnpm --version   # what it actually reports
```

If the version doesn't match `packageManager` in the open project's `package.json` — one of the three "direct" install methods kicked in, not Corepack.

## Corepack — the recommended way

[Corepack](https://nodejs.org/api/corepack.html) is built into Node.js (stable since v16.9+) and solves the problem differently: instead of installing pnpm globally with a fixed version, it substitutes, **on every run**, whichever version is specified in the open project's `packageManager`. Open project A with `pnpm@9` — `9` runs; switch to project B with `pnpm@11.27.1` — `11.27.1` runs. No global version to keep track of by hand.

This is the officially recommended approach for projects with a `packageManager` field — without Corepack, that field becomes inert text, the version silently drifts, and you only find out when something breaks.

### Basic commands

```bash
corepack enable                # enable Corepack globally
corepack disable               # disable it

corepack use pnpm@latest       # update the project's packageManager to the latest version
corepack use pnpm@9.15.0       # pin a specific version

corepack install               # install the version specified in the current package.json's packageManager
```

`corepack use pnpm@X` doesn't just switch the version — it also updates `packageManager` in `package.json` and adds an integrity hash to it (`pnpm@11.27.1+sha512.<hash>`), which Corepack uses to verify the downloaded binary's integrity on every install.

### In a monorepo — the field only goes in the root

`packageManager` is a setting for the **whole workspace**, read by pnpm only from the root `package.json`. There's no need to add it to `apps/*/package.json` — pnpm ignores it there anyway, and duplicating it only risks forgetting to update one of the copies.

## Switching to Corepack: step by step

If one or more "direct" install methods are already on the machine, they should be removed one by one — otherwise Corepack keeps getting overridden by whatever comes earlier in `$PATH`.

### 1. Standalone install (`~/.local/share/pnpm`)

```bash
rm -rf ~/.local/share/pnpm
```

Then remove the block from `~/.zshrc` (or `~/.bashrc`) — it usually looks like this:

```bash
# pnpm
export PNPM_HOME="/home/user/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
# pnpm end
```

### 2. Global pnpm inside an nvm Node version

```bash
npm uninstall -g pnpm
corepack enable
```

If you use multiple Node versions via nvm — check each one:

```bash
for d in ~/.nvm/versions/node/*/; do
  [ -d "$d/lib/node_modules/pnpm" ] && echo "$(basename "$d"): pnpm installed globally"
done
```

### 3. System install (`/usr/bin/pnpm`)

```bash
sudo rm /usr/bin/pnpm /usr/bin/pnpx /usr/bin/pn /usr/bin/pnx
sudo rm -rf /usr/lib/node_modules/pnpm
```

### Checking after each step

```bash
which pnpm       # the path should go through the corepack shim
pnpm --version   # should match packageManager in package.json
```

Repeat steps 1–3 in order, re-checking `which pnpm` after each — that way you can immediately see which method was intercepting the command next.

## Corepack in Docker

Base Node images (`node:24-alpine` and so on) ship with Corepack included, but in newer Node versions it isn't enabled by default — it needs to be enabled explicitly in the `Dockerfile`:

```dockerfile
FROM node:24-alpine
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
```

**Don't pin a pnpm version manually in the `Dockerfile`** (`RUN npm install -g pnpm@X.Y.Z`) — this creates the same drift problem as on a local machine: the version baked into the image can silently diverge from the project's `packageManager`. `corepack enable` + `packageManager` in `package.json` should remain the single source of truth — then the version inside the container automatically matches the one developers use.
