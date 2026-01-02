# UX Principles — RBM

---
document:
  title: "UX Principles"
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

## 1. Core UX goals
- Rapid comprehension: a user should understand "what's happening" in < 10 seconds
- Safe execution: minimise accidental actions, support confirmation and reversibility
- Auditability: users can see who did what and when
- Operational flow: guide users through runbooks with minimal context switching

## 2. RBM-specific UX heuristics
- Always show: status, owner, next step, time remaining / elapsed
- Distinguish: planned vs actual time, expected vs observed outcomes
- Make "stop / pause / resume" obvious where execution is time-bound
- Ensure key actions are available at the right moment, not everywhere

## 3. UX anti-patterns to avoid
- Hidden state transitions
- Ambiguous action labels ("Submit" without context)
- Overloading pages with dense tables during execution
- Unbounded free-text where structured evidence is required
