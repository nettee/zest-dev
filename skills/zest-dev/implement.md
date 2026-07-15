# Zest Dev Phase: Implement

Canonical workflow for implementing an active change spec.

## When to use
- The plan is ready for coding

## Outcome
Complete the planned change in repository code, keep implementation state observable, and finish only when the Design's behavior and relevant validation pass.

## Success means
- The active spec has status `planned`, and `## Progress` identifies the current incomplete Plan step.
- The current Plan step, its dependencies, the relevant Design contract, and relevant implementation files were read.
- Each completed Plan step is implemented with its relevant tests passing.
- `## Progress` reports completion state, while `steps.md` records completed-step outcomes, verification, and downstream impact.
- The spec advances to `implemented` only when every Plan step is complete.

## Constraints
- Use `spec.md` → `## Progress` to find the first incomplete step, then read that Plan step and its dependencies before coding.
- Read the Design sections, Research evidence, and repository files that materially affect the current step; do not reload unrelated background by default.
- Treat `steps.md` as a selective implementation journal, not required full-context input:
    - Scan its step headings and `Downstream impact` entries to locate relevant history.
    - Read a completed step section when the current step depends on it or when it records a deviation, invariant, interface, migration state, or other downstream impact relevant to the current work.
    - For legacy entries without `Downstream impact`, read the completed section when the current Plan step depends on it.
- Implement the feature following the Plan, Design, and repository conventions.
- Write or update tests alongside the implementation.
- When test-driven development fits the behavior and files being changed, use the registered `tdd` skill and its red-green-refactor loop.
- After each completed Plan step, mark the corresponding `spec.md` → `## Progress` checkbox as `[x]` only when that step is complete and relevant tests pass; preserve the `Step N (AFK): ...` or `Step N (HITL): ...` title format.
- Append or update one `steps.md` section per completed Plan step using:
    - `Changed`: the implemented outcome, without restating Goal or Scope.
    - `Verified`: the relevant command or check and its result.
    - `Downstream impact`: a concise invariant, deviation, interface, migration state, or dependency that later steps must preserve; write `None.` when there is no downstream impact.
- Do not add new Deferred Follow-Ups (DFU) during implementation. DFU is fixed during the Design Phase; if implementation reveals missing deferred work that changes the Design boundary, revise the Design and confirm the DFU with the user instead of silently appending it.

## Stop or block
- Run the most relevant tests and checks during implementation. Fix failures caused by the change before marking a step complete.
- If required evidence, configuration, credentials, or a consequential Design decision is missing, stop and report the blocker instead of guessing or marking partial work successful.
- If only part of the Plan is complete, keep the current non-final status and document what was done.
- When the full Plan is complete and relevant validation passes, run `zest-dev update active implemented`.

## Rule
Only mark the spec `implemented` when the whole plan is finished.
