# Information Architecture — RBM

---
document:
  title: "Information Architecture"
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
Defines the baseline navigation and content structure for RBM.

## 2. Primary objects (examples)
- Event
- Runbook
- Stage
- Task
- Issue
- Decision
- Content pack

## 3. Navigation model (guidance)
- Object-centric navigation
- Consistent object header pattern (title + key status + key actions)
- Tabs for: Overview, Timeline/Plan, Execution, Evidence, History

## 4. Information layering
- Level 1: executive summary (status, progress, risk)
- Level 2: operational detail (tasks, dependencies, comms)
- Level 3: evidence & audit trail (immutable history)
