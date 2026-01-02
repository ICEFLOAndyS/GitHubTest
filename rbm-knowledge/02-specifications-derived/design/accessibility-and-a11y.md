# Accessibility & A11y — RBM

---
document:
  title: "Accessibility and A11y"
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

## 1. Baseline requirement
All RBM UI must be accessible and usable via keyboard and screen readers.

## 2. Mandatory considerations
- Keyboard navigation order is logical and consistent
- Visible focus states
- ARIA labels for icon-only buttons
- Proper heading hierarchy
- Table accessibility: headers, captions where needed

## 3. Error messaging
- Errors must be descriptive, actionable, and linked to fields
- Avoid colour-only indication

## 4. Testing
- Include A11y scenarios in feature `test-plan.md`
