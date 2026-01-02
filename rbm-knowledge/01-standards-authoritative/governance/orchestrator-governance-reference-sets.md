# Orchestrator Governance — Reference Set Enforcement

> **Status:** Authoritative  
> **Version:** 1.1  
> **Last updated:** 2025-12-29 09:06:39  
> **Scope:** ChatGPT Orchestrator Agent  
> **Change control:** `01-standards-authoritative/governance/decision-management-standard.md`

---

## 1. Purpose

This document defines **mandatory Orchestrator rules** for the application, validation, and enforcement of **reference sets** defined in:

- `01-standards-authoritative/governance/reference-registry.md`

The objective is to:
- eliminate duplicated references across agents and features
- ensure consistent application of standards and external sources
- preserve auditability and deterministic behaviour

---

## 2. Reference registry authority

1. The **Reference Registry** is the **single source of truth** for:
   - all internal references
   - all external references
   - all reference sets (`set-*`)
2. Agents and features MUST NOT introduce references outside the registry.
3. Any change to references or sets MUST follow governed change control.

---

## 3. Mandatory reference set application

### 3.1 Universal application (non-negotiable)

For **every Orchestrator invocation**, regardless of agent or feature:

The Orchestrator MUST apply:
- `set-common`

This set is always injected and cannot be overridden or removed.

---

### 3.2 Agent-based reference set injection

The Orchestrator MUST automatically inject reference sets based on the **agent being invoked**, as follows:

#### ChatGPT Orchestrator Agent
- `set-common`
- `set-build-agent`
- `set-store-publishing`

#### AI Prompt Engineer Agent
- `set-common`
- `set-build-agent`

#### ServiceNow Architect Agent
- `set-common`
- `set-platform-dev`
- `set-store-publishing`

#### Platform Developer Agent
- `set-common`
- `set-platform-dev`

#### Front-End Developer Agent
- `set-common`
- `set-ux`
- `set-next-experience`

#### UX / UI Designer Agent
- `set-common`
- `set-ux`

#### Persona & User Journeys Agent
- `set-common`
- `set-next-experience`

#### Flow Designer Agent
- `set-common`
- `set-flow-designer`

#### Dashboard Designer Agent
- `set-common`
- `set-pa`

#### Quality Engineer Agent
- `set-common`
- `set-qa-atf`

#### MS Teams Integration Agent
- `set-common`
- `set-ms-teams`
- `set-store-publishing`

#### Security Expert Agent
- `set-common`
- `set-store-publishing`

---

## 4. Feature-based reference set injection

### 4.1 Feature declarations

Each feature MAY declare additional reference sets in:

```
02-specifications-derived/features/<feature-slug>/references.feature.md
```

Rules:
1. `set-common` MUST be declared (explicitly or implicitly).
2. Declared sets MUST exist in the reference registry.
3. Features MUST NOT redefine reference entries.

---

### 4.2 Orchestrator merge logic (deterministic)

For any execution, the Orchestrator MUST construct the effective reference set as:

```
effective_sets =
  union(
    set-common,
    agent_required_sets,
    feature_declared_sets
  )
```

Order of precedence:
1. `set-common`
2. agent-required sets
3. feature-declared sets

---

## 5. Validation and rejection rules

The Orchestrator MUST reject execution if:

1. Any declared `set-*` does not exist in the reference registry.
2. Any agent attempts to introduce raw URLs or ad-hoc references.
3. Any feature declares a reference set that conflicts with governance constraints.
4. Any feature attempts to remove or override `set-common`.

---

## 6. Promotion and lifecycle rules

1. Feature-specific references marked as **promotion candidates** MUST:
   - be reviewed under change control
   - be added to the reference registry
   - be assigned to a reference set
2. Once promoted, features MUST reference the new set rather than local definitions.

---

## 7. Audit and evidence requirements

The Orchestrator MUST record, per execution:
- agent invoked
- feature (if applicable)
- effective reference sets applied
- registry version used

This evidence MUST be retained for audit and regulatory review.

---

## 8. Non-compliance handling

If a violation is detected:
1. Execution is halted.
2. A clear validation error is returned.
3. The violation is logged for governance review.

---

## 9. Summary

| Rule | Enforcement |
|---|---|
| `set-common` always applied | Mandatory |
| Agent-based sets | Mandatory |
| Feature-declared sets | Conditional |
| Ad-hoc references | Prohibited |
| Registry-only definitions | Mandatory |
