# Page Templates — RBM

---
document:
  title: "Page Templates"
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

## 1. Object landing page template
- Header: title, status pill, owner, timestamps
- Primary action area: 1–3 actions max
- Summary widgets: progress, risk/alerts, upcoming milestones
- Main content: tabs (Overview, Plan, Execution, Evidence, History)

## 2. Execution page template
- Left: task list / stage navigator
- Right: task detail / evidence capture panel
- Persistent controls: pause/resume, escalation, help
- Timeline visibility: planned vs actual

## 3. Admin/config page template
- List + detail pattern
- Bulk actions via selection + toolbar
- Strong guardrails (confirmations, role checks)

## 4. Icon standards (mandatory)

All icons used across RBM user interfaces MUST comply with the canonical icon standards defined in:

- `01-standards-authoritative/rbm-design-system/icons/icon-standards.md`

No feature, component, or UI specification may introduce new icon semantics or reuse icons with conflicting meanings.
