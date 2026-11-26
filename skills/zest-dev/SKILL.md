---
name: zest-dev
description: Create and advance Zest Dev Specs through overview, requirements, design, planning, and implementation.
---

# Zest Dev

Zest Dev is a lightweight, human-interactive workflow for spec-driven development. Specs progress through `new → designed → planned → implemented`.

There is one skill and the `zest-dev` CLI. Do not look for editor command entrypoints or Design Approach routes.

## Invariants

- Use the user's language for conversation and prose artifacts while preserving code, commands, quotations, and established terminology.
- Use the `zest-dev` CLI to create, activate, and update Specs. Never create Spec files or edit frontmatter manually.
- Statuses describe content maturity. After completing a Section Guide's contract, immediately run `zest-dev update active designed|planned|implemented` as appropriate.
- Treat Specs with unsupported statuses or content structures as invalid input; do not migrate or reinterpret them.
- Keep the Spec focused on requirement semantics and scope. Keep Design short. Keep implementation notes minimal. Always leave text verification proof when checks were run.
- Before changing Spec content, read the active Spec and the repository sources material to that content.
- Infer the requested outcome and continue until it is satisfied. Make reasonable reversible assumptions when they keep work moving, and state them. Ask only about consequential choices, blockers, or irreversible actions.

## Section Guide routing

Read the guides for the Spec content involved in the user's requested outcome:

- `overview.md`: Overview and Requirements contracts, plus new-Spec creation.
- `design.md`: short Design contract.
- `plan.md`: Plan and Progress contracts.
- `implementation.md`: execution and Implementation File contract.
