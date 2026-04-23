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

To keep this file concise, the detailed workflows live in sibling phase docs:
- `new.md`
- `research.md`
- `design.md`
- `implement.md`

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

## Canonical Phase Workflow Files

### New
- The canonical New workflow lives in `new.md`.
- Use it for spec creation, overview writing, and first-step guidance.

### Research
- The canonical Research workflow lives in `research.md`.
- Use it for repository discovery, factual research writing, and status advancement to `researched`.

### Design
- The canonical Design workflow lives in `design.md`.
- Use it for clarifications, architecture synthesis, plan shaping, and status advancement to `designed`.

### Implement
- The canonical Implement workflow lives in `implement.md`.
- Use it for approval-gated implementation, test writing, notes updates, and status advancement to `implemented` only when the full plan is complete.

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
- ... Source: `path/to/file:line` / `docs/path.md#section` / `migration_name.sql`

### Available Approaches
- **Option A**: ... Source: `path/to/file:line`
- **Option B**: ... Source: `docs/path.md#section`

### Constraints & Dependencies
- ... Source: `path/to/file:line`

### Key References
- `path/to/file:line` - ...

Every research finding must include a fact source from code, database artifacts, or documentation.
```

### Design
```markdown
## Design

### Architecture Overview
[diagram]

### Design Decisions
- Decision: ... Source: `path/to/file:line` / `docs/path.md#section` / `migration_name.sql`

### Why this design
- ...

### Implementation Steps
1. ...

### Test Strategy
- Phase/area: ... Validation: ... Source: `path/to/file:line`

### Pseudocode
Flow:
  Step A
  Step B

### File Structure
- `path/to/file` - ...
```

List all meaningful design decisions and attach a fact source to each one. Reuse `## Research` sources when possible, and add new factual sources when needed.

If `## Plan` is used, use a capability-based breakdown with meaningful, easy-to-review increments. Good boundaries usually align with one user-visible workflow, one subsystem/integration boundary, one migration/rollout step, or one stabilization milestone. Each implementation phase must include implementation + immediate testing/verification; the final phase may focus on overall testing/verification, edge cases, regression coverage, and coverage improvements. A phase is complete only when its relevant tests pass. Size each phase for one coding-agent session, and write each phase to clearly state both implementation scope and verification approach.

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
