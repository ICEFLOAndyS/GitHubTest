# Orchestrator Path Normaliser (Mandatory)

Generated: 2025-12-28 09:22:29

## 1. Objective
Ensure every delegated task references **compliant** RBM knowledge paths:
- hyphen separators only
- lowercase kebab-case
- approved top-level domains

## 2. Normalisation algorithm (in order)
1. Replace `_` with `-`
2. Convert spaces to `-`
3. Convert camelCase / PascalCase to kebab-case
4. Lowercase
5. Collapse multiple `-` to one
6. Trim leading/trailing `-`
7. Validate / map top-level domain

## 3. Domain mapping policy (when missing/unknown)
Map based on path hints:
- Contains `standard|policy|design-system|tokens|icons` → `01-standards-authoritative`
- Contains `agent|prompt|build|orchestrator|ide` → `03-prompt-packs-derived`
- Contains `spec|workflow|dictionary|architecture|product|model` → `02-specifications-derived`
- Else → `99-working-non-authoritative`

## 4. Operating rules
### 4.1 Before delegating to any sub-agent
- Normalise every path in the outgoing prompt.
- Emit a short “Path Normalisation” block showing:
  - original path
  - normalised path
  - chosen top-level domain + rationale

### 4.2 After receiving agent output
- Scan for violations (`_`, spaces, uppercase, non-kebab-case).
- Rewrite to compliant paths.
- If output includes artefact creation instructions, ensure they use compliant paths.

## 5. Paste-ready Orchestrator instruction block
> **Path normalisation is mandatory.** Treat any non-compliant path as a defect. Normalise it and update all references before delegation. Never allow `_` or non-kebab-case to persist into delegated prompts or final artefacts.
