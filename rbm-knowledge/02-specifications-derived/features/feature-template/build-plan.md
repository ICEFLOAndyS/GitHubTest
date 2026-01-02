# Build Plan — {{FEATURE_NAME}}

---
document:
  title: "Build Plan"
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


## 1. Build sequencing
1. Data model
2. Security/ACLs
3. Workflows/approvals
4. UI
5. Reporting/audit
6. Tests

## 2. Governance gates (non-negotiable)

### Gate 1 — Pre-build (Orchestrator)
- Feature status = `ready-for-build`
- Governance standards reviewed and applicable
- Naming standard enforced on all referenced paths
- Orchestrator DoD satisfied

### Gate 2 — Build execution (Build Agent)
- Pre-flight naming gate executed
- No non-compliant artefacts created
- No standards overridden or bypassed

### Gate 3 — Post-build validation
- Orchestrator validation prompt applied
- Feature acceptance criteria satisfied (including AC-GOV)
- Governance evidence captured and registered

## 3. Agent work packages
| Package | Owner agent | Inputs | Outputs | DoD |
|---------|-------------|--------|---------|-----|

## 4. Build Agent handoff (mandatory)
Include:
- Canonical paths to consume
- Explicit artefacts to create/update
- Naming gate reminder
- Required evidence outputs (AE IDs)
