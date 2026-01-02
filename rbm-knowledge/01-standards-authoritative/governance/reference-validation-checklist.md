# Reference Governance & Validation Checklist

Generated: 2025-12-29 07:38:05

## A. Registry integrity (mandatory)
1. `01-standards-authoritative/governance/reference-registry.md` exists.
2. All `ref_id` values are unique.
3. All internal `canonical_path` values exist in the repository.
4. `set-common` includes only internal, stable artefacts.
5. External URLs (when added) are https and include version context where applicable.

## B. Agent reference rules (mandatory)
1. Agent folders must not duplicate reference content.
2. Agents declare reference sets only.
3. Orchestrator applies `set-common` universally and applies feature sets as needed.

## C. Missing artefacts policy (mandatory)
1. Missing legacy documents must be replaced with markdown equivalents in-repo.
2. References must point to canonical repo paths only.

## D. Verification commands (recommended)
- Confirm reference registry exists:
  - `test -f 01-standards-authoritative/governance/reference-registry.md`
- Confirm folder segmentation markdown replacements exist:
  - `test -f 02-specifications-derived/features/folder-segmentation/folder-segmentation-consolidated-pack.md`
  - `test -f 02-specifications-derived/features/folder-segmentation/folder-segmentation-architecture-and-data-model.md`
  - `test -f 02-specifications-derived/features/folder-segmentation/folder-segmentation-acl-matrix.md`
  - `test -f 02-specifications-derived/features/folder-segmentation/folder-segmentation-build-agent-prompt-pack.md`
- Confirm IDE playbook exists:
  - `test -f 01-standards-authoritative/governance/playbooks/servicenow-ide-prompt-execution-playbook.md`
