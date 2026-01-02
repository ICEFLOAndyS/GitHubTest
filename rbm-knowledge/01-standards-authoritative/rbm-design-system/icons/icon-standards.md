# RBM Icon Standard — Canonical Catalogue & Mappings

**Product:** ICEFLO RBM  
**Schema version:** 1.0  
**P25-12-23T14:13:43Z

> **Classification:** Normative (Mandatory)  
> **Scope:** RBM Design System  
> **Enforcement:** Orchestrator enforced  
> **Deviation:** Not permitted without governed exception

## 1. Governance Rules

1. **Canonical names only** appear in product code, UX specifications, user stories, and configuration.
2. Library-specific identifiers (Lucide component names, Horizon icon ids) must exist **only** in mapping files.
3. Introducing a new icon requires:
   - add canonical name to `icons.canonical.json`
   - add Lucide mapping in `icons.lucide.map.json`
   - add Horizon mapping in `icons.horizon.map.json`
4. Icon-only interactive controls must include an accessible label (`aria-label`) and should also provide a tooltip.

## 2. Canonical Groups

- **Actions:** `action.add`, `action.edit`, `action.delete`, `action.save`, `action.cancel`, `action.search`, `action.filter`, `action.settings`, `action.refresh`, `action.export`, `action.import`, `action.open`, `action.close`, `action.copy`, `action.link`
- **Navigation:** `nav.back`, `nav.forward`, `nav.expand`, `nav.collapse`, `nav.more`, `nav.externalLink`
- **Status:** `status.success`, `status.warning`, `status.error`, `status.info`, `status.inProgress`, `status.blocked`, `status.paused`
- **RBM Domain:** `rbm.event`, `rbm.runbook`, `rbm.stage`, `rbm.task`, `rbm.dependency`, `rbm.workstream`, `rbm.execution`, `rbm.timeline`, `rbm.manualTaskType`, `rbm.automatedTaskType`, `rbm.communicationTaskType`, `rbm.verificationTaskType`, `rbm.checkpointTaskType`, `rbm.audit`, `rbm.compliance`, `rbm.contentPack`

## 3. Mapping Files

- `icons.canonical.json` — definitive canonical catalogue
- `icons.lucide.map.json` — canonical → Lucide (React)
- `icons.horizon.map.json` — canonical → Horizon `sn-icon` ids (ServiceNow UIF)

## 4. Reference Wrapper Contracts (non-code)

### 4.1 React wrapper (Lucide)
- Inputs: `name` (canonical), `size`, `title`, `decorative`, `variant`
- Output: renders the mapped Lucide icon, defaults to a help/unknown icon when unmapped

### 4.2 ServiceNow UIF wrapper (Horizon)
- Inputs: `name` (canonical), `title`, `decorative`
- Output: renders `<sn-icon icon="...">` using the Horizon mapping, defaults to `h-help-circle` when unmapped

## 5. Coverage

- Canonical icons: 43
- Missing in Lucide map: 0 
- Missing in Horizon map: 0 

> **Note:** Horizon icon ids can vary slightly by ServiceNow release. If any mapped id is unavailable in your instance, update `icons.horizon.map.json` to the closest equivalent while keeping the canonical name stable.
