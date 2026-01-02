# RBM Knowledge Naming Standard (Authoritative)

Generated: 2025-12-28 09:22:29

## 1. Scope
Applies to **all** RBM knowledge artefacts and any files generated/modified by ServiceNow IDE Build Agent.

## 2. Top-level repository domains (fixed)
Only these are permitted at the repository root:

- `01-standards-authoritative`
- `02-specifications-derived`
- `03-prompt-packs-derived`
- `99-working-non-authoritative`

## 3. Folder + file naming rules
### 3.1 Separators
- Hyphen (`-`) is the **only permitted** word separator.
- Underscore (`_`) is **prohibited**.

### 3.2 Case
- All folder and file names must be **lowercase kebab-case**:
  - Allowed characters: `a-z`, `0-9`, `-`
  - Pattern: `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- File extensions are permitted (e.g. `.md`, `.json`, `.png`), but the **stem** must comply.

### 3.3 No spaces
- Spaces in names are prohibited.

## 4. Compliance responsibilities
- **Orchestrator Agent:** normalises any incoming/non-compliant paths and updates all references before delegation.
- **Build Agent:** enforces pre-flight validation and fails fast on violation.

## 5. Conflict resolution
If any artefact contradicts this standard, this standard takes precedence.
