# Zest Dev Phase: Implement

Canonical workflow for implementing an active change spec.

## When to use
- The design is ready and the user approves coding
- A thin `implement` command routes here

## Workflow
1. Run `zest-dev status` and verify an active change spec exists with status `designed`.
2. Run `zest-dev show active` and read the full spec.
3. Read all relevant implementation files before coding.
4. Create a task list.
5. Present the implementation scope and get explicit approval.
6. Implement the feature following the design and repository conventions.
7. Write or update tests alongside the implementation, not afterward.
8. Run relevant tests during implementation, fix issues, and continue until the relevant tests pass.
9. After each completed plan phase, mark the corresponding `## Plan` checkbox as `[x]` only when that phase's implementation and validation are both complete.
10. Fill `## Notes` with brief:
    - `### Implementation`
    - `### Verification`
11. If the full spec is complete, run `zest-dev update active implemented`.
12. If only part of the work is complete, keep the current non-final status and document what was done.

## Rule
Only mark the spec `implemented` when the whole plan is finished.
