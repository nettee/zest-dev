---
name: zest-dev
description: Use for creating, designing, planning, implementing, or continuing a Zest Dev Spec, including lightweight and grilling-based design workflows.
version: 0.1.0
---

# Zest Dev

## Purpose

Zest Dev is a lightweight, human-interactive workflow for spec-driven development. It owns Spec lifecycle and recording contracts; specialized skills may own how particular judgments or implementation work are performed.

New-format Specs progress through `new → designed → planned → implemented`.

## Shared invariants

### Language

- Use the user's current language for conversation and prose artifacts.
- Preserve code identifiers, commands, quoted text, and established project terminology in their original form.

### CLI boundaries

- Use the `zest-dev` CLI to create, activate, and update Specs.
- Never create Spec files manually or edit frontmatter manually.
- Valid statuses are `new`, `designed`, `planned`, and `implemented`.
- Statuses describe content maturity, not which activities have run.
- Advance status only after its content contract is complete: move to `designed` only after the Designed Contract is satisfied, to `planned` only after the Planned Contract is satisfied, and to `implemented` only after the Implemented Contract is satisfied.
- Use `zest-dev update active designed|planned|implemented` immediately after completing the corresponding contract so frontmatter matches the finished artifacts.
- Treat old Specs with unsupported statuses or content structures as invalid input; do not migrate or reinterpret them.

### Recording discipline

- Keep the Spec as the durable record of required facts, decisions, constraints, caveats, evidence gaps, acceptance behavior, Plan Tickets, implementation deviations, and representative verification.
- Remove repetition, generic background, and implementation detail that does not change the contract.
- Keep Research Findings descriptive and source-backed.
- Keep Design Decisions normative, with rationale and trade-offs separated from their factual premises.
- Before writing or deciding, read the active Spec and the repository files that materially affect the current content.

### Acceptance-gate scope

Treat EAG (E2E Acceptance Gate) as a one-time, Spec-local acceptance step. Keep its harness, command, environment variables, and evidence collection temporary or inside the Spec; do not promote them into repository-wide scripts, CLI commands, product concepts, or general documentation unless the user explicitly requests a reusable capability. After acceptance, remove temporary EAG artifacts while preserving the result in the Spec.

### Continuation

- Infer the user's requested outcome and continue until its content contract is satisfied.
- Do not introduce mandatory pauses, hand-offs, or next-step suggestions between content areas.
- Reaching a status ends the workflow only when it satisfies the user's requested outcome.
- Ask only about consequential choices that cannot be established from available facts.

## Design Approach routing

- Use the Lightweight Design Approach by default.
- Use the Grilling Design Approach when the user explicitly requests grilling or `grill-with-docs`.
- When multiple consequential decisions depend on one another, recommend the Grilling Design Approach and use it only after the user accepts.
- For the Grilling Design Approach, use the registered `grilling` and `domain-modeling` skills directly. Do not duplicate their interview, glossary, scenario-testing, or ADR rules here.
- Both approaches must satisfy the same Design content contract and reach the same Designed Status.

## Section Guide routing

Read the guides for the Spec content involved in the user's requested outcome:

- `overview.md`: Overview content contract and new-Spec creation requirements.
- `design.md`: Design Section and Design Record contracts, including both Design Approaches.
- `plan.md`: Plan and Progress contracts using Spec-local tracer-bullet tickets.
- `implementation.md`: Progress execution and Implementation File contract.

## Guardrails

- Do not hardcode platform-specific agent handles in workflow text.
- Refer to registered skills by name and generic roles such as explorer, architect, or reviewer.
