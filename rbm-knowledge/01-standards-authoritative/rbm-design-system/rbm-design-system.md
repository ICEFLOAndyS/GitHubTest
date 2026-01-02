# RBM DESIGN SYSTEM  
**Authoritative Specification (React-First)**  
**Version:** 1.1  
**Status:** Approved  
**Owner:** ICEFLO – RBM Architecture  
**Applies to:** All RBM React applications and shared UI packages

> **Classification:** Normative (Mandatory)  
> **Scope:** RBM Design System  
> **Enforcement:** Orchestrator enforced  
> **Deviation:** Not permitted without governed exception

---

## 1. Purpose

This document defines the **authoritative RBM Design System** for all **React-based RBM user interfaces**.

The rbm design system:
- Is **React-first**
- Is **token-driven**
- Is **Horizon-aligned in concept and visual language**
- Is **independent of ServiceNow UI Builder**
- Enforces **consistency, accessibility, and operational clarity**

ServiceNow Next Experience components are **explicitly out of scope** except when used inside UI Builder, where native Horizon styling applies.

---

## 2. Applicability & Enforcement

### 2.1 Mandatory scope
This specification **MUST** be applied to:

- All RBM React components
- All shared RBM UI libraries
- All custom dashboards, workspaces, and embedded apps
- All execution, recovery, approval, and audit UIs

### 2.2 Enforcement model
- **Build Agent** MUST reject non-compliant UI code
- **Architect review** required for any deviation
- **QA** MUST validate accessibility and token usage

Non-compliant components **MUST NOT** be merged.

---

## 3. Runtime Strategy (Normative)

| Runtime | Design System |
|------|--------------|
| React (default) | **RBM Design System (this spec)** |
| UI Builder | Native ServiceNow Next Experience / Horizon |

RBM tokens **MUST NOT override** native Horizon behaviour in UI Builder.

---

## 4. Design Principles (Binding)

1. **Horizon-aligned, not Horizon-dependent**  
   Visual language, spacing discipline, and semantic colour intent MUST mirror Horizon principles without copying implementation.

2. **Operational clarity under stress**  
   UI MUST remain legible, deterministic, and unambiguous during incidents, recovery, and change execution.

3. **Token supremacy**  
   No visual value MAY be hard-coded in components.

4. **Accessibility by default**  
   WCAG 2.1 AA is a minimum requirement.

5. **Composable consistency**  
   All components MUST be built from the same primitives and tokens.

---

## 5. Token Architecture (Authoritative)

### 5.1 Token delivery
- Tokens MUST be implemented as **CSS variables**
- Tokens MUST be exposed at `:root`
- Components MUST consume tokens only

### 5.2 Token namespaces (required)

```
--rbm-color-*
--rbm-space-*
--rbm-font-*
--rbm-radius-*
--rbm-border-*
--rbm-shadow-*
--rbm-motion-*
--rbm-size-*
--rbm-z-*
```

---

## 6. Colour System

### 6.1 Colour model
The RBM colour system is **semantic-first**.

Components MUST use:
- semantic tokens
- never raw palette values

### 6.2 Required semantic intents

| Intent | Purpose |
|-----|--------|
| `primary` | Primary actions |
| `neutral` | Default UI state |
| `info` | Informational state |
| `success` | Completed / OK |
| `warning` | Risk / caution |
| `critical` | Failure / blocker |
| `focus` | Keyboard focus |
| `overlay` | Modal backdrops |

### 6.3 Rules
- Colour MUST NOT be the only indicator of state
- Status MUST be reinforced with text and/or icon
- “Pure black” MUST NOT be used

---

## 7. Typography

### 7.1 Font families
Only system fonts are permitted.

```
Sans: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif
Mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace
```

### 7.2 Type categories (mandatory)

- Display (rare)
- Heading (H1–H4)
- Body (default)
- Body Small
- Caption
- Code / Log

### 7.3 Rules
- Font weight MUST NOT encode status alone
- Line length MUST favour dense operational layouts

---

## 8. Spacing & Density

### 8.1 Spacing scale
- Base unit: **4px**
- Spacing MUST come from `--rbm-space-*` tokens

### 8.2 Density modes (mandatory)

| Mode | Usage |
|----|------|
| Compact | Execution, NOC, recovery |
| Cozy | Default |
| Comfortable | Presentation / review |

Density MUST affect:
- padding
- row height
- control size

---

## 9. Surfaces, Borders, Radii

### 9.1 Surface hierarchy

| Surface | Usage |
|------|------|
| surface-0 | Page background |
| surface-1 | Cards / panels |
| surface-2 | Raised containers |
| inset | Inputs / inner panels |

### 9.2 Borders
- Default borders MUST be subtle
- Emphasis borders reserved for focus or critical states

### 9.3 Radii
- Small: inputs, tags
- Medium: cards
- Large: modals
- Mixed radii in a single component are **forbidden**

---

## 10. Motion

### 10.1 Motion intent
Motion MUST:
- explain hierarchy
- indicate progress
- confirm state change

### 10.2 Prohibitions
- No decorative animation
- No long easing in operational views
- Reduced-motion MUST be supported

---

