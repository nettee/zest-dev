# Zest Dev Phase: Plan

Canonical workflow for planning implementation of an active change spec.

## When to use
- The design is ready to turn into implementation tickets

## Outcome
Turn the approved Design into a compact sequence of ticket-scale implementation slices that an implementer can execute and verify without reconstructing the architecture.

## Success means
- The active spec, current status, main spec, and `design.md` were read.
- Every Plan ticket has a meaningful goal, bounded scope, dependency, and AFK/HITL type.
- Functional work is followed by an EAG Validation ticket, with a final Documentation Sync ticket when the Design is expected to affect project documentation.
- `## Progress` mirrors the Plan ticket titles exactly.
- An eligible `designed` spec advances to `planned`; revised later-phase specs keep their status.

## Status gate
- Run `zest-dev status` and `zest-dev show active` before planning.
- Check the current status:
   - If the status is `new` or `researched`, suggest design first unless the implementation approach is already sufficiently decided.
   - If the status is `designed`, continue.
   - If the status is `planned` or `implemented`, confirm that the user wants to revise the existing plan before continuing.

## Slicing constraints
- Identify implementation tickets using ticket-scale slicing:
   - Use the slicing spirit of Matt Pocock's registered `to-tickets` skill as a reference for scale and sequencing.
   - Do not create GitHub issues or external issue-tracker entries unless the user explicitly asks for that.
   - Treat each Plan ticket as a spec-local tracer-bullet vertical slice.
   - Prefer thin vertical slices that can be implemented independently and verified meaningfully.
   - Avoid splitting only by horizontal layers such as schema, backend, UI, docs, or tests unless that layer is genuinely the whole change.
   - Mark tickets as `HITL` only when continuing requires human decision-making, human-only or dangerous execution, or human validation before the agent can safely proceed.
   - Do not mark a ticket as `HITL` merely because the output is documentation, runbook text, an operator-facing procedure, or a workflow that humans will later execute.
   - Mark tickets as `AFK` when an agent can implement them independently from the written spec and repository context.
   - Capture dependencies between tickets.
- Add a dedicated Plan ticket for EAG Validation:
   - Place it after the functional implementation tickets and before Documentation Sync.
   - The ticket should tell the implementer to validate the completed change against the Design section's EAG.
   - When the Design says there is no EAG, the ticket should explicitly confirm that no dedicated automated end-to-end gate exists and use the best available validation already defined by the Spec.
   - Do not redefine the EAG during planning. Reuse the Design section's acceptance behavior and verification path as written.
- Add a final Plan ticket for Documentation Sync when the Design is expected to change documented behavior, usage, commands, setup, or workflows:
   - The ticket should tell the implementer which documentation areas to re-evaluate after the final code and behavior are visible.
   - When no documentation impact is expected, make EAG Validation the final ticket and state that assumption in its Scope.
   - Do not automatically include glossary or ADR work. Treat those as special documentation updates only when the implemented change genuinely calls for them.

## Required output
Fill `## Plan` with compact structured tickets:
   - Do not use markdown checkboxes in `## Plan`.
   - Put the ticket type directly after the ticket number in every ticket heading: `Ticket 1 (AFK): ...` or `Ticket 2 (HITL): ...`.
   - Prefer tickets that each deliver one meaningful vertical slice and remain easy to review.
   - Good ticket boundaries usually align with one user-visible workflow, one subsystem integration boundary, one migration or rollout ticket, or one stabilization milestone.
   - Each ticket should fit in one focused coding-agent session while remaining large enough to deliver meaningful behavior.
   - Preserve the goal, implementation boundary, validation scope, dependency, and any acceptance detail needed to remove ambiguity; omit repeated Design prose.
   - Include `Goal`, `Scope`, and `Depends on`; the type belongs in the ticket heading, not as a separate field.
   - Use `Depends on: None` when the ticket has no dependency.
   - Add acceptance criteria only when they are necessary to remove ambiguity.
   - Use this field schema:
      ```markdown
      ### Ticket N (AFK|HITL): Title

      Goal: <meaningful outcome>
      Scope: <bounded implementation and validation scope>
      Depends on: <Ticket N or None>
      ```

Add or update `spec.md` → `## Progress` with a thin progress checklist:
   - Add one checkbox per Plan ticket.
   - Keep each checklist item to the ticket title only.
   - Preserve the ticket type marker after the ticket number, matching the Plan heading form: `Ticket N (AFK): ...` or `Ticket N (HITL): ...`.
   - This checklist is for implementation progress tracking, not for describing the plan.
   - Do not include Deferred Follow-Ups (DFU), because DFU is outside the current Spec's Plan.
   - Mirror the Plan titles exactly:
      ```markdown
      ## Progress

      - [ ] Ticket N (AFK|HITL): Title
      ```

## Status update
- Update status based on the starting state:
   - If the spec started as `designed`, run `zest-dev update active planned`.
   - If the spec started as `planned`, skip the update and keep the status as-is.
   - If the spec started as `implemented`, skip the update and keep the status as-is while revising the plan.
## Stop or block
- Ask only questions whose answers materially change ticket scope, dependencies, acceptance, or AFK/HITL classification.
- If such a question remains unanswered, stop and name the blocked Plan decision.
- Otherwise present the plan and stop:
   - Report every Plan ticket's `Type` as `AFK` or `HITL`.
   - For each `HITL` ticket, tell the user what needs to be discussed, reviewed, judged, or approved in conversation before implementation continues.
   - If all tickets are `AFK`, say that no user action is required before implementation.
