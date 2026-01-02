# RBM Gate 2 Decision Index

**Scope:** All RBM features (current and future)  
**Knowledge Baseline:** RBM Knowledge v1.9.2+  
**Authority:** Derived index (references authoritative policies and feature decision logs)

## Purpose
A machine-readable registry of **Gate 2 (Architecture & Data Model)** decisions to:
- enforce consistent Decision ID formats
- support audit and evidence collection
- enable Orchestrator and Build Agent guardrails

## Decision ID Format (MANDATORY)
`G2-DEC-<FEATURE>-<TOPIC>-<NNN>`

- `<FEATURE>`: fixed RBM feature code (e.g., CP, RB, EVT)
- `<TOPIC>`: STATE, MODEL, REL, VERSION, AUDIT, SECURITY, PERF, UPGRADE, EXT
- `<NNN>`: 3-digit sequence (001, 002…)

## Index Table

| Decision ID | Feature Code | Feature Name | Topic | Status | Inherits Policy | Decision Log Path | Gate-2 Prompt Path |
|---|---:|---|---|---|---|---|---|
| G2-DEC-CP-STATE-001 | CP | Content Packs | STATE | ACTIVE | RBM-POL-STATE-001 | 02-specifications-derived/decision-log/content-packs-decisions.md | 03-prompt-packs-derived/content-packs/01-architecture-data-model.md |
| G2-DEC-RB-STATE-001 | RB | Runbooks | STATE | PLANNED | RBM-POL-STATE-001 | 02-specifications-derived/decision-log/runbooks-decisions.md | 03-prompt-packs-derived/runbooks/01-architecture-data-model.md |
| G2-DEC-EVT-STATE-001 | EVT | Events | STATE | PLANNED | RBM-POL-STATE-001 | 02-specifications-derived/decision-log/events-decisions.md | 03-prompt-packs-derived/events/01-architecture-data-model.md |
| G2-DEC-ISS-STATE-001 | ISS | Issues | STATE | PLANNED | RBM-POL-STATE-001 | 02-specifications-derived/decision-log/issues-decisions.md | 03-prompt-packs-derived/issues/01-architecture-data-model.md |
| G2-DEC-DEC-STATE-001 | DEC | Decisions (module) | STATE | PLANNED | RBM-POL-STATE-001 | 02-specifications-derived/decision-log/decisions-decisions.md | 03-prompt-packs-derived/decisions/01-architecture-data-model.md |
| G2-DEC-WS-STATE-001 | WS | Workstreams | STATE | PLANNED | RBM-POL-STATE-001 | 02-specifications-derived/decision-log/workstreams-decisions.md | 03-prompt-packs-derived/workstreams/01-architecture-data-model.md |
| G2-DEC-FLD-STATE-001 | FLD | Folders / Segmentation | STATE | PLANNED | RBM-POL-STATE-001 | 02-specifications-derived/decision-log/folders-decisions.md | 03-prompt-packs-derived/folders/01-architecture-data-model.md |
| G2-DEC-INT-STATE-001 | INT | Integrations | STATE | PLANNED | RBM-POL-STATE-001 | 02-specifications-derived/decision-log/integrations-decisions.md | 03-prompt-packs-derived/integrations/01-architecture-data-model.md |

## Notes
- “PLANNED” entries must be converted to ACTIVE when the feature’s decision log and Gate-2 prompt are updated.
- Add new decisions by appending rows; do not renumber existing IDs.

---
Maintained by RBM Architecture & Governance. Orchestrator enforces Decision ID compliance at Gate 2+.
