# Data Model — {{FEATURE_NAME}}

---
document:
  title: "Data Model"
  feature_slug: "{{FEATURE_SLUG}}"
  version: "0.1"
  status: "draft"   # draft | ready-for-design | designed | ready-for-build | in-build | ready-for-test | approved | released
  owner: "{{OWNER}}"
  approvers: []
  last_updated: "2025-12-28 14:56:45"
  authoritative_standards:
    - "01-standards-authoritative/rbm-naming/rbm-naming-standard.md"
    - "01-standards-authoritative/governance/orchestrator-governance.md"
    - "01-standards-authoritative/governance/definition-of-done-framework.md"
    - "01-standards-authoritative/governance/decision-management-standard.md"
    - "01-standards-authoritative/governance/evidence-and-audit-standard.md"
    - "01-standards-authoritative/governance/exception-and-waiver-policy.md"
    - "{{ADD_OTHER_STANDARDS_PATHS}}"
---


## 1. Entities / tables
For each table, include:
- Table name (ServiceNow technical name):
- Label:
- Scope:
- Purpose:
- Key fields:
- Relationships:
- Indexing considerations:
- Retention:

## 2. Relationships
- 1:M
- M:N
- Reference fields

## 3. Audit fields and strategy (mandatory)
- Sys audit configuration:
- Custom audit events (link to `audit-evidence.md`):
- Baseline/diff requirements (if applicable):

## 4. Data dictionary appendix
Link or embed derived data dictionary once stable.
