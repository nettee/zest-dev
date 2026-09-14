---
name: zest-dev
description: Create and advance Zest Dev Specs through overview, design, planning, and implementation, using lightweight or grilling design workflows.
---

# Zest Dev

Zest Dev is a lightweight, human-interactive workflow for spec-driven development. New-format Specs progress through `new → designed → planned → implemented`.

## Invariants

- Use the user's language for conversation and prose artifacts while preserving code, commands, quotations, and established terminology.
- Use the `zest-dev` CLI to create, activate, and update Specs. Never create Spec files or edit frontmatter manually.
- Statuses describe content maturity. After completing a Section Guide's contract, immediately run `zest-dev update active designed|planned|implemented` as appropriate.
- Treat Specs with unsupported statuses or content structures as invalid input; do not migrate or reinterpret them.
- Keep the Spec as the concise, durable record of material facts, decisions, constraints, evidence gaps, acceptance behavior, Plan Tickets, deviations, and representative verification.
- Before changing Spec content, read the active Spec and the repository sources material to that content.
- Infer the requested outcome and continue until its content contract is satisfied. Do not stop at an intermediate status unless it fulfills that outcome; ask only about consequential choices that available facts cannot resolve.

## Design routing

- Use the Lightweight Design Approach by default.
- Use the Grilling Design Approach when the user explicitly requests grilling or `grill-with-docs`.
- When multiple consequential decisions depend on one another, recommend the Grilling Design Approach and use it only after the user accepts.
- The Grilling Design Approach composes the registered `grilling` and `domain-modeling` skills. Both approaches satisfy the same Designed Contract.

## Section Guide routing

Read the guides for the Spec content involved in the user's requested outcome:

- `overview.md`: Overview content contract and new-Spec creation requirements.
- `design.md`: Design Section and Design Record contracts, including both Design Approaches.
- `plan.md`: Plan and Progress contracts using Spec-local tracer-bullet tickets.
- `implementation.md`: Progress execution and Implementation File contract.
