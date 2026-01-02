# RBM Development Standards (Authoritative)
**Status:** Approved  
**Applies to:** All RBM development (Human & AI)  
**Primary Authority:** RBM Design System v1.1  
**Scope:** `x_icefl_rbm`

---

## 1. Purpose

This document defines the **authoritative development standards** for the Runbook Management (RBM) solution.

It governs:
- How code is written, reviewed, tested, and deployed
- How UI is implemented in React-based RBM applications
- How Build Agent must behave and what it must reject
- How compliance with security, resilience, and quality requirements is enforced

The **RBM Design System** is the *authoritative model* for all UI, styling, tokens, components, and icon usage.  
Where UI behaviour is concerned, this document is **subordinate** to the RBM Design System.

---

## 2. Applicability

These standards **MUST** be applied to:

- All RBM React applications
- All shared RBM UI libraries
- All server-side logic supporting RBM
- All Build Agent–generated code
- All third-party or partner contributions

Non-compliant code **MUST NOT** be merged or released.

---

## 3. Governing Authorities (Order of Precedence)

1. RBM Design System (v1.1+) – *Authoritative*
2. RBM Reference Components
3. RBM Development Standards (this document)
4. ServiceNow platform constraints
5. Project-specific documentation

Where conflict exists, the **higher authority prevails**.

---

## 4. Architecture & Regulatory Alignment

All RBM development **MUST** align with:

- CSDM 5.0
- DORA (ICT Risk & Operational Resilience)
- FCA / PRA Operational Resilience guidance
- ISO 27001 (Information Security)
- ISO 22301 (Business Continuity)

Architecture review is **mandatory** before:
- Introducing new data models
- Adding integrations
- Modifying security boundaries
- Introducing new UI or rendering approaches

---

## 5. Mandatory Engineering Artefacts

Each change **MUST** include:

- Solution Design Document
- Data Model & CSDM mapping
- API / Data Resource specification
- RBAC & ACL definition
- Test Strategy (unit + ATF)

Artefacts must be version-controlled alongside code.

---

## 6. Development Model

### 6.1 Separation of Concerns

- UI components **MUST NOT** contain business logic
- Business logic **MUST** reside in:
  - Script Includes
  - Server APIs
  - Workflow / orchestration layers
- UI **MUST** be presentational and deterministic

---

## 7. JavaScript Standards (Baseline)

### 7.1 Style & Tooling

- Airbnb JavaScript Style Guide **MUST** be followed
- ESLint and Prettier **MUST** be enforced
- `const` **MUST** be used by default
- `var` **MUST NOT** be used
- Strict equality (`===`) **MUST** be used

### 7.2 Documentation

- JSDoc **MUST** be provided for:
  - Script Includes
  - Shared utilities
  - Data resource handlers

---

## 7A. TypeScript / React / JavaScript Best Practice (Mandatory)

### 7A.1 TypeScript Defaults

- All new UI code **MUST** be written in TypeScript (`.ts` / `.tsx`).
- `strict` mode **MUST** be enabled.
- Types **MUST** be explicit at module boundaries.
- `any` **MUST NOT** be used except in documented, approved adapter layers.
- Prefer `unknown` over `any` for untrusted input.

### 7A.2 React Component Standards

- Components **MUST** be functional and deterministic.
- `useEffect` **MUST NOT** be used for pure derivation.
- Effect dependencies **MUST** be complete.
- Array index keys are **forbidden** where ordering may change.

### 7A.3 Error Handling and try/catch

- All async operations **MUST** use `async/await`.
- `try/catch` **MUST** be used at system boundaries:
  - API calls
  - Integration adapters
  - Data parsing and validation
- Errors **MUST** be surfaced safely to users and logged technically.
- `catch` variables **MUST** be typed as `unknown` and narrowed.

### 7A.4 Defensive Programming

- All external inputs **MUST** be treated as untrusted.
- Runtime validation **MUST** occur before rendering or state transitions.

### 7A.5 Promises and Concurrency

- `Promise.all` **MAY** be used only for independent operations.
- Long-running operations **MUST** support cancellation or stale-result protection.

### 7A.6 Logging and Observability

- Logs **MUST** be structured and non-sensitive.
- User-facing errors **MUST** be actionable and clear.

### 7A.7 Code Hygiene

- Magic values **MUST NOT** be embedded in components.
- Complex logic **MUST** be extracted to helpers.
- Named exports **SHOULD** be preferred.

### 7A.8 Build Agent Enforcement

Build Agent **MUST**:
- generate TypeScript for UI
- apply try/catch at integration boundaries
- reject silent catches, untyped `any`, and suppressed lint rules

---

## 8. Server-Side Standards

- Script Includes **MUST**:
  - Be namespaced (`x_icefl_rbm.*`)
  - Be stateless
  - Be unit-testable
- Business Rules **MUST NOT** contain complex logic
- GlideRecord queries **MUST**:
  - Be indexed
  - Be paginated
  - Avoid unbounded loops

---

## 9. UI Development Standards (Normative)

All UI development **MUST** conform to the **RBM Design System**.

Custom UI behaviour outside the design system is **forbidden**.

---

## 10. Reference Components (Mandatory)

Where a Reference Component exists:

- It **MUST** be used
- It **MUST NOT** be re-implemented
- It **MUST NOT** be locally modified

---

## 11. Inline HTML & Rendering Policy (Non-Negotiable)

The following are **strictly prohibited**:

- HTML built via string concatenation
- Template-literal HTML rendering
- `innerHTML`, `outerHTML`, `insertAdjacentHTML`
- Inline SVG
- Raw DOM manipulation

---

## 12. Icon Usage

Icon usage **MUST** follow the RBM Icon Standard.

Icons **MUST NOT** be hard-coded, decorative-only, or inline SVG.

---

## 13. Security & Data Protection

- OWASP Secure Coding Practices **MUST** be followed
- Secrets **MUST NOT** appear in code
- All input **MUST** be validated server-side
- GDPR principles **MUST** be enforced

---

## 14. Testing & Quality Gates

- Unit tests for Script Includes and core utilities
- ATF for workspaces, flows, and critical UI paths

Release gates:
- ATF ≥ 95%
- ≥ 80% coverage on critical logic
- 0 P1 defects

---

## 15. CI/CD & Build Agent Enforcement

Build Agent **MUST** enforce:
- Design System compliance
- TypeScript usage
- Inline HTML prohibition
- Reference Component usage

CI pipelines **MUST** fail on:
- ESLint violations
- Accessibility failures
- Security findings

---

## 16. Non-Compliance

A solution is **non-compliant** if it:

- Bypasses the RBM Design System
- Re-implements Reference Components
- Uses hard-coded visual values
- Violates accessibility rules

Non-compliant solutions **MUST NOT** be promoted.

---

## 17. Status

This document is **binding** and subordinate only to the RBM Design System.
