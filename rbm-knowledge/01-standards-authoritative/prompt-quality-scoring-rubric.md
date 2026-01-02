# Prompt Quality Scoring Rubric
RBM AI Design-to-Code Programme

## 1. Purpose
This rubric defines how the quality of **Build Agent prompts** is assessed before execution in the ServiceNow IDE.
It ensures prompts are deterministic, standards-aligned, secure, and suitable for regulated enterprise delivery.

The rubric is **mandatory** for all prompts produced by the AI Prompt Engineer Agent.

---

## 2. Scoring Model Overview

Each prompt is scored across **10 dimensions**.
Each dimension is scored from **0 to 5**.

- **Maximum score:** 50
- **Minimum passing score:** 42
- **Mandatory gates:** Certain criteria must score ≥4 regardless of total

---

## 3. Scoring Dimensions

### 1. Role & Context Clarity
**Does the prompt clearly anchor the Build Agent’s role and execution context?**

| Score | Description |
|-----|------------|
| 0 | No role or context defined |
| 1–2 | Vague role, missing IDE/scope context |
| 3 | Role stated but incomplete |
| 4 | Clear role, scope, and IDE context |
| 5 | Explicit role, scope, execution mode, and constraints |

**Gate:** ≥4 required

---

### 2. Authoritative References
**Are authoritative RBM and ServiceNow references explicitly cited?**

| Score | Description |
|-----|------------|
| 0 | No references |
| 1–2 | Generic or implied references |
| 3 | Partial references |
| 4 | All required RBM standards referenced |
| 5 | RBM + ServiceNow deep links explicitly referenced |

**Gate:** ≥4 required

---

### 3. Objective Atomicity
**Does the prompt define exactly one objective?**

| Score | Description |
|-----|------------|
| 0 | Multiple objectives |
| 1–2 | Broad or compound objective |
| 3 | Mostly atomic but ambiguous |
| 4 | Single, clear objective |
| 5 | Single objective with explicit boundaries |

---

### 4. Scope Definition
**Are in-scope and out-of-scope items clearly defined?**

| Score | Description |
|-----|------------|
| 0 | No scope definition |
| 1–2 | Implicit scope |
| 3 | Partial scope |
| 4 | Explicit in/out scope |
| 5 | Explicit scope with defensive exclusions |

---

### 5. Constraints & Non-Negotiables
**Are constraints explicit and enforceable?**

| Score | Description |
|-----|------------|
| 0 | No constraints |
| 1–2 | Soft or implied constraints |
| 3 | Constraints stated but incomplete |
| 4 | Clear constraints |
| 5 | Clear constraints + negative constraints |

**Gate:** ≥4 required

---

### 6. Technical Precision
**Are instructions technically precise and platform-aware?**

| Score | Description |
|-----|------------|
| 0 | Vague, non-technical |
| 1–2 | High-level technical language |
| 3 | Adequate precision |
| 4 | Precise ServiceNow-aware instructions |
| 5 | Precise, unambiguous, IDE-optimised |

---

### 7. Expected Output Definition
**Is the expected output concrete and verifiable?**

| Score | Description |
|-----|------------|
| 0 | No output defined |
| 1–2 | Generic output |
| 3 | Output partially defined |
| 4 | Explicit artefacts listed |
| 5 | Explicit artefacts + acceptance criteria |

**Gate:** ≥4 required

---

### 8. Validation Criteria
**Can success or failure be objectively validated?**

| Score | Description |
|-----|------------|
| 0 | No validation |
| 1–2 | Subjective validation |
| 3 | Partial validation |
| 4 | Clear validation steps |
| 5 | Deterministic validation + negative tests |

**Gate:** ≥4 required

---

### 9. Failure Handling
**Does the prompt define what to do if execution fails?**

| Score | Description |
|-----|------------|
| 0 | No failure handling |
| 1–2 | Implicit retry |
| 3 | Partial guidance |
| 4 | Clear stop-and-report behaviour |
| 5 | Clear failure handling + recovery path |

---

### 10. Standards & Governance Alignment
**Does the prompt reinforce RBM governance and delivery discipline?**

| Score | Description |
|-----|------------|
| 0 | No governance alignment |
| 1–2 | Implied discipline |
| 3 | Partial alignment |
| 4 | Explicit governance statements |
| 5 | Explicit governance + audit readiness |

---

## 4. Pass / Fail Criteria

A prompt is **APPROVED for execution** only if:
- Total score ≥ **42 / 50**
- All gated dimensions score **≥4**
- No architectural or security ambiguity remains

If a prompt fails:
- It must be revised by the **AI Prompt Engineer Agent**
- Manual correction of Build Agent output is prohibited

---

## 5. Usage Guidance

- The rubric is applied **before** execution in ServiceNow IDE
- QA findings map back to **specific rubric dimensions**
- Prompt improvement is preferred over code patching

---

## 6. Governance

This rubric is part of the **RBM design system** and is versioned alongside:
- Agent Invocation Matrix
- Build Agent Prompt Template
- RBM Development & Security Standards

Deviations require explicit approval.
