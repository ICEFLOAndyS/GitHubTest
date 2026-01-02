# Design System Classification Index

**Applies to:** RBM Design System  
**Authority:** Binding classification standard  
**Status:** Active  
**Change control:** Decision Management Standard  

---

## 1. Classification Principles

The RBM Design System contains artefacts with different enforcement levels.
Every artefact MUST be treated as belonging to exactly one classification:

1. Normative (Mandatory)
2. Reference Implementation (Recommended)
3. Tooling (Supportive / Non-normative)

The Orchestrator MUST apply this classification when enforcing standards,
validating outputs, and resolving conflicts.

---

## 2. Normative Artefacts (Must Be Followed)

**Definition**  
Normative artefacts define binding design rules. All RBM features,
UI specifications, and implementations MUST comply.

**Characteristics**
- Define semantics, constraints, or meaning
- Govern consistency, accessibility, and safety
- Override derived specifications
- Non-compliance is a governance breach

**Examples**
- `rbm-design-system.md`
- `icons/icon-standards.md`
- Canonical design tokens defining meaning (status, colour semantics)
- Any artefact explicitly labelled as standard or mandatory

**Enforcement**
- Enforced by the Orchestrator
- Referenced by top-level design docs and feature UI specs
- Cannot be overridden at feature level

---

## 3. Reference Implementations (Recommended Patterns / Code)

**Definition**  
Reference implementations demonstrate recommended patterns for applying
normative standards. They are not binding but deviations must be justified.

**Characteristics**
- Provide example code or layouts
- Accelerate delivery
- May evolve more rapidly than standards

**Examples**
- Component examples (`*.ts`, `*.tsx`)
- CSS styling examples
- Sample mappings derived from canonical standards

**Usage Rules**
- May be reused or adapted
- Must not redefine semantics
- Must not contradict normative artefacts
- Material deviations should be recorded as decisions

---

## 4. Tooling (Supportive / Non-normative)

**Definition**  
Tooling supports consistency and automation but does not define design rules.

**Characteristics**
- Optional but encouraged
- Replaceable by equivalent tooling
- No semantic authority

**Examples**
- ESLint configurations
- Code templates and scaffolds
- Build-agent helper files

**Usage Rules**
- Tools must align with normative artefacts
- Tools must not be treated as the source of truth

---

## 5. Precedence and Conflict Resolution

When conflicts occur:
1. Normative artefacts take precedence
2. Reference implementations must be adapted
3. Tooling must be updated or replaced

No reference or tool may override a normative rule.

---

## 6. Orchestrator Enforcement Rule

The Orchestrator MUST:
- Enforce normative artefacts strictly
- Allow flexibility in reference implementations
- Treat tooling as enablers only
- Reject features that violate normative design rules

---

## 7. Summary Table

| Classification | Binding | Purpose |
|---------------|---------|---------|
| Normative | Yes | Defines rules and semantics |
| Reference Implementation | No | Demonstrates patterns |
| Tooling | No | Enables automation |

---

## Status

This classification index is effective immediately and applies to all
RBM Design System artefacts.