## 11. Component Taxonomy (Mandatory)

### 11.1 Primitives
- Button / IconButton
- Input / Select / TextArea
- Checkbox / Radio / Switch
- Badge / Tag
- Tooltip
- Divider
- Skeleton

### 11.2 Containers
- Card
- Panel
- Accordion
- Tabs
- Drawer / Side Panel
- Modal / Dialog

### 11.3 Data & Operational
- DataGrid / Table
- Timeline / Runbook steps
- Dependency / Gantt-style views
- Progress indicators
- Status Pill
- Execution Control Bar
- Approval Panel
- Audit Trail

---

## 12. Reference Components (Authoritative Implementation Layer)

### 12.1 Purpose

The **RBM Reference Components** constitute the **authoritative implementation layer** of the RBM Design System.

They provide:
- a **canonical, production-grade reference** for each RBM UI pattern
- a **single, approved React implementation** for all core components
- a **compliance baseline** enforced by Build Agent, ESLint, and CI gates

Reference Components eliminate ambiguity between **design intent** and **code implementation**.

---

### 12.2 Mandatory Usage

The RBM Reference Components **MUST** be used in all RBM React applications where a matching component exists.

**Developers and Build Agent MUST NOT:**
- re-implement a component that exists in the Reference Components set
- introduce alternative styling or structure for an existing component
- fork or partially copy reference components without architectural approval

If a required UI capability is not covered by an existing reference component, a **new reference component MUST be created first**.

---

### 12.3 Authoritative Distribution

Reference Components are distributed as a **single indexed bundle**:

```
Reference-Components/
  ├── Button/
  ├── IconButton/
  ├── TextInput/
  ├── Card/
  ├── Modal/
  ├── SidePanel/
  ├── Tabs/
  ├── DataGrid/
  ├── SelectableDataGrid/
  ├── FilterBar/
  ├── Pagination/
  ├── RowActionsMenu/
  ├── BulkActionBar/
  ├── DependencyChipList/
  ├── StatusPill/
  ├── ExecutionControlBar/
  ├── AuditTrail/
  ├── Steps/
  ├── Skeleton/
  ├── GridSkeleton/
  ├── PanelSkeleton/
  ├── ToastProvider/
  ├── ConfirmDialog/
  ├── ResultState/
  ├── InlineEditRow/
  ├── useConfirmableAction/
  └── supporting utilities (cx, id, DensityProvider)
```

Each folder is **self-contained** and includes:
- all required `.tsx` and `.css` files
- dependent RBM reference components
- required RBM token and base CSS

---

### 12.4 Structural Contract (Non-Negotiable)

Every Reference Component **MUST** adhere to the following contract:

1. **Token-only styling**
   - No hard-coded colours, spacing, fonts, borders, or radii
   - All visual values MUST resolve to RBM tokens

2. **Density awareness**
   - Components MUST respond to `data-density` values:
     - `compact`
     - `cozy`
     - `comfortable`

3. **Accessibility**
   - WCAG 2.1 AA minimum
   - Keyboard operability
   - Focus-visible states
   - Accessible names for icon-only controls

4. **Operational clarity**
   - Deterministic state rendering
   - Explicit labels for status and actions
   - No hidden or implied behaviour

---

### 12.5 Reference Components as Enforcement Baseline

The Reference Components are the **baseline for enforcement**.

Build Agent MUST:
- prefer Reference Components over generating new UI
- reject generated code that re-implements existing reference components
- validate that component usage matches reference behaviour and contracts

ESLint and CI checks assume **Reference Component semantics** and may fail builds that diverge from them.

---

### 12.6 Extension Rules

Reference Components MAY be extended **only** under the following conditions:

1. The extension is additive (no breaking change)
2. Public props remain backwards compatible
3. Tokens and accessibility rules are preserved
4. The change is approved by RBM Architecture
5. The Reference Component source is updated and redistributed

Local overrides or ad-hoc extensions are **forbidden**.

---

### 12.7 Relationship to ServiceNow Next Experience

Reference Components apply **only** to **React-based RBM applications**.

They **MUST NOT** be used:
- inside ServiceNow UI Builder
- with `sn-*` components
- as overrides to Horizon behaviour

In UI Builder contexts, native **ServiceNow Next Experience / Horizon** components remain authoritative.

---

### 12.8 Non-Compliance

A solution is **non-compliant** if it:
- bypasses an available Reference Component
- duplicates a Reference Component with custom code
- modifies a Reference Component locally
- introduces visual or behavioural drift

Non-compliant solutions **MUST NOT** be promoted or released.

---

### 12.9 Status

The RBM Reference Components are a **first-class, mandatory part** of the RBM Design System.

They are:
- authoritative
- enforceable
- versioned
- non-optional

---

### 12.10 Component Taxonomy → Reference Component Mapping

This table defines the **mandatory mapping** between the RBM Component Taxonomy and the **authoritative Reference Components**.

Where a Reference Component exists, it **MUST** be used.

#### Primitives

| Taxonomy Capability | Reference Component |
|-------------------|--------------------|
| Button | `Button` |
| Icon Button | `IconButton` |
| Text Input | `TextInput` |
| Skeleton Placeholder | `Skeleton` |

