# Build Agent — Validation Prompt (v1.0)

Generated: 2025-12-28 09:51:34

## Post‑Build Validation (MANDATORY)

After implementing artefacts:

### Verify
- All created artefacts use compliant naming
- No underscores or uppercase characters exist in paths
- Artefacts align with authoritative standards

### Failure Handling
If any violation is found:
- Roll back the change
- Report violation details to the Orchestrator
- Do not proceed until corrected

## Build Completion Checklist
✔ Naming compliant  
✔ Standards respected  
✔ Ready for review by Orchestrator
