# Agent References

> **Agent:** ServiceNow Architect Agent  
> **Classification:** Declarative (Non-authoritative)  
> **Applies to:** ServiceNow Architect Agent only  
> **Authority:** `01-standards-authoritative/governance/reference-registry.md`  
> **Last updated:** 2025-12-29 09:43:27

---

## 1. Purpose

This file declares the **reference sets required** for this agent to perform its role within the RBM multi-agent system.

This file:
- **does not define references**
- **does not list internal document paths**
- **does not include URLs**

All reference definitions (internal and external) are owned centrally by the **Reference Registry** and applied deterministically by the Orchestrator.

---

## 2. Mandatory reference sets

The following reference set is **always required** and is injected automatically for every execution:

- `set-common`

> `set-common` is non-negotiable and MUST NOT be removed.

---

## 3. Agent-specific reference sets

This agent requires the following additional reference sets (in addition to `set-common`):

- `set-platform-dev`
- `set-store-publishing`

Reference sets are defined in the Reference Registry and enforced by:
- `01-standards-authoritative/governance/orchestrator-governance-reference-sets.md`
- `01-standards-authoritative/governance/agent-reference-sets-mapping.md`
- `01-standards-authoritative/governance/reference-validation-checklist-v1.md`

---

## 4. Feature-based reference sets (dynamic)

When executing in the context of a specific feature, additional sets MAY be applied if declared in:

```
02-specifications-derived/features/<feature-slug>/references.feature.md
```

Rules:
- Declared sets MUST exist in the Reference Registry
- Feature sets are merged (union) and do not override governance
- `set-common` always takes precedence

---

## 5. Prohibited content (strict)

This file MUST NOT contain:
- raw URLs
- internal document paths
- copied standards text
- legacy `.docx`, `.pptx`, or spreadsheet references
- feature-specific references

Any prohibited content will cause Orchestrator validation failure.

---

## 6. Change control

Changes to this file:
- do **not** require a governance decision
- MUST NOT introduce new references
- MAY ONLY change the declared reference sets

Any new reference requirement MUST follow the governed process:
1. Propose reference
2. Add to Reference Registry
3. Assign to a reference set
4. Apply via governance-approved update
