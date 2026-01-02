# RBM Baseline Release Manifest

**Baseline Version:** v1.1  
**Status:** Approved baseline  
**Scope:** Knowledge system, governance, templates, and prompt packs  
**Applies to:** RBM AI Design-to-Code programme  

---

## 1. Purpose

This manifest defines the **authoritative baseline** for the RBM (Runbook Management) knowledge system.
It establishes the **minimum, approved set of artefacts** required to initiate, design, build, and govern RBM features using the multi-agent model.

All future work MUST conform to this baseline unless a governed exception is approved.

---

## 2. Authoritative Standards (Mandatory)

### Governance
- `01-standards-authoritative/governance/orchestrator-governance.md` (v1.1)
- `01-standards-authoritative/governance/agent-responsibility-model.md`
- `01-standards-authoritative/governance/definition-of-done-framework.md`
- `01-standards-authoritative/governance/decision-management-standard.md`
- `01-standards-authoritative/governance/exception-and-waiver-policy.md`
- `01-standards-authoritative/governance/evidence-and-audit-standard.md`
- `01-standards-authoritative/governance/lifecycle-and-state-model.md`

### RBM Design System
- `01-standards-authoritative/rbm-design-system/rbm-design-system.md`

### Naming
- `01-standards-authoritative/rbm-naming/rbm-naming-standard.md`

These artefacts override all derived content and prompt packs.

---

## 3. Product Specifications

Location:
```
02-specifications-derived/product/
```

Included artefacts:
- `product-vision.md`
- `product-scope.md`
- `capability-model.md`
- `non-functional-requirements.md`
- `supported-scenarios.md`
- `personas-and-value-proposition.md`
- `product-roadmap.md`
- `constraints-and-assumptions.md`

Role:
Defines stable product intent, scope, constraints, and NFRs.

---

## 4. Architecture Specifications

Location:
```
02-specifications-derived/architecture/
```

Included artefacts:
- `architecture-overview.md`
- `logical-architecture.md`
- `data-architecture.md`
- `security-architecture.md`
- `integration-architecture.md`
- `deployment-and-environments.md`
- `logging-monitoring-and-audit.md`
- `architecture-decisions.md`

Role:
Defines cross-cutting architectural constraints for all features.

---

## 5. Design Specifications

Location:
```
02-specifications-derived/design/
```

Included artefacts:
- `design-overview.md`
- `ux-principles.md`
- `information-architecture.md`
- `interaction-patterns.md`
- `page-templates.md`
- `component-catalogue.md`
- `accessibility-and-a11y.md`
- `content-and-microcopy.md`
- `data-visualisation.md`

Role:
Defines UX/UI baselines referenced by feature UI specifications.

---

## 6. Personas

Location:
```
02-specifications-derived/personas/
```

Included artefacts:
- `persona-framework.md`
- Individual persona definitions (internal and customer)

Role:
Derived user models referenced by features; do not define rules.

---

## 7. Feature Specification Template

Location:
```
02-specifications-derived/features/feature-template/
```

Baseline version:
- Feature Template Pack v1.1

Included artefacts:
- `feature-brief.md`
- `functional-spec.md`
- `data-model.md`
- `workflow-spec.md`
- `ui-spec.md`
- `security-access-controls.md`
- `audit-evidence.md`
- `acceptance-criteria.md`
- `test-plan.md`
- `build-plan.md`
- `decision-log.md`
- `artefact-register.md`

Role:
Defines the mandatory structure for all RBM feature specifications with governance fully wired.

---

## 8. Prompt Packs

### Orchestrator
Location:
```
03-prompt-packs-derived/chatgpt-orchestrator-agent/
```

Included artefacts:
- `system-prompt.md`
- `runtime-prompt.md`
- `validation-prompt.md`

### Build Agent
Location:
```
03-prompt-packs-derived/build-agent/
```

Included artefacts:
- `system-prompt.md`
- `runtime-prompt.md`
- `validation-prompt.md`

Role:
Operational enforcement of governance, naming, delegation, and validation.

---

## 9. Dependency Chain (Authoritative Order)

```
Authoritative Standards
   ↓
Product / Architecture / Design
   ↓
Personas
   ↓
Feature Specifications
   ↓
Prompt Packs
   ↓
Implementation & Evidence
```

---

## 10. Baseline Rules

- No artefact may contradict authoritative standards.
- No feature may start without product and persona alignment.
- No build may proceed without Orchestrator DoD satisfaction.
- Any deviation from this baseline requires a governed exception.

---

## 11. Change Control

Changes to this baseline require:
- explicit version increment
- decision-log entry
- approval under the Decision Management Standard

---

## Status

This manifest establishes the **RBM Baseline Release v1.1** and is effective immediately.
