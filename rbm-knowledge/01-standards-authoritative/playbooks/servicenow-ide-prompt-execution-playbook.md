# ServiceNow IDE Prompt Execution Playbook

> **Classification:** Tooling (Supportive, Non-normative)  
> **Scope:** RBM Multi-agent Delivery  
> **Enforcement:** Not enforced (supports compliance)  
> **Last updated:** 2025-12-29 07:38:05

---

## 1. Purpose
This playbook defines a repeatable method for executing agent prompts using **ServiceNow IDE (Fluent)** and **Build Agent**, ensuring outputs remain compliant with:
- `01-standards-authoritative/governance/orchestrator-governance.md`
- `01-standards-authoritative/rbm-naming/rbm-naming-standard.md`
- `01-standards-authoritative/development/development-standards-authoritative.md`
- `01-standards-authoritative/rbm-design-system/rbm-design-system.md`

---

## 2. Operating model
1. **Orchestrator normalises** requirements, paths, and reference sets.
2. Orchestrator emits a **Build Agent master prompt** plus **feature-scoped prompt pack**.
3. Build Agent executes prompts in IDE, producing artefacts into the repo-aligned structure.
4. Orchestrator validates outputs against DoD and governance gates.

---

## 3. Prompt execution steps (standard)
1. Create / open the target scope in ServiceNow IDE.
2. Paste the **Build Agent system prompt** once per session (if required by your IDE workflow).
3. Execute prompts in this order:
   - Pre-flight validation (naming + references + target paths)
   - Data model / tables
   - Security / ACLs
   - Flows / workflow
   - UI components
   - Tests (ATF) and validation
4. After each step:
   - capture errors and re-run with diffs only
   - record decisions in the feature `decision-log.md`

---

## 4. Output handling
- Outputs MUST be written to the paths specified in the prompt pack.
- Where IDE output is non-file artefacts (tables, flows), record:
  - artefact name
  - scope
  - sys_id (if required)
  - export / update set reference
in the feature `artefact-register.md`.

---

## 5. Validation checklist (operational)
- Naming compliance verified
- References applied via reference sets
- Governance acceptance criteria satisfied (AC-GOV)
- UI icon usage aligned with `icons/icon-standards.md`
- Security review completed (least privilege)
- Evidence captured for approvals/decisions

---

## 6. Known pitfalls
- Mixing authoritative rules into derived docs
- Creating feature-specific icon semantics
- Leaving artefacts unregistered (no audit trail)
- Deviating from reference sets without updating the registry
