# Acceptance Criteria — {{FEATURE_NAME}}

---
document:
  title: "Acceptance Criteria"
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


## 1. Feature acceptance criteria (AC-xxx)
- **AC-001:**  
- **AC-002:**  

## 2. Governance acceptance criteria (mandatory)

- **AC-GOV-001:** All artefact paths comply with the RBM naming standard (kebab-case, hyphens only)
- **AC-GOV-002:** Artefacts reside in the correct knowledge domains
- **AC-GOV-003:** No derived specification contradicts authoritative standards
- **AC-GOV-004:** Orchestrator Definition of Done is satisfied
- **AC-GOV-005:** All material design decisions are recorded in the decision log with rationale and approver
- **AC-GOV-006:** Audit evidence exists for all critical feature actions (per `audit-evidence.md`)

Failure of any AC-GOV item results in feature rejection.
