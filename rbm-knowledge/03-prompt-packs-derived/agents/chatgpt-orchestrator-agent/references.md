# Agent References

> **Agent:** ChatGPT Orchestrator Agent  
> **Classification:** Declarative (Non-authoritative)  
> **Applies to:** ChatGPT Orchestrator Agent only  
> **Authority:** `01-standards-authoritative/governance/reference-registry.md`  
> **Last updated:** 2025-12-29 09:49:51

---

## 1. Purpose

This file declares the **reference sets required by the ChatGPT Orchestrator Agent** to perform orchestration, validation, and governance enforcement across the RBM multi-agent system.

This file:
- **does not define references**
- **does not list internal document paths**
- **does not include URLs**

All reference definitions (internal and external) are owned centrally by the **Reference Registry** and are applied deterministically by the Orchestrator at runtime.

---

## 2. Mandatory reference sets

The following reference set is **always required** and is injected automatically for every execution:

- `set-common`

> `set-common` is non-negotiable and MUST NOT be removed or overridden.

---

## 3. Agent-specific reference sets

The ChatGPT Orchestrator Agent requires the following additional reference sets (in addition to `set-common`):

- `set-build-agent`  
  *Required to orchestrate ServiceNow IDE and Build Agent execution, prompt sequencing, and build validation.*

- `set-store-publishing`  
  *Required to govern application packaging, ServiceNow Store readiness, and release baseline alignment.*

These sets are defined and governed by:
- `01-standards-authoritative/governance/orchestrator-governance-reference-sets.md`
- `01-standards-authoritative/governance/agent-reference-sets-mapping.md`
- `01-standards-authoritative/governance/reference-validation-checklist-v1.md`

---

## 4. Feature-based reference sets (dynamic)

When executing in the context of a specific feature, the Orchestrator Agent MAY additionally apply reference sets declared in:

```
02-specifications-derived/features/<feature-slug>/references.feature.md
```

Rules:
1. Feature-declared sets MUST exist in the Reference Registry
2. Feature sets are merged deterministically and MUST NOT override governance
3. `set-common` always takes precedence

---

## 5. Prohibited content (strict)

This file MUST NOT contain:
- raw URLs
- internal document paths
- duplicated reference lists
- copied standards or policy text
- legacy `.docx`, `.pptx`, or spreadsheet references
- feature-specific references

Any prohibited content will cause **Orchestrator validation failure**.

---

## 6. Governance and validation alignment

This file is validated against the following authoritative controls:

- `reference-registry.md`
- `orchestrator-governance.md`
- `orchestrator-governance-reference-sets.md`
- `agent-reference-sets-mapping.md`
- `reference-validation-checklist-v1.md`

Validation rules enforced:
1. `set-common` is always applied
2. All declared sets exist and are active
3. No undeclared references are introduced
4. Feature sets do not conflict with governance rules

---

## 7. Change control

Changes to this file:
- do **not** require a governance decision
- MUST NOT introduce new references
- MAY ONLY add or remove declared reference sets

Any new reference requirement MUST follow the governed process:
1. Propose reference
2. Add to Reference Registry
3. Assign to an appropriate reference set
4. Apply via governance-approved update

---

## 8. Effective reference sets (summary)

| Source | Sets applied |
|------|-------------|
| Universal | `set-common` |
| Agent-specific | `set-build-agent`, `set-store-publishing` |
| Feature (conditional) | Declared in `references.feature.md` |
