---
name: Zest Dev
description: This skill should be used when the user asks to "create a spec", "write a spec", mentions "zest dev", "zest-dev", "spec-driven development", "human-interactive development", workflow phases like "research phase", "design phase", "implement phase", asks "how do I write a spec", "what's the spec process", "spec methodology", or needs guidance on specification planning and development workflows.
version: 0.1.0
---

# Zest Dev

## Purpose

Zest Dev is a lightweight, human-interactive workflow for spec-driven development.

This skill defines the workflow for planned feature work:
- `new`
- `research`
- `design`
- `plan`
- `implement`

To keep this file concise, the detailed workflows live in sibling phase docs:
- `new.md`
- `research.md`
- `design.md`
- `plan.md`
- `implement.md`

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

## Entry Modes

Examples:
- “create a spec for this”
- “research this change”
- “design the architecture”
- “plan the implementation”
- “implement the active spec”

Infer the intended phase from user intent and current spec status.

## Workflow Overview

```text
User intent
          ↓
  Zest Dev skill phase routing
          ↓
     zest-dev CLI + spec files
          ↓
 spec updated with brief, reviewable content
```

Valid progression:

```text
new → researched → designed → planned → implemented
```

## Phase Routing

### New phase
Use when there is no spec yet and the user wants to formalize a requirement.

### Research phase
Use when a spec exists and the team needs repository facts, patterns, and options.

### Design phase
Use when research or direct understanding is sufficient to choose an implementation design.

### Plan phase
Use when the design is ready to turn into issue-scale implementation steps.

### Implement phase
Use when the plan is ready for coding.

## Canonical Phase Workflow Files

### New
- The canonical New workflow lives in `new.md`.
- Use it for spec creation, overview writing, and first-step guidance.

### Research
- The canonical Research workflow lives in `research.md`.
- Use it for repository discovery, factual research writing, and status advancement to `researched`.

### Design
- The canonical Design workflow lives in `design.md`.
- Use it for clarifications, architecture synthesis, design decisions, and status advancement to `designed`.

### Plan
- The canonical Plan workflow lives in `plan.md`.
- Use it for issue-scale step shaping and status advancement to `planned`.
- During planning, always include a final documentation follow-up step that tells the implementer to update relevant project documentation if the implemented change makes that necessary.

### Implement
- The canonical Implement workflow lives in `implement.md`.
- Use it for implementation, test writing, notes updates, and status advancement to `implemented` only when the full plan is complete.

## Content Guidance Ownership

Concrete section-writing guidance lives in the phase files:
- `new.md` defines how to write `## Overview`.
- `research.md` defines how to write `design.md` → `## Research`.
- `design.md` defines how to write `design.md` → `## Design`.
- `plan.md` defines how to write `spec.md` → `## Plan` and `## Progress`.
- `implement.md` defines how to update `spec.md` → `## Progress` and write `steps.md`.

## Guardrails

- Do not hardcode platform-specific agent handles in workflow text.
- Prefer generic role language such as explorer, architect, or reviewer subagent.

## Summary

Use this skill for workflow logic, the CLI for lifecycle transitions, and the spec file as the durable record.
