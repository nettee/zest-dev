# Zest Dev Phase: Plan

Canonical workflow for planning implementation of an active change spec.

## When to use
- The design is ready to turn into implementation steps

## Outcome
Turn the approved Design into a compact sequence of issue-scale implementation slices that an implementer can execute and verify without reconstructing the architecture.

## Success means
- The active spec, current status, main spec, and `design.md` were read.
- Every Plan step has a meaningful goal, bounded scope, dependency, and AFK/HITL type.
- Functional work is followed by EAG Validation, with a final Documentation Sync step when the Design is expected to affect project documentation.
- `## Progress` mirrors the Plan step titles exactly.
- An eligible `designed` spec advances to `planned`; revised later-phase specs keep their status.

## Status gate
- Run `zest-dev status` and `zest-dev show active` before planning.
- Check the current status:
   - If the status is `new` or `researched`, suggest design first unless the implementation approach is already sufficiently decided.
   - If the status is `designed`, continue.
   - If the status is `planned` or `implemented`, confirm that the user wants to revise the existing plan before continuing.

## Slicing constraints
- Identify implementation steps using issue-scale slicing:
   - Use the slicing spirit of Matt Pocock's registered `to-issues` skill as a reference for scale and sequencing.
   - Do not create GitHub issues or external issue-tracker entries unless the user explicitly asks for that.
   - Treat each Plan step as the spec-local counterpart to an issue-sized vertical slice.
   - Prefer thin vertical slices that can be implemented independently and verified meaningfully.
   - Avoid splitting only by horizontal layers such as schema, backend, UI, docs, or tests unless that layer is genuinely the whole change.
   - Mark steps as `HITL` only when continuing requires human decision-making, human-only or dangerous execution, or human validation before the agent can safely proceed.
   - Do not mark a step as `HITL` merely because the output is documentation, runbook text, an operator-facing procedure, or a workflow that humans will later execute.
   - Mark steps as `AFK` when an agent can implement them independently from the written spec and repository context.
   - Capture dependencies between steps.
- Add a dedicated Plan step for EAG Validation:
   - Place it after the functional implementation steps and before Documentation Sync.
   - The step should tell the implementer to validate the completed change against the Design section's EAG.
   - When the Design says there is no EAG, the step should explicitly confirm that no dedicated automated end-to-end gate exists and use the best available validation already defined by the Spec.
   - Do not redefine the EAG during planning. Reuse the Design section's acceptance behavior and verification path as written.
- Add a final Plan step for Documentation Sync when the Design is expected to change documented behavior, usage, commands, setup, or workflows:
   - The step should tell the implementer which documentation areas to re-evaluate after the final code and behavior are visible.
   - When no documentation impact is expected, make EAG Validation the final step and state that assumption in its Scope.
   - Do not automatically include glossary or ADR work. Treat those as special documentation updates only when the implemented change genuinely calls for them.

## Required output
Fill `## Plan` with compact structured steps:
   - Do not use markdown checkboxes in `## Plan`.
   - Put the step type directly after the step number in every step heading: `Step 1 (AFK): ...` or `Step 2 (HITL): ...`.
   - Prefer steps that each deliver one meaningful vertical slice and remain easy to review.
   - Good step boundaries usually align with one user-visible workflow, one subsystem integration boundary, one migration or rollout step, or one stabilization milestone.
   - Each step should be issue-scale: large enough to matter, small enough for a coding agent to implement and validate in one focused session.
   - Preserve the goal, implementation boundary, validation scope, dependency, and any acceptance detail needed to remove ambiguity; omit repeated Design prose.
   - Include `Goal`, `Scope`, and `Depends on`; the type belongs in the step heading, not as a separate field.
   - Use `Depends on: None` when the step has no dependency.
   - Add acceptance criteria only when they are necessary to remove ambiguity.
   - Use this field schema:
      ```markdown
      ### Step N (AFK|HITL): Title

      Goal: <meaningful outcome>
      Scope: <bounded implementation and validation scope>
      Depends on: <Step N or None>
      ```

Add or update `spec.md` → `## Progress` with a thin progress checklist:
   - Add one checkbox per Plan step.
   - Keep each checklist item to the step title only.
   - Preserve the step type marker after the step number, matching the Plan heading form: `Step N (AFK): ...` or `Step N (HITL): ...`.
   - This checklist is for implementation progress tracking, not for describing the plan.
   - Do not include Deferred Follow-Ups (DFU), because DFU is outside the current Spec's Plan.
   - Mirror the Plan titles exactly:
      ```markdown
      ## Progress

      - [ ] Step N (AFK|HITL): Title
      ```

## Status update
- Update status based on the starting state:
   - If the spec started as `designed`, run `zest-dev update active planned`.
   - If the spec started as `planned`, skip the update and keep the status as-is.
   - If the spec started as `implemented`, skip the update and keep the status as-is while revising the plan.
## Stop or block
- Ask only questions whose answers materially change step scope, dependencies, acceptance, or AFK/HITL classification.
- If such a question remains unanswered, stop and name the blocked Plan decision.
- Otherwise present the plan and stop:
   - Report every Plan step's `Type` as `AFK` or `HITL`.
   - For each `HITL` step, tell the user what needs to be discussed, reviewed, judged, or approved in conversation before implementation continues.
   - If all steps are `AFK`, say that no user action is required before implementation.
