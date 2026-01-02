# Build Agent Naming Pre-Flight Gate (Mandatory)

Generated: 2025-12-28 09:22:29

## 1. Objective
Prevent creation, renaming, or referencing of any artefact path that violates the RBM Knowledge Naming Standard.

## 2. Hard fail rules
Fail the build immediately if ANY of the following is true:
1. Any path segment contains `_`
2. Any folder/file stem contains uppercase characters
3. Any folder/file stem contains spaces
4. Any folder/file stem is not kebab-case (`^[a-z0-9]+(?:-[a-z0-9]+)*$`)
5. The first path segment is not one of the approved top-level domains:
   - `01-standards-authoritative`
   - `02-specifications-derived`
   - `03-prompt-packs-derived`
   - `99-working-non-authoritative`

## 3. Pseudo-code (implementation reference)
```pseudo
ALLOWED_TOP = {
  "01-standards-authoritative",
  "02-specifications-derived",
  "03-prompt-packs-derived",
  "99-working-non-authoritative"
}
REGEX_KEBAB = r"^[a-z0-9]+(?:-[a-z0-9]+)*$"

function validate(path):
  norm = path.replace("\\", "/")
  parts = norm.split("/")

  if parts[0] not in ALLOWED_TOP:
    fail("Invalid top-level domain", norm)

  for part in parts:
    if "_" in part:
      fail("Underscore prohibited", norm)
    if " " in part:
      fail("Spaces prohibited", norm)

  for i from 1 to len(parts)-1:
    part = parts[i]
    stem = part.split(".")[0]  // folder or file stem
    if anyUppercase(stem):
      fail("Uppercase prohibited", norm)
    if not matches(REGEX_KEBAB, stem):
      fail("Not kebab-case", norm)

  pass()

for change in changes:
  validate(change.new_path)
  if change.type == "rename":
    validate(change.old_path)
pass_all()
```

## 4. Standard error output format
When failing, output:
- **Rule violated**
- **Offending path**
- **Corrected path suggestion** (normalised kebab-case)
- **Action required** (rename/update references)

## 5. Paste-ready instruction block (add to every Build Agent run)
> **Pre-flight naming gate:** Before creating or referencing any file/folder path, validate it against the RBM Naming Standard. Reject any path with `_`, spaces, uppercase, or non-kebab-case. Only use the four approved top-level domains. If a provided path is non-compliant, normalise it and update all references.