#### Containers

| Taxonomy Capability | Reference Component |
|-------------------|--------------------|
| Card | `Card` |
| Modal / Dialog | `Modal` |
| Side Panel / Drawer | `SidePanel` |
| Tabs | `Tabs` |

#### Data & Lists

| Taxonomy Capability | Reference Component |
|-------------------|--------------------|
| Data Grid | `DataGrid` |
| Selectable Data Grid | `SelectableDataGrid` |
| Filter Bar | `FilterBar` |
| Pagination | `Pagination` |
| Row Actions | `RowActionsMenu` |
| Bulk Actions | `BulkActionBar` |
| Dependency Display | `DependencyChipList` |

#### Operational / Execution UI

| Taxonomy Capability | Reference Component |
|-------------------|--------------------|
| Status Indicator | `StatusPill` |
| Execution Controls | `ExecutionControlBar` |
| Step / Timeline View | `Steps` |
| Audit History | `AuditTrail` |

#### Feedback & State

| Taxonomy Capability | Reference Component |
|-------------------|--------------------|
| Toast Notifications | `ToastProvider` |
| Confirmation Dialog | `ConfirmDialog` |
| Empty / No-Results State | `ResultState` |
| Grid Loading State | `GridSkeleton` |
| Panel Loading State | `PanelSkeleton` |

#### Inline Patterns & Hooks

| Pattern | Reference Component |
|------|--------------------|
| Inline Editing | `InlineEditRow` |
| Confirmed Actions | `useConfirmableAction` |
| Operation-specific Toasts | `toastPatterns` |

#### Providers & Utilities (Mandatory Infrastructure)

| Capability | Reference Component |
|----------|--------------------|
| Density Management | `DensityProvider` |
| Class Composition | `cx` |
| Stable IDs | `id` |

**Enforcement Note:** If a UI requirement maps to this table:
- no custom implementation is permitted
- no alternate component is acceptable
- no partial recreation is allowed

---

## 13. Icon Boundary (Normative)

### 13.1 React runtime
- Icon library: **Lucide**
- Mapping, sizing, stroke, and semantics are defined in the **RBM Icons Standard**
- Icons MUST consume RBM colour tokens

### 13.2 UI Builder runtime
- Icons MUST use `sn-icon`
- Horizon styling rules apply
- RBM tokens MUST NOT override native behaviour

---

## 14. Forms & Validation

1. Inline validation for fields
2. Blocking validation for state transitions
3. Errors MUST be:
   - explicit
   - actionable
   - non-destructive
4. Auto-corrections MUST be disclosed

---

## 15. Tables & Dense UIs

Data grids MUST support:
- sticky headers
- row actions
- bulk selection (where permitted)
- inline status rendering
- empty vs no-results distinction

Destructive actions REQUIRE confirmation.

---

## 16. Accessibility (Non-Negotiable)

Minimum requirements:
- WCAG 2.1 AA
- Keyboard navigation
- Focus visible
- Screen-reader labels for icon-only controls
- Colour-independent meaning
- Reduced motion support

---

## 17. Theming

### 17.1 Required themes
- Light (default)
- Dark (recommended)
- High Contrast

### 17.2 Implementation
- Theme switching via CSS variables
- Components MUST NOT embed theme logic

---

## 18. Authoritative Token Contract (Normative)

> This structure is mandatory.  
> Values may evolve; **structure MUST NOT**.

```css
:root {
  /* Typography */
  --rbm-font-family-sans: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  --rbm-font-family-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

  /* Spacing */
  --rbm-space-1: 4px;
  --rbm-space-2: 8px;
  --rbm-space-3: 12px;
  --rbm-space-4: 16px;
  --rbm-space-5: 20px;
  --rbm-space-6: 24px;

  /* Radius */
  --rbm-radius-sm: 6px;
  --rbm-radius-md: 10px;
  --rbm-radius-lg: 14px;

  /* Semantic colours */
  --rbm-color-text: #111827;
  --rbm-color-surface-0: #f9fafb;
  --rbm-color-surface-1: #ffffff;
  --rbm-color-border: #e5e7eb;

  --rbm-color-primary: #2563eb;
  --rbm-color-success: #16a34a;
  --rbm-color-warning: #d97706;
  --rbm-color-critical: #dc2626;
  --rbm-color-info: #0ea5e9;

  /* Motion */
  --rbm-motion-fast: 120ms;
  --rbm-motion-medium: 180ms;
}
```

---

## 19. Non-Compliance Criteria (Build Agent MUST FAIL)

A component is **invalid** if it:
- uses hard-coded visual values
- lacks focus handling
- uses icons without accessible labels
- introduces unapproved animation
- does not support required density modes
- diverges from semantic colour usage
- re-implements an existing Reference Component

---

## 20. Related Standards

- **RBM Icons Standard** (Lucide + sn-icon mapping)
- RBM Development Standards
- RBM Accessibility Standard

---

## 21. Status

This document is the **single source of truth** for RBM UI design.

Any change:
- requires version increment
- must be approved by RBM Architecture
- must be reflected in Build Agent rules
