# Data Architecture — RBM

---
document:
  title: "Data Architecture"
  area: "architecture"
  product: "runbook-management"
  version: "0.1"
  status: "draft"
  owner: "{OWNER}"
  last_updated: "2025-12-28 15:37:30"
  authoritative_standards:
    - "01-standards-authoritative/governance/orchestrator-governance.md"
    - "01-standards-authoritative/governance/definition-of-done-framework.md"
    - "01-standards-authoritative/rbm-naming/rbm-naming-standard.md"
    - "{ADD_OTHER_STANDARDS_PATHS}"
---


## 1. Purpose
Defines the data architecture conventions used across RBM features.

## 2. Data domains
- Event domain (Event groups, events, workstreams)
- Runbook domain (runbooks, stages, tasks, dependencies)
- Execution domain (executions, checkpoints, issues, outcomes, timestamps)
- Governance domain (decisions, approvals, evidence, audit events)
- Reporting domain (derived metrics, KPIs, snapshots)

## 3. Data lifecycle and retention
- Define retention expectations for operational records vs audit/evidence records
- Identify where platform audit history is used vs custom evidence tables

## 4. Reference patterns
- Reference fields and M2M usage
- Avoid circular relationships unless justified
- Use consistent naming for references and choice lists

## 5. Data quality controls
- validation rules
- mandatory fields
- state model constraints
- baseline/diff considerations (where applicable)
