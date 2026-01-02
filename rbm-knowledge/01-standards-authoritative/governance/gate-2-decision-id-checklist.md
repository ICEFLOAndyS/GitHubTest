# Gate 2 Decision ID & State Management Checklist (Orchestrator Pre-Flight)

**Scope:** Applies to ALL RBM features at Gate 2+  
**Baseline:** RBM Knowledge v1.9.2+

## Objective
Block progression beyond Gate 2 unless:
- Gate-2 decision IDs are present and correctly formatted
- State fields comply with RBM-POL-STATE-001

---

## A. Decision ID Compliance (MANDATORY)

### A1. ID Pattern
- [ ] Every Gate-2 decision uses: `G2-DEC-<FEATURE>-<TOPIC>-<NNN>`
- [ ] `<FEATURE>` is from the approved feature codes list
- [ ] `<TOPIC>` is an approved topic code (STATE/MODEL/REL/VERSION/AUDIT/SECURITY/PERF/UPGRADE/EXT)
- [ ] `<NNN>` is 3-digit, zero-padded (001, 002…)
- [ ] IDs are unique across the RBM repository

**Fail ⇒ HALT**

### A2. Required Artefact Locations
For each feature:
- [ ] Decision log exists at: `02-specifications-derived/decision-log/<feature>-decisions.md`
- [ ] Gate-2 prompt exists at: `03-prompt-packs-derived/<feature>/01-architecture-data-model.md`
- [ ] Index entry exists in: `02-specifications-derived/decision-log/rbm-gate2-decision-index.md`

**Fail ⇒ HALT**

---

## B. State Management Policy Enforcement (RBM-POL-STATE-001)

- [ ] Lifecycle/workflow/state/status fields use `sys_choice`
- [ ] No reference table (e.g., `rbm_choice`) is introduced for state machines
- [ ] Gate-2 prompt contains an explicit enforcement block referencing RBM-POL-STATE-001
- [ ] Any detected deviation triggers an immediate stop and requires Orchestrator override approval

**Fail ⇒ HALT**

---

## C. Minimum Required Decision Per Feature

- [ ] Each feature includes `G2-DEC-<FEATURE>-STATE-001` marked ACTIVE
- [ ] The decision references inheritance from `RBM-POL-STATE-001`
- [ ] Applies-to section lists table.field pairs (or explicitly states “N/A” if the feature has no lifecycle state fields)

**Fail ⇒ HALT**

---

## D. Evidence

- [ ] Decision logs include Recorded By and Date fields
- [ ] Gate-2 prompt references the decision ID(s)
- [ ] Orchestrator notes any overrides as governed exceptions

---
If all sections pass, Gate 3 progression is permitted.
