# Zest Dev Phase: Implement

Canonical workflow for implementing an active change spec.

## When to use
- The plan is ready for coding
- A thin `implement` command routes here

## Workflow
1. Run `zest-dev status` and verify an active change spec exists with status `planned`.
2. Run `zest-dev show active`, read the main spec file, read `design.md`, and read `steps.md`.
3. Read all relevant implementation files before coding.
4. When the implementation work is suitable for test-driven development, try to use the registered `tdd` skill and its red-green-refactor loop; judge applicability from the spec, plan step, and files being changed.
5. Implement the feature following the plan, design, and repository conventions.
6. Write or update tests alongside the implementation, not afterward.
7. Run relevant tests during implementation, fix issues, and continue until the relevant tests pass.
8. After each completed plan step, mark the corresponding `spec.md` → `## Progress` checkbox as `[x]` only when that step is complete and relevant tests pass.
9. Fill `steps.md` with one section per completed Plan step. Each section should briefly combine:
    - what changed
    - how the step was verified
    - any design deviation or follow-up relevant to that step
10. If the full spec is complete, run `zest-dev update active implemented`.
11. If only part of the work is complete, keep the current non-final status and document what was done.

## Rule
Only mark the spec `implemented` when the whole plan is finished.
