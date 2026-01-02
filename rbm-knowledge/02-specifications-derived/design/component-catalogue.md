# Component Catalogue — RBM

---
document:
  title: "Component Catalogue"
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

## 1. Purpose
Provides a catalogue of standard component patterns used across RBM.

## 2. Core components (examples)
- Object header (title + status + key actions)
- Status pill / badge
- Timeline (planned vs actual)
- Task board / grid
- Evidence capture panel
- Approval/decision panel
- Audit trail viewer

## 3. Component requirements (mandatory)
For each component, define:
- Purpose
- Inputs/outputs
- States (loading, empty, error, disabled)
- Accessibility requirements
- Audit/evidence implications (if any)

## 4. Token usage
All visual styling must be token-based and aligned to authoritative UI standards.

## 5. Icon standards (mandatory)

All icons used across RBM user interfaces MUST comply with the canonical icon standards defined in:

- `01-standards-authoritative/rbm-design-system/icons/icon-standards.md`

No feature, component, or UI specification may introduce new icon semantics or reuse icons with conflicting meanings.

