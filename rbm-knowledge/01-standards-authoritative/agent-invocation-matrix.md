# Agent Invocation Matrix
RBM AI Design-to-Code Programme

## 1. Purpose
This document defines which AI agents must be invoked, in what order, and with what entry/exit criteria for each RBM feature type.

## 2. Agent Categories
- Control: ChatGPT Orchestrator Agent, AI Prompt Engineer Agent
- Design & Architecture: Persona & User Journeys, UX & UI Designer, ServiceNow Architect
- Build & Security: Platform Developer, Front-End Developer, Security Expert
- Validation & Enablement: Quality Engineer, Flow Designer (conditional), Dashboard Designer (conditional), MS Teams Integration (conditional)

## 3. Mandatory Invocation Matrix
| Feature Type | Mandatory Agents | Conditional Agents |
|-------------|------------------|--------------------|
| Core Capability | Orchestrator, Personas, UX/UI, Architect, Security, QA, Prompt Engineer | Platform Dev, Front-End Dev |
| Data Model Change | Orchestrator, Architect, Security, QA, Prompt Engineer | Platform Dev |
| UI Feature | Orchestrator, UX/UI, Architect, Security, QA, Prompt Engineer | Front-End Dev |
| Access Control | Orchestrator, Architect, Security, QA, Prompt Engineer | Platform Dev |

## 4. Non-Negotiable Rules
- No Build Agent execution without AI Prompt Engineer output
- Prompt is the unit of change
