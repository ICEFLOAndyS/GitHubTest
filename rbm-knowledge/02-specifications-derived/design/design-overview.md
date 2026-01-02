# Design Overview — RBM

---
document:
  title: "Design Overview"
  area: "design"
  product: "runbook-management"
  version: "0.1"
  status: "draft"
  owner: "{OWNER}"
  last_updated: "2025-12-28 15:49:13"
  authoritative_standards:
    - "01-standards-authoritative/governance/orchestrator-governance.md"
    - "01-standards-authoritative/governance/definition-of-done-framework.md"
    - "01-standards-authoritative/rbm-naming/rbm-naming-standard.md"
    - "{ADD_AUTHORITATIVE_UI_STANDARD_PATHS}"
---
> **Classification:** Reference Implementation (Recommended)  
> **Scope:** RBM Design System  
> **Enforcement:** Advisory  
> **Deviation:** Permitted if normative standards are met

## 1. Purpose
Defines the baseline RBM design approach used across all features to ensure consistent user experience and predictable agent outputs.

## 2. Design principles
- Consistency over novelty
- Clear status visibility (state, progress, next action)
- Human-in-the-loop by default for regulated execution
- Evidence-first UX (capture decisions, outcomes, timestamps)
- Reduce cognitive load during incidents (simple, guided flows)

## 3. Design system alignment
- Use ServiceNow design patterns (Horizon/Now Experience) as the baseline.
- Any custom styling must be minimal, token-based, and justified.

## 4. Document map
- UX principles: `ux-principles.md`
- Information architecture: `information-architecture.md`
- Interaction patterns: `interaction-patterns.md`
- Page templates: `page-templates.md`
- Components catalogue: `component-catalogue.md`
- Accessibility: `accessibility-and-a11y.md`
- Content standards: `content-and-microcopy.md`
- Data visualisation: `data-visualisation.md`

## 5. RBM Design System (mandatory)
All features, components of UI specifaction must comply with the RBM design system.
- `01-standards-authoritative/rbm-design-system/rbm-design-system.md`

## 6. Icon standards (mandatory)
No feature, component, or UI specification may introduce new icon semantics or reuse icons with conflicting meanings.
All icons used across RBM user interfaces MUST comply with the canonical icon standards defined in:
- `01-standards-authoritative/rbm-design-system/icons/icon-standards.md`

## 7. RBM Tokens (mandatory) 
All features, components, or UI specifications MUST comply with the canonicaltokens defined in:
- `01-standards-authoritative/rbm-design-system/tokens...`