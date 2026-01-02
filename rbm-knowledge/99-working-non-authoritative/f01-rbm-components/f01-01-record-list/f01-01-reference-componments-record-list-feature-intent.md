# RBM Record List Component Feature Intent (Non-Authoritative)

⚠️ **Status: NON-AUTHORITATIVE**  
This template is optional and provided for convenience only.

Authoritative requirements are defined in:
`01-standards-authoritative/`

---

## Feature Name
RBM Components - Record List

---

## Problem Statement
The adoption of ServiceNow Fluent means that front end applications will be built using React and Typescript.
Fluent, the ServiceNow IDE and Build Agent are evolving rapidly but as if Jan 2026, there is no way to exploit the signficant library of Next Experience Components.  
As we proceed with the adoption for this development stack, we need to ensure UI consistency across all functional modules developed.
One key foundation of this strategy is for the creation and mandatory use of repeatable and consistent user experience patterns.
These patterns must themselves be based on modern, consistent and high quality components.
This feature is specifically related to the extensive use across the RBM soluiton of record lists. 
---

## Feature Objective
Successful delivery of this feature will result in: 
1) A defined, re-usable user interface component - named "RBM Record List"
2) A proven way to define and use this components
3) Strict, mandatory conformance to the rbm-design-system 
4) The feature must support iteration to improve existing refrence components
---

## Equivalent Next Experience Component
There is an equivalent Next Experience Component, known as the Record List.
The specification is found here: https://developer.servicenow.com/dev.do#!/reference/next-experience/zurich/now-components/record%20list/usage
The RBM Record List component should seek to closely emulate the Next Experience component, as defined in the available API specification above.
When composing this RBM feature, the rbm-design-system must be complied with.

## In-Scope
1) RBM Record List component only 


## Out-of-Scope
1) Other RBM components, including future atomic RBM components that might ultimately be used for the RBM Record List


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
RBM Record List component will be created from a combination of React, Typescript and CSS
RBM Record List component will only be used for the Features developed using the ServiceNow IDE & ServiceNow Build Agent 
RBM Record List component will NOT be available for use in ServiceNow UI Builder

---

This template:
- does not define acceptance criteria
- does not approve scope
- does not replace governed artefacts

This document MUST NOT be promoted to an authoritative domain.
