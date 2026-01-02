# RBM Reference Registry

> **Status:** Authoritative  
> **Version:** 1.0  
> **Last updated:** 2025-12-29 08:22:36  
> **Owner:** Product & Architecture Governance  
> **Change control:** `01-standards-authoritative/governance/decision-management-standard.md`

---

## 1. Purpose and rules

1. This registry is the **single source of truth** for all references used by RBM agents.
2. Agents MUST NOT maintain duplicated reference lists in their local folders.
3. Agents declare **reference sets** only; the Orchestrator applies sets at runtime.
4. **Internal references** MUST use canonical repo paths and MUST exist.
5. **External references** MUST use `https` URLs and SHOULD use stable entry points (avoid deep anchors unless necessary).
6. Any new reference or set change MUST follow change control.

---

## 2. Reference sets

### 2.1 set-common — Universal standards (mandatory)
Applies to: all agents

Includes:
1. ref-std-orchestrator-governance
2. ref-std-dod-framework
3. ref-std-naming
4. ref-std-dev-standards
5. ref-std-decision-management
6. ref-std-evidence-audit
7. ref-std-exception-waiver
8. ref-std-lifecycle
9. ref-baseline-manifest
10. ref-ds-root
11. ref-ds-classification
12. ref-ui-icon-standards
13. ref-ide-exec-playbook


> Note: role-based external sets (ux, build-agent, flow-designer, qa-atf, etc.) should be added here once validated and approved.

---

## 3. Reference catalogue

### 3.1 Internal references

#### 3.1.1 Governance

1. **ref-std-orchestrator-governance** — Orchestrator Governance Standard  
   - type: internal  
   - path: `01-standards-authoritative/governance/orchestrator-governance.md`  
   - version-context: v1.1  
   - tags: common, governance  
   - status: active

2. **ref-std-dod-framework** — Definition of Done Framework  
   - type: internal  
   - path: `01-standards-authoritative/governance/definition-of-done-framework.md`  
   - version-context: v1.x  
   - tags: common, governance  
   - status: active

3. **ref-std-decision-management** — Decision Management Standard  
   - type: internal  
   - path: `01-standards-authoritative/governance/decision-management-standard.md`  
   - version-context: v1.x  
   - tags: common, governance  
   - status: active

4. **ref-std-evidence-audit** — Evidence and Audit Standard  
   - type: internal  
   - path: `01-standards-authoritative/governance/evidence-and-audit-standard.md`  
   - version-context: v1.x  
   - tags: common, governance  
   - status: active

5. **ref-std-exception-waiver** — Exception and Waiver Policy  
   - type: internal  
   - path: `01-standards-authoritative/governance/exception-and-waiver-policy.md`  
   - version-context: v1.x  
   - tags: common, governance  
   - status: active

6. **ref-std-lifecycle** — Lifecycle and State Model  
   - type: internal  
   - path: `01-standards-authoritative/governance/lifecycle-and-state-model.md`  
   - version-context: v1.x  
   - tags: common, governance  
   - status: active

7. **ref-baseline-manifest** — Baseline Release Manifest  
   - type: internal  
   - path: `01-standards-authoritative/governance/rbm-baseline-release-manifest.md`  
   - version-context: v1.x  
   - tags: common, governance  
   - status: active

#### 3.1.2 Naming

1. **ref-std-naming** — RBM Naming Standard  
   - type: internal  
   - path: `01-standards-authoritative/rbm-naming/rbm-naming-standard.md`  
   - version-context: v1.x  
   - tags: common, governance  
   - status: active

#### 3.1.3 Development

1. **ref-std-dev-standards** — Development Standards (Authoritative)  
   - type: internal  
   - path: `01-standards-authoritative/development/development-standards-authoritative.md`  
   - version-context: v1.x  
   - tags: common, development  
   - status: active

#### 3.1.4 Design system

1. **ref-ds-root** — RBM Design System (root)  
   - type: internal  
   - path: `01-standards-authoritative/rbm-design-system/rbm-design-system.md`  
   - version-context: v1.x  
   - tags: common, design  
   - status: active

2. **ref-ds-classification** — Design System Classification Index  
   - type: internal  
   - path: `01-standards-authoritative/rbm-design-system/rbm-design-system-classification-index.md`  
   - version-context: v1.x  
   - tags: common, design  
   - status: active

