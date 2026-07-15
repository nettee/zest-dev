---
name: Zest Dev
description: This skill should be used when the user asks to "create a spec", "write a spec", mentions "zest dev", "zest-dev", "spec-driven development", "human-interactive development", workflow phases like "research phase", "design phase", "implement phase", asks "how do I write a spec", "what's the spec process", "spec methodology", or needs guidance on specification planning and development workflows.
version: 0.1.0
---

# Zest Dev

## Purpose

Zest Dev is a lightweight, human-interactive workflow for spec-driven development.

Planned feature work progresses through `new → researched → designed → planned → implemented`. This file owns routing and shared invariants; sibling phase files own phase-specific behavior and output guidance.

## When This Skill Should Trigger

Use this skill when the user:
- asks to create a spec or write a spec
- mentions Zest Dev or spec-driven development
- asks to enter a workflow phase such as new, research, design, plan, or implement
- wants to continue an active change spec

## Shared Rules

### Language
- Always respond in the user's language unless the user asks to switch languages.

### Source of truth
- Treat this skill as the workflow source for the five core phases.

### CLI boundaries
- Use `zest-dev` CLI for spec lifecycle operations.
- Never manually create spec files.
- Never manually edit spec frontmatter.
- Use CLI status transitions only:
  - `new`
  - `researched`
  - `designed`
  - `planned`
  - `implemented`

### Spec writing principles
- Prioritize brevity.
- Prefer bullets over long prose.
- Use pseudocode and flow descriptions instead of production code.
- Keep Research factual.
- Keep Design opinionated.
- Keep implementation notes concise and implementation-focused.

### Reading discipline
- Before writing or deciding, read the active spec and the relevant repository files.
- If subagents or searches identify files, read those files before continuing.

### Questions and approvals
- Ask targeted clarifying questions when requirements or architecture are underspecified.
- If the user says “whatever you think is best,” provide your recommendation and get confirmation when the choice is consequential.

## Phase Routing

Infer the intended phase from user intent and the active spec status, then read its canonical file:

- `new.md`: create and activate a spec; write `## Overview`.
- `research.md`: gather repository facts in `design.md` → `## Research`; advance to `researched`.
- `design.md`: resolve consequential questions; write Design, EAG, DFU, and Design Detail; advance to `designed`.
- `plan.md`: create issue-scale Plan and Progress entries; advance to `planned`.
- `implement.md`: implement and validate the Plan; update Progress and `steps.md`; advance to `implemented` only when complete.

## Guardrails

- Do not hardcode platform-specific agent handles in workflow text.
- Prefer generic role language such as explorer, architect, or reviewer subagent.
