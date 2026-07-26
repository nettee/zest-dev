# Zest Dev Section Guide: Implementation

## Implemented Contract

Implemented Status requires:

- every Plan Ticket is complete;
- relevant tests and the Design EAG pass;
- `## Progress` mirrors completion accurately;
- the Implementation File records high-signal outcome, deviations, verification, and retrospective information;
- no current-scope deviation remains unresolved.

## Plan Ticket execution

- Use `spec.md` → `## Progress` to identify the first incomplete ticket, then read that ticket, its dependencies, and the relevant Design contract.
- Read only the Research Findings and repository sources that materially affect current work.
- Implement against the Plan, Design Decisions, and repository conventions.
- Write or update tests with the implementation.
- When test-driven development fits, use the registered `tdd` skill and its red-green-refactor loop.
- Mark the corresponding `spec.md` → `## Progress` checkbox as `[x]` only when the ticket and its relevant tests are complete.
- If required evidence, configuration, credentials, or a consequential Design decision is missing, fail observably instead of guessing or marking partial work successful.

## Implementation File

Use `implementation.md` as the implementation-notes source of truth. Organize it by information value, not Plan-ticket symmetry.

### Outcome

Summarize the final implementation state in one to three concise bullets without repeating the Plan.

### Deviations

Record only material differences between the Spec and implementation reality that create a durable invariant, risk, decision, or attention point. Use:

- Title: the rule or watch point future work must preserve.
- `Current behavior`: the implemented resolution.
- `Deviation`: what the Spec expected differently.
- `Attention`: where future work must take care.
- `Evidence`: representative code, test, or runtime evidence.

Record a material Deviation when it becomes known and preserve it after reconciliation. When implementation completes with none, write `None found.`

Do not add new DFU items during implementation. A newly discovered deferred boundary requires revising the Design and confirming it with the user.

### Verification

Record representative final gates and results, not repetitive per-ticket command history.

### Spec Retrospective

Record at most one or two specific weaknesses in Research Findings, Design Decisions, or the Plan that should improve a future Spec. Write `None.` when there is no useful lesson.
