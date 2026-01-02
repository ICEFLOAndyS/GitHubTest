# RBM Feature Template Pack (v1.1)

Generated: 2025-12-28 14:56:45

## Purpose
A commit-ready feature specification template for the RBM multi-agent system with **governance fully wired**.

## Placement
Copy this folder into your repo:
`02-specifications-derived/features/feature-template/`

Duplicate per feature:
`02-specifications-derived/features/<feature-slug>/`

## Governance wiring
This template embeds:
- authoritative governance references in the document-control header
- explicit governance applicability block in the feature brief
- governance gates in the build plan
- AC-GOV governance acceptance criteria
- decision governance rules in the decision log
- governance standard column in the artefact register

## Operating model
1. Orchestrator creates the feature folder and completes: `feature-brief.md`, `build-plan.md`, `artefact-register.md`
2. Specialist agents populate the remaining specs
3. Build Agent implements strictly per build plan and validates naming
4. Orchestrator validates outputs and DoD prior to progression
