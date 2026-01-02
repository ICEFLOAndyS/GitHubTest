# Architecture Overview — RBM

---
document:
  title: "Architecture Overview"
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
Defines the baseline architecture view of RBM for use by the multi-agent delivery system.

## 2. Architectural principles
- ServiceNow-native first
- Governance-first (auditability, evidence, traceability)
- Secure by default (least privilege)
- Configurable patterns over bespoke code where feasible
- Clear separation between authoritative standards and derived specifications

## 3. High-level system context
- RBM is delivered as a ServiceNow application (scoped app)
- Integrates with platform capabilities (ITSM, CMDB/CSDM, Flow Designer, Notify, IntegrationHub)
- Optional integrations (Teams, email, external automation)

## 4. Key architecture views (links)
- Logical architecture: `logical-architecture.md`
- Data architecture: `data-architecture.md`
- Deployment view: `deployment-and-environments.md`
- Integration architecture: `integration-architecture.md`
- Security architecture: `security-architecture.md`
- Observability: `logging-monitoring-and-audit.md`
- Architecture decisions index: `architecture-decisions.md`
