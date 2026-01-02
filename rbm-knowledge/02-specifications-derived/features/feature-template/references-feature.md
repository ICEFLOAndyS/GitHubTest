# Feature References Declaration

> **Document:** references.feature.md  
> **Classification:** Reference Implementation (Recommended)  
> **Applies to:** A single RBM feature folder under `02-specifications-derived/features/<feature-slug>/`  
> **Last updated:** 2025-12-29 08:38:00

---

## 1. Purpose

This document declares **which reference sets and feature-specific references** are required to deliver this feature.

It is **not** the authoritative source of reference definitions. All reusable and stable references MUST be defined centrally in:

- `01-standards-authoritative/governance/reference-registry.md`

The Orchestrator MUST:
- always apply `set-common`
- merge the sets declared below
- reject any attempt to redefine central references locally

---

## 2. Reference sets used by this feature (declarative)

### 2.1 Mandatory sets
- `set-common`

### 2.2 Additional required sets
List the additional sets required for this feature, e.g.
- `set-ux`
- `set-flow-designer`
- `set-platform-dev`
- `set-qa-atf`
- `set-store-publishing`
- `set-ms-teams`

### 2.3 Optional sets (apply only if in scope)
- `set-<name>`: <when to apply>

---

## 3. Feature-specific references (local to this feature)

Use this section only for **niche or time-bounded** references that are unlikely to be reused.

### 3.1 Internal (repo paths)
List additional internal artefacts **within this repo** that are specific to this feature and not part of shared sets.

| name | path | purpose | status |
|---|---|---|---|
| <internal doc name> | `02-specifications-derived/features/<feature-slug>/...` | <why needed> | active |

Rules:
- paths MUST exist in the repo
- do not reference obsolete/archived paths
- if this internal reference becomes reusable by other features, promote it to the central registry

### 3.2 External (URLs)
List additional external sources required for this feature.

| name | url | version-context | purpose | status |
|---|---|---|---|---|
| <external ref> | https://... | <e.g., Zurich/Yokohama/current> | <why needed> | proposed |

Rules:
- URLs MUST be https
- prefer stable entry points
- set status to `proposed` unless/until the reference is promoted to the central registry

---

## 4. Promotion candidates (feature → central registry)

If any feature-specific reference is likely to be reused across multiple features, list it here for promotion into the central registry under change control.

| candidate | type | current location | proposed registry set | rationale |
|---|---|---|---|---|
| <ref> | internal/external | <path or url> | `set-<name>` | <why reusable> |

---

## 5. Governance and validation alignment

### 5.1 Alignment to feature template pack artefacts
This references declaration supports:
- `feature-brief.md` (scope and assumptions)
- `functional-spec.md` (functional requirements and dependencies)
- `workflow-spec.md` (Flow Designer and automation references)
- `ui-spec.md` (design system and icon compliance)
- `security-access-controls.md` (security standards and external controls)
- `test-plan.md` (ATF references and test evidence)
- `decision-log.md` (promotion decisions, exceptions)

### 5.2 Orchestrator validation rules (mandatory)
The Orchestrator MUST validate:
1. `set-common` is present
2. all declared sets exist in the central registry
3. all internal paths listed in 3.1 exist
4. all external URLs listed in 3.2 are https
5. any `active` external reference is already in the central registry (otherwise downgrade to `proposed`)
6. promotion candidates in section 4 are recorded as decisions when promoted

---

## 6. Change log

| date | version | change | author |
|---|---|---|---|
| 2025-12-29 | v1.0 | Initial template | <name> |
