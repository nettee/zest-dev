---
name: Zest Dev
description: This skill should be used when the user asks to "create a spec", "write a spec", mentions "zest dev", "zest-dev", "spec-driven development", "human-interactive development", workflow phases like "research phase", "design phase", "implement phase", asks "how do I write a spec", "what's the spec process", "spec methodology", needs guidance on specification planning and development workflows, or wants to know which workflow to use ("draft", "summarize", "new", "vibe coding").
version: 0.1.0
---

# Zest Dev: Thick Skill, Thin Commands

## Purpose

Zest Dev is a lightweight, human-interactive workflow for spec-driven development.

This skill is the **canonical workflow source** for planned feature work:
- `new`
- `research`
- `design`
- `implement`

Commands should stay thin. They exist as explicit entrypoints and compatibility shims. The actual phase logic lives here.

**Core principle:** keep workflow intelligence in the skill, keep commands lightweight.

## When This Skill Should Trigger

Use this skill when the user:
- asks to create a spec or write a spec
- mentions Zest Dev or spec-driven development
- asks to enter a workflow phase such as new, research, design, or implement
- wants to continue an active change spec
- uses a thin command that explicitly routes into this skill

## Shared Rules

### Language
- Always respond in the user's language unless the user asks to switch languages.

### Source of truth
- Treat this skill as the workflow source for the four core phases.
- Treat commands as wrappers that declare intent and hand off to this skill.

### CLI boundaries
- Use `zest-dev` CLI for spec lifecycle operations.
- Never manually create spec files.
- Never manually edit spec frontmatter.
- Use CLI status transitions only:
  - `new`
  - `researched`
  - `designed`
  - `implemented`

### Spec writing principles
- Prioritize brevity.
- Prefer bullets over long prose.
- Use pseudocode and flow descriptions instead of production code.
- Keep Research factual.
- Keep Design opinionated.
- Keep Notes concise and implementation-focused.

### Reading discipline
- Before writing or deciding, read the active spec and the relevant repository files.
- If subagents or searches identify files, read those files before continuing.

### Questions and approvals
- Ask targeted clarifying questions when requirements or architecture are underspecified.
- Before implementation, get explicit user approval.
- If the user says “whatever you think is best,” provide your recommendation and get confirmation when the choice is consequential.

## Entry Modes

### 1. Thin command entry

Examples:
- `/zest-dev:new`
- `/zest-dev:research`
- `/zest-dev:design`
- `/zest-dev:implement`

Interpret the command as a request to run the corresponding phase in this skill.

### 2. Natural-language entry

Examples:
- “create a spec for this”
- “research this change”
- “design the architecture”
- “implement the active spec”

Infer the intended phase from user intent and current spec status.

### 3. Bridge entry

Composite commands such as `draft` and `quick-implement` should use this skill's core phases instead of re-describing thick workflows themselves.

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
new → researched → designed → implemented
```

## Phase Routing

### New phase
Use when there is no spec yet and the user wants to formalize a requirement.

### Research phase
Use when a spec exists and the team needs repository facts, patterns, and options.

### Design phase
Use when research or direct understanding is sufficient to make an implementation plan.

### Implement phase
Use when the design is ready and the user approves coding.

## Canonical Phase Workflows

### Phase: New

1. Extract a human-readable name and kebab-case slug.
2. Run `zest-dev create <slug>`.
3. Set the created spec active with `zest-dev set-active <spec-id>`.
4. Read the created spec file.
5. Fill `## Overview` using only information the user actually provided.
6. Ask clarifying questions only when the requirement is too vague to produce a useful overview.
7. Confirm spec id, path, active status, and next step.

**Overview content may include:**
- Problem Statement
- Goals
- Scope
- Constraints
- Success Criteria

Do not invent missing sections.

### Phase: Research

1. Run `zest-dev status` and verify an active change spec exists.
2. Run `zest-dev show active` and read the spec file.
3. If the status is `new`, continue. If later, confirm whether the user wants to refresh research.
4. Clarify missing requirement details if needed.
5. Explore the codebase and locate relevant files.
6. Read the identified files.
7. Fill `## Research` with facts only:
   - Existing System
   - Available Approaches
   - Constraints & Dependencies
   - Key References
8. Run `zest-dev update active researched`.
9. Summarize findings and point to the design phase.

**Research rule:** document what exists and what is possible, not what should be chosen.

### Phase: Design

1. Run `zest-dev status` and verify an active change spec exists.
2. Run `zest-dev show active` and read the spec file.
3. If the status is `new`, suggest research first unless the task is simple and sufficiently understood.
4. Identify underspecified areas: scope, edge cases, contracts, compatibility, testing, rollout.
5. Ask the user clarifying questions when needed.
6. Synthesize one recommended architecture by default.
7. Fill `## Design` with:
   - Architecture Overview
   - Why this design
   - Implementation Steps
   - Pseudocode
   - File Structure
   - Interfaces / APIs
   - Edge Cases
8. Fill `## Plan` only when implementation should be split into 2-3 coarse phases.
9. Run `zest-dev update active designed`.
10. Present the design and stop for implementation approval.

**Design rule:** this is where decisions, trade-offs, and recommendations belong.

### Phase: Implement

1. Run `zest-dev status` and verify an active change spec exists with status `designed`.
2. Run `zest-dev show active` and read the full spec.
3. Read all relevant implementation files before coding.
4. Create a task list.
5. Present the implementation scope and get explicit approval.
6. Implement the feature following the design and repository conventions.
7. Write or update tests alongside the implementation.
8. After each completed plan phase, mark the corresponding `## Plan` checkbox as `[x]`.
9. Fill `## Notes` with brief:
   - `### Implementation`
   - `### Verification`
10. If the full spec is complete, run `zest-dev update active implemented`.
11. If only part of the work is complete, keep the current non-final status and document what was done.

**Implementation rule:** only mark the spec `implemented` when the whole plan is finished.

## Bridge Workflows

### Draft
- Capture a discussion into a spec.
- Set the highest status genuinely reached by the conversation.
- Then route the user into the next appropriate core phase from this skill.

### Quick Implement
- Create or resume the active spec.
- Run the remaining core phases in order.
- Keep explicit approval checkpoints before coding.
- Reuse the canonical phase rules from this skill instead of embedding separate thick instructions.

## Content Templates

### Research
```markdown
## Research

### Existing System
- ...

### Available Approaches
- **Option A**: ...
- **Option B**: ...

### Constraints & Dependencies
- ...

### Key References
- `path/to/file:line` - ...
```

### Design
```markdown
## Design

### Architecture Overview
[diagram]

### Why this design
- ...

### Implementation Steps
1. ...

### Pseudocode
Flow:
  Step A
  Step B

### File Structure
- `path/to/file` - ...
```

### Notes
```markdown
## Notes

### Implementation
- `path/to/file` - what changed

### Verification
- Tests run and results
- Manual validation and outcomes
```

## Guardrails

- Do not rely on deployed command frontmatter except `description`.
- Do not hardcode platform-specific agent handles in command text.
- Prefer generic role language such as explorer, architect, or reviewer subagent.
- Keep commands small enough that future workflow changes happen primarily in this skill.

## Summary

Use thin commands for entry, this skill for workflow logic, the CLI for lifecycle transitions, and the spec file as the durable record.
