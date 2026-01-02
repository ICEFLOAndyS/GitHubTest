# Deployment & Environments — RBM

---
document:
  title: "Deployment & Environments"
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


## 1. Environments
- Dev
- Test
- Pre-Prod
- Prod

## 2. Release and promotion strategy
- update sets / app repo strategy (as appropriate)
- versioning approach
- rollback strategy

## 3. Configuration management
- property-driven configuration
- feature toggles (where needed)
- environment-specific secrets management

## 4. Operational readiness
- runbooks for release
- smoke tests
- monitoring checks
