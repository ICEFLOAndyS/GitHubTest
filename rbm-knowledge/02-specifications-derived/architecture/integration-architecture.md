# Integration Architecture — RBM

---
document:
  title: "Integration Architecture"
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


## 1. Integration principles
- API-first where possible
- Prefer IntegrationHub / spokes for standard integrations
- Explicit contract definitions (schemas, error handling)
- Idempotency and replay safety for inbound messages

## 2. Supported integration patterns
- REST APIs (inbound/outbound)
- Email ingestion (inbound actions/workflows)
- Microsoft Teams notifications and actions
- Event/webhook patterns (where applicable)

## 3. Integration governance
For each integration, document:
- purpose
- authentication method
- data mapping
- error handling and retries
- audit evidence captured

## 4. Standard artefacts
- Integration catalog entry
- Connection & credential strategy
- Runbook execution triggers (if external)
