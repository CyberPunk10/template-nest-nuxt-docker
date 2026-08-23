# packages/ui

A Vue component library. Used by the frontend only.

```
packages/ui/
├── src/
│   ├── components/     UiButton, UiBadge, UiCard
│   └── index.ts
├── package.json
└── tsconfig.json       doesn't extend base — needs jsx + DOM
```

## Why it isn't compiled

The package stays as source. Only the frontend uses it, and Vite handles `.vue` and `.ts` directly — an intermediate build step isn't needed.

It couldn't be compiled with plain `tsc` anyway: `.vue` files need `vue-tsc` and a pipeline of their own. The `tsconfig.json` here only serves `vue-tsc --noEmit` during type checking.

## Its own TypeScript setup

The only package that **doesn't extend** `tsconfig.base.json`: it needs `jsx` and the `DOM` lib, which the base config doesn't have.

Package manifest — [package.json](/en/guide/structure/packages/ui/package-json).