3. **ref-ui-icon-standards** — Icon Standards  
   - type: internal  
   - path: `01-standards-authoritative/rbm-design-system/icons/icon-standards.md`  
   - version-context: v1.x  
   - tags: common, design  
   - status: active

#### 3.1.5 Playbooks

1. **ref-ide-exec-playbook** — ServiceNow IDE Prompt Execution Playbook  
   - type: internal  
   - path: `01-standards-authoritative/playbooks/servicenow-ide-prompt-execution-playbook.md`  
   - version-context: v1.x  
   - tags: common, tooling  
   - status: active

#### 3.1.6 Feature packs (Shared)

<!-- No Shared Faeture Packs created at this time. -->

---

### 4 External references
# External References Catalogue

### 4.1 ServiceNow platform – core documentation

4. **ref-ext-servicenow-developer-guide** — ServiceNow Developer Guide (Now Platform)  
   - type: external  
   - url: https://developer.servicenow.com/dev.do  
   - version-context: current  
   - tags: platform, common  
   - status: active

5. **ref-ext-professional-developer-guide-zurich** — Professional Developer Guide for the Now Platform  
   - type: external  
   - url: https://developer.servicenow.com/dev.do#!/guides/zurich/professional_developer  
   - version-context: Zurich  
   - tags: platform, development  
   - status: active

---

### 4.2 ServiceNow IDE & Build Agent

6. **ref-ext-exploring-build-agent-zurich** — Exploring Build Agent  
   - type: external  
   - url: https://developer.servicenow.com/dev.do#!/guides/zurich/application_development/build_with_build_agent/exploring_build_agent  
   - version-context: Zurich  
   - tags: build-agent, ide  
   - status: active

7. **ref-ext-build-with-agent-community** — Build with Agent (ServiceNow Community thread)  
   - type: external  
   - url: https://www.servicenow.com/community/developer-forum/build-with-agent/td-p/2960998  
   - version-context: current  
   - tags: build-agent, community  
   - status: active

8. **ref-ext-servicenow-fluent-zurich** — ServiceNow Fluent (IDE)  
   - type: external  
   - url: https://developer.servicenow.com/dev.do#!/guides/zurich/application_development/build_with_build_agent/servicenow_fluent  
   - version-context: Zurich  
   - tags: build-agent, ide  
   - status: active

---

### 4.3 Application publishing & ServiceNow Store

9. **ref-ext-publish-app-store-zurich** — Publish an application to the ServiceNow Store  
   - type: external  
   - url: https://developer.servicenow.com/dev.do#!/guides/zurich/application_development/app_store/publish_an_application_to_the_servicenow_store  
   - version-context: Zurich  
   - tags: store, publishing  
   - status: active

10. **ref-ext-publish-app-store-xanadu** — Publish an application to the ServiceNow Store  
    - type: external  
    - url: https://developer.servicenow.com/dev.do#!/guides/xanadu/application_development/app_store/publish_an_application_to_the_servicenow_store  
    - version-context: Xanadu  
    - tags: store, publishing  
    - status: active

11. **ref-ext-store-publisher-portal** — Upload application to Store Publisher Portal  
    - type: external  
    - url: https://developer.servicenow.com/dev.do#!/guides/zurich/application_development/app_store/upload_an_application_to_the_store_publisher_portal  
    - version-context: Zurich  
    - tags: store, publishing  
    - status: active

---

### 4.4 Horizon Design System & UI standards

12. **ref-ext-horizon-home** — Horizon Design System (Home)  
    - type: external  
    - url: https://horizon.servicenow.com  
    - version-context: current  
    - tags: ux, design  
    - status: active

13. **ref-ext-horizon-core-ui** — Horizon Core UI Overview  
    - type: external  
    - url: https://horizon.servicenow.com/core-ui/overview  
    - version-context: current  
    - tags: ux, design  
    - status: active

14. **ref-ext-horizon-resources-core-ui** — Horizon Core UI Resources  
    - type: external  
    - url: https://horizon.servicenow.com/resources/core-ui  
    - version-context: current  
    - tags: ux, design  
    - status: active

15. **ref-ext-horizon-getting-started** — Getting Started with Horizon Design System  
    - type: external  
    - url: https://horizon.servicenow.com/getting-started/develop  
    - version-context: current  
    - tags: ux, design  
    - status: active

---

### 4.5 Now Experience UI framework

