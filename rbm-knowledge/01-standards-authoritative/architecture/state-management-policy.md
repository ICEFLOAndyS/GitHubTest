# RBM State Management Policy

## Policy ID
RBM-POL-STATE-001

## Applies To
All RBM features, modules, and extensions (current and future).

## Policy Statement
All lifecycle, workflow, state, and status fields within RBM SHALL use
ServiceNow `sys_choice`–backed choice fields scoped to RBM tables and fields.

A scoped reference table (for example, `rbm_choice`) SHALL NOT be used for:
- lifecycle states
- workflow states
- status or phase fields

## Rationale
- `sys_choice` is the ServiceNow-native mechanism for lifecycle and state management.
- Scoped isolation is achieved via table and field binding, without cross-application impact.
- Lifecycle states represent governed state machines, not configurable data.
- Deterministic state values support auditability, segregation of duties, and regulatory evidence
  aligned to FCA/PRA Operational Resilience and EU DORA expectations.

## Explicit Exclusions
The following MAY use scoped reference tables where configurability is required:
- taxonomies and classifications
- tagging models
- customer-defined templates or types
- policy-driven or rules-based configuration data

## Enforcement
This policy is binding at:
- Gate 2 (Architecture & Data Model)
- Gate 4 (Process & Flow Definition)
- Gate 5 (Security & Segregation of Duties)
- Gate 6 (Prompt Pack Engineering)

Any violation of this policy MUST:
- halt progression to the next gate
- be flagged as a governance breach
- require explicit Orchestrator override approval to proceed

## Ownership
RBM Architecture & Governance

## Change Control
Changes to this policy require:
- a governed change request
- versioned update to the standards repository
- Orchestrator approval

---
Authoritative document. In the event of conflict, this policy takes precedence over all derived artefacts.
