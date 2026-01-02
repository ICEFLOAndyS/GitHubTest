# RBM Gate 2 Decision Retrofit Pack

**Scope:** Retrofit existing RBM features to comply with standardized Gate-2 Decision IDs.  
**Baseline:** RBM Knowledge v1.9.2+  
**Outcome:** Every feature has (a) a Gate-2 decision log, (b) a Gate-2 prompt enforcement block, and (c) an index entry.

## A. Retrofit Steps (Apply Per Feature)

### Step 1 — Create/Update Feature Decision Log
Create (or update) a decision log at:
`02-specifications-derived/decision-log/<feature>-decisions.md`

Include at minimum:
- `G2-DEC-<FEATURE>-STATE-001` (inherits RBM-POL-STATE-001)
Authoritative policy location: `01-standards-authoritative/architecture/state-management-policy.md`
- Any existing Gate-2 decisions already implied by the feature’s data model (MODEL/REL/VERSION)

### Step 2 — Inject Gate-2 Enforcement Block into Prompt Pack
In:
`03-prompt-packs-derived/<feature>/01-architecture-data-model.md`

Add:
- reference to RBM-POL-STATE-001
- explicit statement that lifecycle/state fields must use sys_choice
- Decision ID reference for the feature (e.g., G2-DEC-RB-STATE-001)

### Step 3 — Update the Central Index
Add/confirm row(s) in:
`02-specifications-derived/decision-log/rbm-gate2-decision-index.md`

### Step 4 — Add Gate-2 Checklist to Orchestrator Pre-Flight
Ensure the Gate-2 checklist is applied before allowing Gate 3+.

## B. Standard Feature Starter Decisions (Minimum Set)

> These are “starter” Gate-2 decisions you should record for each RBM feature.
> You can add more as the feature matures.

### Runbooks (RB)
- G2-DEC-RB-STATE-001 — State fields use sys_choice (inherits RBM-POL-STATE-001)
- G2-DEC-RB-VERSION-001 — Versioning/baselining strategy for runbooks (if baselining exists)
- G2-DEC-RB-REL-001 — Relationship model between runbook, stages, tasks (including M2M if used)

### Events (EVT)
- G2-DEC-EVT-STATE-001 — State fields use sys_choice
- G2-DEC-EVT-REL-001 — Event ↔ Runbook association model
- G2-DEC-EVT-MODEL-001 — Core event attributes and CSDM references

### Issues (ISS)
- G2-DEC-ISS-STATE-001 — State fields use sys_choice
- G2-DEC-ISS-REL-001 — Issue relationships to runbooks/tasks/events
- G2-DEC-ISS-AUDIT-001 — Minimum audit/evidence fields for issue workflow

### Decisions Module (DEC)
- G2-DEC-DEC-STATE-001 — State fields use sys_choice
- G2-DEC-DEC-MODEL-001 — Decision record structure and evidence (minutes, approvals)
- G2-DEC-DEC-REL-001 — Decision linkage to features/runbooks/events

### Workstreams (WS)
- G2-DEC-WS-STATE-001 — State fields use sys_choice
- G2-DEC-WS-REL-001 — Workstream ↔ RBM objects relationship approach

### Folders / Segmentation (FLD)
- G2-DEC-FLD-STATE-001 — State fields use sys_choice (if lifecycle exists)
- G2-DEC-FLD-REL-001 — Segmentation relationship approach (folders ↔ RBM objects)
- G2-DEC-FLD-SECURITY-001 — Access boundaries and inheritance model (data-level intent)

### Integrations (INT)
- G2-DEC-INT-STATE-001 — State fields use sys_choice (if lifecycle exists)
- G2-DEC-INT-MODEL-001 — Integration config data model (secrets handling excluded)
- G2-DEC-INT-AUDIT-001 — Evidence and logging requirements

## C. Copy/Paste Template — Feature Gate-2 Decision Entry

Use this template in each feature decision log:

---
## G2-DEC-<FEATURE>-STATE-001
**Gate:** Gate 2 — Architecture & Data Model  
**Status:** ACTIVE  
**Inherits Policy:** RBM-POL-STATE-001

### Decision
All lifecycle/workflow/state/status fields SHALL use ServiceNow sys_choice choice fields scoped to RBM tables/fields.
A scoped reference table (e.g., rbm_choice) SHALL NOT be used for state machines.

### Applies To
List the table.field pairs for this feature.

### Enforcement
- Gate 2 prompt must reference RBM-POL-STATE-001
- Orchestrator must halt on violation

---

## D. Copy/Paste Enforcement Block — Feature Gate-2 Prompt

Insert into each feature’s `01-architecture-data-model.md`:

```markdown
## Gate 2 Binding Policy — State Management

This implementation MUST comply with:
RBM-POL-STATE-001 (State Management Policy)

All lifecycle, workflow, and status fields MUST use `sys_choice`.
Reference tables MUST NOT be used for state machines.

Decision ID: G2-DEC-<FEATURE>-STATE-001

Any violation MUST halt execution.
```