16. **ref-ext-next-experience-ui** — Next Experience UI (Landing)  
    - type: external  
    - url: https://developer.servicenow.com/dev.do#!/guides/yokohama/now-experience/next-experience-ui  
    - version-context: Yokohama  
    - tags: ui, next-experience  
    - status: active

17. **ref-ext-understand-ui-experiences** — Understand the ServiceNow UI Experiences  
    - type: external  
    - url: https://developer.servicenow.com/dev.do#!/guides/xanadu/now-experience/understand_the_servicenow_ui_experiences  
    - version-context: Xanadu  
    - tags: ui, next-experience  
    - status: active

---

### 4.6 Flow Designer

18. **ref-ext-flow-designer-overview** — Flow Designer Overview  
    - type: external  
    - url: https://developer.servicenow.com/dev.do#!/guides/washingtondc/now-platform/flow_designer/flow_designer_overview  
    - version-context: Washington DC  
    - tags: flow-designer, automation  
    - status: active

19. **ref-ext-flows-getting-started** — Getting Started with Flows  
    - type: external  
    - url: https://developer.servicenow.com/dev.do#!/guides/zurich/now-platform/flow_designer/getting_started_with_flows  
    - version-context: Zurich  
    - tags: flow-designer, automation  
    - status: active

20. **ref-ext-flow-designer-reference** — Flow Designer Reference  
    - type: external  
    - url: https://developer.servicenow.com/dev.do#!/guides/yokohama/now-platform/flow_designer/flow_designer_reference  
    - version-context: Yokohama  
    - tags: flow-designer, automation  
    - status: active

---

### 4.7 Platform scripting & data access

21. **ref-ext-gliderecord-api-scoped** — GlideRecord API (Scoped applications)  
    - type: external  
    - url: https://developer.servicenow.com/dev.do#!/reference/api/zurich/server_legacy/c_GlideRecordScopedAPI  
    - version-context: Zurich  
    - tags: platform, scripting  
    - status: active

22. **ref-ext-querying-tables** — Querying Tables in Scripts  
    - type: external  
    - url: https://developer.servicenow.com/dev.do#!/guides/yokohama/server-side_scripting/querying_tables_in_scripts  
    - version-context: Yokohama  
    - tags: platform, scripting  
    - status: active

---

### 4.8 Automated Test Framework (ATF)

23. **ref-ext-atf-intro** — Introduction to Automated Test Framework  
    - type: external  
    - url: https://developer.servicenow.com/dev.do#!/guides/zurich/now-platform/automated_test_framework/atf_intro  
    - version-context: Zurich  
    - tags: qa, atf  
    - status: active

24. **ref-ext-atf-design-considerations** — ATF Design Considerations  
    - type: external  
    - url: https://developer.servicenow.com/dev.do#!/guides/zurich/now-platform/automated_test_framework/atf_design_considerations  
    - version-context: Zurich  
    - tags: qa, atf  
    - status: active

25. **ref-ext-atf-first-test** — Build and Run Your First Automated Test  
    - type: external  
    - url: https://developer.servicenow.com/dev.do#!/guides/yokohama/now-platform/automated_test_framework/build_and_run_your_first_automated_test  
    - version-context: Yokohama  
    - tags: qa, atf  
    - status: active

---

### 4.9 Performance Analytics

26. **ref-ext-pa-landing** — Performance Analytics (Landing Page)  
    - type: external  
    - url: https://developer.servicenow.com/dev.do#!/guides/washingtondc/now-platform/performance_analytics/performance_analytics_landing_page  
    - version-context: Washington DC  
    - tags: analytics, pa  
    - status: active

27. **ref-ext-pa-getting-started** — Explore Performance Analytics  
    - type: external  
    - url: https://developer.servicenow.com/dev.do#!/guides/zurich/now-platform/performance_analytics/explore_performance_analytics  
    - version-context: Zurich  
    - tags: analytics, pa  
    - status: active

---

### 4.10 Integrations

28. **ref-ext-servicenow-ms-teams** — ServiceNow for Microsoft Teams and Microsoft 365  
    - type: external  
    - url: https://developer.servicenow.com/dev.do#!/guides/zurich/now-platform/integrationhub/servicenow_for_microsoft_teams_and_microsoft_365  
    - version-context: Zurich  
    - tags: integration, ms-teams  
    - status: active


## 5. Change control

1. Any addition/removal/reclassification of references or sets MUST be recorded as a governed decision.
2. Changes MUST update:
   - this registry version (minor increment), and
   - the baseline manifest if the change affects `set-common`.
