# .husky/

The project's git hooks.

```
.husky/
├── pre-commit          runs lint-staged before a commit
└── _/                  husky's internals, never committed
```

## The pre-commit hook

`.husky/pre-commit` calls `lint-staged`, so the linter only walks the **changed files** rather than the whole repository. The hooks install themselves: the root `package.json` has a `prepare: husky` script that pnpm runs after installing dependencies.

The hook itself is a single line:

```bash
pnpm lint-staged
```

What to run on those files is decided by `lint-staged.config.js` at the root: `eslint --fix` for `js/mjs/ts/tsx/vue`.

## Skipping the check once

```bash
git commit --no-verify -m "..."
```

The flag skips hooks entirely. Use it rarely: the linter on commit is the last check before the code reaches a shared branch.
