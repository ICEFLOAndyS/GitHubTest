# RBM Components Feature Intent (Non-Authoritative)

⚠️ **Status: NON-AUTHORITATIVE**  
This template is optional and provided for convenience only.

Authoritative requirements are defined in:
`01-standards-authoritative/`

---

## Feature Name
RBM Components

---

## Problem Statement
The adoption of ServiceNow Fluent means that front end applications will be built using React and Typescript.
Fluent, the ServiceNow IDE and Build Agent are evolving rapidly but as if Jan 2026, there is no way to exploit the signficant library of Next Experience Components.  
As we proceed with the adoption for this development stack, we need to ensure UI consistency across all functional modules developed.
One key foundation of this strategy is for the creation and mandatory use of repeatable and consistent user experience patterns.
These patterns must themselves be based on modern, consistent and high quality components. 
---

## Feature Objective
Successful delivery of this feature will result in 
1) A defined set of foundational user interface components - the RBM Components
2) A proven way to define these components, with strict, mandatory conformance to the rbm-design-system 
3) Strong configuration controls through approved changes to any UI asset in the RBM Component library. 
4) Consistent construction of user experience patterns and solution features.
5) Opportunities to embrace increased quality of the multi-agent feature delivery process
6) The feature must support iteration to improve existing refrence components
7) The feature must support the addition of new RBM Components to the component library 

---

## Now Components
Where there is an equivalent Now Component, the RBM Component should seek to closely emulate the available API specification.
When making this translation, the rbm-design-system must be complied with.

## In-Scope
# 1) Atomic Components

1) Card component
2) List component

# 2) Compound Components
1) Filter component
2) Header info component 
---

## Out-of-Scope
1) Design and implementation of the user experience patterms
2) Server-side

---

## Target Personas
The RBM personas that this feature is intended to support are as follows:

content_creators persona category:
1) 02-specifications-derived/personas/content_creators/content-pack-author.md
2) 02-specifications-derived/personas/content_creators/content-author.md
3) 02-specifications-derived/personas/content_creators/runbook-engineer.md
4) 02-specifications-derived/personas/content_creators/team-leader.md

---

## Notes / Assumptions
RBM Components will be created from a combination of React, Typescript and CSS
RBM Components will only be used for the Features developed using the ServiceNow IDE & ServiceNow Build Agent 
RBM Components will NOT be available for use in ServiceNow UI Builder

---

This template:
- does not define acceptance criteria
- does not approve scope
- does not replace governed artefacts

This document MUST NOT be promoted to an authoritative domain.
