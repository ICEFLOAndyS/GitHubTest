# RBM Design System — Build Agent Readme (Authoritative)

This folder contains the **authoritative RBM Design System** for **React-first** RBM applications.

## 1. Authority & Rule Hierarchy (MUST FOLLOW)

Build Agent MUST apply rules in this order:

1. **/01-standards-authoritative/01-standards-authoritative/rbm-design-system/rbm-design-system.md** (authoritative spec; single source of truth)
2. **/01-standards-authoritative/01-standards-authoritative/rbm-design-system/tokens/rbm.tokens.css** (canonical token contract)
3. **/01-standards-authoritative/01-standards-authoritative/rbm-design-system/tokens/rbm.density.css** (density contract)
4. **/01-standards-authoritative/01-standards-authoritative/rbm-design-system/build-agent/rbm-ui-enforcement.prompt.md** (hard enforcement instructions)
5. **/rbm-design-system/reference/** (reference implementations; “how to” patterns)

If a rule is not defined in the authoritative spec, assume it is **forbidden**.

---

## 2. Mandatory Import Pattern (React runtime)

All RBM React feature code MUST import UI components only from:

- `src/ui/index.ts`

Example:

```ts
import { Card, Button, DataGrid, SidePanel, ToastProvider, useToast } from "../ui";
```

Feature code MUST NOT re-implement primitives (Button, Modal, Tabs, etc.) outside `src/ui`.

---

## 3. Token Rules (Non-Negotiable)

### 3.1 Hard-coded styling is forbidden
Build Agent MUST NOT generate:
- inline `style={{ ... }}`
- hard-coded hex colours (`#RRGGBB`)
- hard-coded `rgb()`, `rgba()`, `hsl()`
- hard-coded spacing, radii, typography sizes
- unapproved shadows or gradients

### 3.2 CSS variables MUST be used
All styling MUST use RBM tokens (CSS variables) from:
- `/01-standards-authoritative/01-standards-authoritative/rbm-design-system/tokens/rbm.tokens.css`
- `/01-standards-authoritative/01-standards-authoritative/rbm-design-system/tokens/rbm.density.css`
- optional theme overrides

Components MUST NOT use palette colours directly for state rendering; use semantic tokens (`--rbm-color-success`, etc.).

---

## 4. Density Contract (MUST SUPPORT)

All interactive components MUST adapt to `data-density`:

- `compact`
- `cozy`
- `comfortable`

The root density is set on `document.documentElement`:

```ts
document.documentElement.setAttribute("data-density", "cozy");
```

Contract tokens:
- `--rbm-control-height`
- `--rbm-row-height`
- `--rbm-space-control`

---

## 5. Accessibility Contract (MUST PASS)

Minimum: **WCAG 2.1 AA**.

Build Agent MUST ensure:
- keyboard navigation works end-to-end
- focus-visible is always present
- icon-only controls have `aria-label`
- colour is never the only indicator of meaning
- reduced motion is respected for skeleton / animations

---

## 6. Operational UX Patterns (MANDATORY)

### 6.1 Destructive actions
Destructive actions MUST use:
- `ConfirmDialog` for confirmation
- `useConfirmableAction` pattern for safe execution
- `ToastProvider` to display outcome
- audit hook points in feature layer (e.g., record an audit event)

### 6.2 List views
List views MUST use:
- `DataGrid` (simple) or `SelectableDataGrid` (bulk actions)
- `FilterBar` + `ResultState` for empty/no-results
- `Pagination` where needed
- `RowActionsMenu` where actions > 2

### 6.3 Execution views
Execution views SHOULD use:
- `ExecutionControlBar` for start/pause/resume/complete/stop
- `Steps` for runbook step timelines
- `AuditTrail` for immutable history

---

## 7. Build-time Enforcement (CI MUST FAIL if violated)

### 7.1 ESLint
The ESLint config is at:
- `/01-standards-authoritative/01-standards-authoritative/rbm-design-system/eslint/eslint.config.mjs`

Teams MUST wire it into the repo root via:
- copying to root `eslint.config.mjs`, or
- referencing it from the root config.

### 7.2 Colour grep gate
The colour grep script is at:
- `/01-standards-authoritative/01-standards-authoritative/rbm-design-system/eslint/ci-color-grep.sh`

It MUST be run in CI to fail builds on hard-coded colours:
- exclude token files
- scan `src/` for hex/rgb/hsl usage

---

## 8. Files included in this bundle

### 8.1 Authoritative documents
- `/01-standards-authoritative/01-standards-authoritative/rbm-design-system/rbm-design-system.md`
- `/01-standards-authoritative/01-standards-authoritative/rbm-design-system/build-agent/rbm-ui-enforcement.prompt.md`

### 8.2 Tokens
- `/01-standards-authoritative/01-standards-authoritative/rbm-design-system/tokens/rbm.tokens.css`
- `/01-standards-authoritative/01-standards-authoritative/rbm-design-system/tokens/rbm.density.css`
- `/01-standards-authoritative/01-standards-authoritative/rbm-design-system/tokens/rbm.theme.light.css`
- `/01-standards-authoritative/01-standards-authoritative/rbm-design-system/tokens/rbm.theme.dark.css`
- `/01-standards-authoritative/01-standards-authoritative/rbm-design-system/tokens/rbm.theme.hc.css`
- `/01-standards-authoritative/01-standards-authoritative/rbm-design-system/tokens/rbm.base.css`

### 8.3 Reference implementations
- `/rbm-design-system/reference/src/ui/**` (TypeScript + CSS)

---

## 9. Build Agent “header block” (paste into every build request)

```text
RBM DESIGN SYSTEM (AUTHORITATIVE)
- You MUST comply with: /01-standards-authoritative/01-standards-authoritative/rbm-design-system/rbm-design-system.md
- Tokens: /rbm-design-system/tokens/*
- Use only shared UI exports from: src/ui/index.ts
- Inline styles are forbidden. No hard-coded colours (CI will fail).
- Destructive actions must use ConfirmDialog + ToastProvider patterns.
- Density must work for compact/cozy/comfortable.
- Accessibility WCAG 2.1 AA minimum: focus-visible, keyboard, aria-labels for icon-only.
```

---

## 10. Notes for UI Builder / Next Experience

When building in ServiceNow UI Builder:
- Use native Next Experience components
- Do not override native Horizon behaviour with RBM tokens
- Icon usage switches to `sn-icon` conventions (defined in RBM Icons Standard)

