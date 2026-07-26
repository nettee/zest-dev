# Zest Dev Phase: Implement

Canonical workflow for implementing an active change spec.

## When to use
- The plan is ready for coding

## Outcome
Complete the planned change in repository code, keep implementation state observable, and finish only when the Design's behavior and relevant validation pass.

## Success means
- The active spec has status `planned`, and `## Progress` identifies the current incomplete Plan ticket.
- The current Plan ticket, its dependencies, the relevant Design contract, and relevant implementation files were read.
- Each completed Plan ticket is implemented with its relevant tests passing.
- `## Progress` reports Plan-ticket completion, while `implementation.md` makes material deviations, durable attention points, representative verification, and the Spec's main retrospective lessons easy to find.
- The spec advances to `implemented` only when every Plan ticket is complete.

## Constraints
- Use `spec.md` → `## Progress` to find the first incomplete ticket, then read that Plan ticket and its dependencies before coding.
- Read the Design sections, Research evidence, and repository files that materially affect the current ticket; do not reload unrelated background by default.
- Use `implementation.md` as the implementation-notes source of truth. For a legacy Spec that has `steps.md` but no `implementation.md`, keep using `steps.md`; do not create a competing implementation-notes file.
- Read implementation notes selectively: scan Deviation headings and their `Attention` fields first, then read the supporting entry when the current work touches that invariant, boundary, risk, or unresolved decision.
- Implement the feature following the Plan, Design, and repository conventions.
- Write or update tests alongside the implementation.
- When test-driven development fits the behavior and files being changed, use the registered `tdd` skill and its red-green-refactor loop.
- After each completed Plan ticket, mark the corresponding `spec.md` → `## Progress` checkbox as `[x]` only when that ticket is complete and relevant tests pass; preserve the `Ticket N (AFK): ...` or `Ticket N (HITL): ...` title format.
- Keep `implementation.md` organized by information value, not by Plan-ticket symmetry. Use these sections:
    - `Outcome`: summarize the final implementation state in one to three concise bullets; do not repeat the Plan.
    - `Deviations`: record only material differences between the Spec and implementation reality that create a durable invariant, risk, decision, or future attention point. Keep resolved deviations because they remain evidence about the implemented boundary. When implementation is complete and none were found, write `None found.`
    - `Verification`: record the representative final gates and results that establish the implemented behavior; omit repetitive per-ticket command history.
    - `Spec Retrospective`: name at most one or two specific Research, Design, or Plan weaknesses that should improve a future Spec. Do not repeat every Deviation or write generic advice; write `None.` when there is no useful lesson.
- Write each material Deviation so a future reader can understand the attention point without reconstructing the implementation session:
    - Title: state the rule, invariant, or watch point future work must preserve, not merely the historical surprise.
    - `Current behavior`: state the implemented resolution.
    - `Deviation`: identify what the Spec expected differently.
    - `Attention`: state where later implementation, maintenance, rollout, or product judgment must take care.
    - `Evidence`: cite the relevant code, test, runtime result, or other concrete evidence.
- Record a material Deviation when it becomes known, even before the current Plan ticket is complete. Recording it does not mark the ticket complete.
- Omit incidental debugging, mechanical edits, and implementation details that neither contradict the Spec nor create a durable attention point.
- Before final validation, reconcile all material Deviations with the Design, Plan, and EAG. Do not erase the Deviation after updating the Spec; preserve it as implementation evidence.
- Do not add new Deferred Follow-Ups (DFU) during implementation. DFU is fixed during the Design Phase; if implementation reveals missing deferred work that changes the Design boundary, revise the Design and confirm the DFU with the user instead of silently appending it.

## Stop or block
- Run the most relevant tests and checks during implementation. Fix failures caused by the change before marking a ticket complete.
- If required evidence, configuration, credentials, or a consequential Design decision is missing, record the attention point, stop, and report the blocker instead of guessing or marking partial work successful.
- If only part of the Plan is complete, keep the current non-final status and document what was done.
- When the full Plan is complete, relevant validation passes, and no current-scope Deviation remains unresolved, run `zest-dev update active implemented`.

## Rule
Only mark the spec `implemented` when the whole plan is finished.
