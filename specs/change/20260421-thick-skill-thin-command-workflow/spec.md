---
id: "20260421-thick-skill-thin-command-workflow"
name: "Thick Skill Thin Command Workflow"
status: new
created: "2026-04-21"
---

## Overview

### Problem Statement
- 当前工作流能力分散在 command 中，导致维护成本偏高，且不同入口之间的行为容易不一致。
- 需要将更多工作流能力沉淀到 skill 中，让命令触发和自然语言 prompt 的使用体验更统一。

### Goals
- 将 research、design、implement 等流程收敛到 skill 内部，由 skill 负责主要逻辑与编排。
- 让 command 仅作为轻量触发入口，尽量减少 command 中的流程逻辑。
- 支持用户不依赖专门 command，仅通过简单 prompt 也能触发对应的 skill/workflow。

### Scope
**In scope:**
- 设计兼容 command 和自由 prompt 的 skill 触发机制。
- 明确 command 与 skill 的职责边界。
- 评估现有 command 中哪些流程适合优先迁移到 skill。

### Constraints
- 需要保证 prompt 直触发时的稳定性和可预测性。

## Research

<!-- What have we found out? What are the alternatives considered? -->

## Design

<!-- Technical approach, architecture decisions -->

## Plan

<!-- Optional: Phase breakdown for complex features that need multiple implementation phases.
     Decided during Design. Checked off during Implement. -->

## Notes

<!-- Optional sections — add what's relevant. -->

### Implementation

<!-- Files created/modified, decisions made during coding, deviations from design -->

### Verification

<!-- How the feature was verified: tests written, manual testing steps, results -->
