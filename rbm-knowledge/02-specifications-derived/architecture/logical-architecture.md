# Logical Architecture — RBM

---
document:
  title: "Logical Architecture"
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


## 1. Logical layers
- Experience layer (Now Experience UI / Portal / Workspace)
- Process layer (Flow Designer / Workflow / Approvals)
- Data layer (RBM tables, references, audit data)
- Integration layer (IntegrationHub, REST/SOAP, email, Teams)
- Governance layer (standards, decisions, evidence, reporting)

## 2. Core logical components
- Runbook authoring
- Runbook execution & orchestration
- Task and stage management
- Decision and approval handling
- Audit and evidence capture
- Reporting and dashboards

## 3. Logical interfaces
Describe interactions between components, e.g.:
- UI ↔ API / Script Includes
- Flow Designer ↔ tables ↔ notifications
- Integrations ↔ inbound/outbound message handlers

## 4. Non-functional considerations
- performance
- resiliency
- maintainability
- security and compliance
