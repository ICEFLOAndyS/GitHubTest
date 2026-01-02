# Interaction Patterns — RBM

---
document:
  title: "Interaction Patterns"
  area: "design"
  product: "runbook-management"
  version: "0.1"
  status: "draft"
  owner: "{OWNER}"
  last_updated: "2025-12-28 15:49:13"
  authoritative_standards:
    - "01-standards-authoritative/governance/orchestrator-governance.md"
    - "01-standards-authoritative/governance/definition-of-done-framework.md"
    - "01-standards-authoritative/rbm-naming/rbm-naming-standard.md"
    - "{ADD_AUTHORITATIVE_UI_STANDARD_PATHS}"
---
> **Classification:** Reference Implementation (Recommended)  
> **Scope:** RBM Design System  
> **Enforcement:** Advisory  
> **Deviation:** Permitted if normative standards are met

## 1. Standard interaction patterns
- Primary actions: clear, limited, and contextual
- Secondary actions: overflow menu
- Destructive actions: require confirmation and capture rationale
- Long-running actions: show progress and provide safe interruption

## 2. Execution controls (runbook-style)
- Start / pause / resume / stop patterns
- Confirmations must include:
  - what will change
  - impact scope
  - evidence captured
  - who approved (if applicable)

## 3. Forms
- Inline validation
- Clear required fields and constraints
- Save patterns: Save Draft vs Submit for Approval (when relevant)

## 4. Empty, loading, and error states
- Provide a user action (retry, refresh, contact)
- Provide a correlation ID where possible

## 5. Icon standards (mandatory)

All icons used across RBM user interfaces MUST comply with the canonical icon standards defined in:

- `01-standards-authoritative/rbm-design-system/icons/icon-standards.md`

No feature, component, or UI specification may introduce new icon semantics or reuse icons with conflicting meanings.

