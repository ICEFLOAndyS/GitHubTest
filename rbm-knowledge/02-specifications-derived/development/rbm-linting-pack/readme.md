# RBM Linting & TypeScript Config Pack

This pack contains **exact ESLint** and **tsconfig** snippets aligned to RBM Development Standards §7A (TypeScript/React/JS) and §11 (no inline HTML injection).

## Files
- `.eslintrc.cjs` — ESLint rules for TS/React, hooks, accessibility and unsafe HTML injection bans.
- `tsconfig.json` — Strict TypeScript defaults (including `useUnknownInCatchVariables` and `noUncheckedIndexedAccess`).

## Notes for ServiceNow IDE / Build Agent
- If your toolchain supports type-aware linting, enable it by uncommenting the `parserOptions.project` lines in `.eslintrc.cjs`.
- Install the listed ESLint plugins as devDependencies in the UI project package.json.

## Minimum devDependencies
- eslint
- @typescript-eslint/parser
- @typescript-eslint/eslint-plugin
- eslint-plugin-react
- eslint-plugin-react-hooks
- eslint-plugin-import
- eslint-plugin-jsx-a11y
