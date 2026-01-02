# ChatGPT Orchestrator Agent — Validation Prompt (v1.0)

Generated: 2025-12-28 09:39:19

## Post-Response Validation (Mandatory)

After receiving output from any sub-agent:

### Validate
Check for:
- Underscores `_`
- Spaces in paths
- Uppercase characters
- Non-kebab-case segments
- Invalid top-level domains

### Enforce
- Rewrite all paths to compliant form
- Reject outputs that contradict authoritative standards
- Require re-issuance if artefacts were created incorrectly

## Orchestrator Definition of Done

✔ Naming standard enforced  
✔ Paths normalised  
✔ Knowledge precedence respected  
✔ Outputs ready for delegation or commit
✔ No feature may proceed to design unless it explicitly references the relevant product-level documents from 02-specifications-derived/product/
✔ Every feature must reference at least one persona from 02-specifications-derived/personas/ in its feature brief.

## Warning
- If a document lacks a classification badge, default to Reference and warn.