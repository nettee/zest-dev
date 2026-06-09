---
name: Zest Dev
description: This skill should be used when the user asks to "create a spec", "write a spec", mentions "zest dev", "zest-dev", "spec-driven development", "human-interactive development", workflow phases like "research phase", "design phase", "implement phase", asks "how do I write a spec", "what's the spec process", "spec methodology", needs guidance on specification planning and development workflows, wants a quick implementation flow, or wants to capture prior work into a spec.
version: 0.1.0
---

# Zest Dev: Thick Skill, Thin Commands

## Purpose

Zest Dev is a lightweight, human-interactive workflow for spec-driven development.

This skill is the **canonical workflow source** for planned feature work:
- `new`
- `research`
- `design`
- `plan`
- `implement`

Commands should stay thin. They exist as explicit entrypoints and compatibility shims. The actual phase logic lives here.

To keep this file concise, the detailed workflows live in sibling phase docs:
- `new.md`
- `research.md`
- `design.md`
- `plan.md`
- `implement.md`

**Core principle:** keep workflow intelligence in the skill, keep commands lightweight.

## When This Skill Should Trigger

Use this skill when the user:
- asks to create a spec or write a spec
- mentions Zest Dev or spec-driven development
- asks to enter a workflow phase such as new, research, design, plan, or implement
- wants to continue an active change spec
- uses a thin command that explicitly routes into this skill

## Shared Rules

### Language
- Always respond in the user's language unless the user asks to switch languages.

### Source of truth
- Treat this skill as the workflow source for the five core phases.
- Treat commands as wrappers that declare intent and hand off to this skill.

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
- During quick-implement, get explicit user approval when transitioning from Plan to Implement.
- If the user says “whatever you think is best,” provide your recommendation and get confirmation when the choice is consequential.

## Entry Modes

### 1. Thin command entry

Examples:
- `/zest-dev:new`
- `/zest-dev:research`
- `/zest-dev:design`
- `/zest-dev:plan`
- `/zest-dev:implement`

Interpret the command as a request to run the corresponding phase in this skill.

### 2. Natural-language entry

Examples:
- “create a spec for this”
- “research this change”
- “design the architecture”
- “plan the implementation”
- “implement the active spec”

Infer the intended phase from user intent and current spec status.

### 3. Bridge entry

Composite commands such as `quick-implement` should use this skill's core phases instead of re-describing thick workflows themselves.

## Workflow Overview

```text
User intent or thin command
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
- During planning, consider whether the implementation should include a final step to update relevant project documentation. Include that step only when the change affects documented behavior, usage, commands, setup, workflows, or other maintained docs.

### Implement
- The canonical Implement workflow lives in `implement.md`.
- Use it for implementation, test writing, notes updates, and status advancement to `implemented` only when the full plan is complete.

## Bridge Workflows

### Draft
- Draft is no longer a separate command.
- When the user asks to capture an in-progress discussion into a spec, use the New phase and then route to the appropriate next core phase based on the discussion.

### Quick Implement
- Create a new spec from the user's requirement.
- Run all core phases in order.
- Get explicit user approval before moving from Plan to Implement.
- Reuse the canonical phase rules from this skill instead of embedding separate thick instructions.

### Summarize Prior Work
- Summarize is no longer a separate command.
- When the user asks to turn a prior chat, completed coding session, or pull request into a spec, capture only facts supported by the conversation or referenced source, create a spec, and set the highest status genuinely supported by those facts.

## Content Guidance Ownership

Concrete section-writing guidance lives in the phase files:
- `new.md` defines how to write `## Overview`.
- `research.md` defines how to write `design.md` → `## Research`.
- `design.md` defines how to write `design.md` → `## Design`.
- `plan.md` defines how to write `spec.md` → `## Plan` and `## Progress`.
- `implement.md` defines how to update `spec.md` → `## Progress` and write `steps.md`.

## Guardrails

- Do not rely on deployed command frontmatter except `description`.
- Do not hardcode platform-specific agent handles in command text.
- Prefer generic role language such as explorer, architect, or reviewer subagent.
- Keep commands small enough that future workflow changes happen primarily in this skill.

## Summary

Use thin commands for entry, this skill for workflow logic, the CLI for lifecycle transitions, and the spec file as the durable record.
