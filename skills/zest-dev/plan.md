# Zest Dev Phase: Plan

Canonical workflow for planning implementation of an active change spec.

## When to use
- The design is ready to turn into implementation steps

## Workflow
1. Run `zest-dev status` and verify an active change spec exists.
2. Run `zest-dev show active` and read the main spec file and `design.md`.
3. Check status before proceeding:
   - If the status is `new` or `researched`, suggest design first unless the implementation approach is already sufficiently decided.
   - If the status is `designed`, continue.
   - If the status is `planned` or `implemented`, confirm that the user wants to revise the existing plan before continuing.
4. Identify implementation steps using issue-scale slicing:
   - Use the slicing spirit of Matt Pocock's registered `to-issues` skill as a reference for scale and sequencing.
   - Do not create GitHub issues or external issue-tracker entries unless the user explicitly asks for that.
   - Treat each Plan step as the spec-local counterpart to an issue-sized vertical slice.
   - Prefer thin vertical slices that can be implemented independently and verified meaningfully.
   - Avoid splitting only by horizontal layers such as schema, backend, UI, docs, or tests unless that layer is genuinely the whole change.
   - Mark steps as `HITL` only when continuing requires human decision-making, human-only or dangerous execution, or human validation before the agent can safely proceed.
   - Do not mark a step as `HITL` merely because the output is documentation, runbook text, an operator-facing procedure, or a workflow that humans will later execute.
   - Mark steps as `AFK` when an agent can implement them independently from the written spec and repository context.
   - Capture dependencies between steps.
5. Add a dedicated Plan step for EAG Validation:
   - Place it after the functional implementation steps and before Documentation Sync.
   - The step should tell the implementer to validate the completed change against the Design section's EAG.
   - When the Design says there is no EAG, the step should explicitly confirm that no dedicated automated end-to-end gate exists and use the best available validation already defined by the Spec.
   - Do not redefine the EAG during planning. Reuse the Design section's acceptance behavior and verification path as written.
6. Add a final Plan step for Documentation Sync:
   - Always include this as the final Plan step.
   - The step should tell the implementer to update relevant project documentation if the implemented change makes that necessary.
   - Do not decide during planning whether documentation must change. Leave that check to implementation, when the final code and behavior are visible.
   - Do not automatically include glossary or ADR work. Treat those as special documentation updates only when the implemented change genuinely calls for them.
7. Ask the user clarifying questions when needed.
8. Wait for answers before finalizing the plan when the open questions are consequential.
9. Fill `## Plan` with compact structured steps:
   - Do not use markdown checkboxes in `## Plan`.
   - Put the step type directly after the step number in every step heading: `Step 1 (AFK): ...` or `Step 2 (HITL): ...`.
   - Prefer steps that each deliver one meaningful vertical slice and remain easy to review.
   - Good step boundaries usually align with one user-visible workflow, one subsystem integration boundary, one migration or rollout step, or one stabilization milestone.
   - Each step should be issue-scale: large enough to matter, small enough for a coding agent to implement and validate in one focused session.
   - Keep fields brief. Do not turn each step into a second design document.
   - Include `Goal`, `Scope`, and `Depends on`; the type belongs in the step heading, not as a separate field.
   - Use `Depends on: None` when the step has no dependency.
   - Add acceptance criteria only when they are necessary to remove ambiguity.
   - Format as structured prose, for example:
      ```markdown
      ### Step 1 (AFK): Foo

      Goal: Deliver the smallest useful end-to-end Foo behavior.
      Scope: Update the Foo command path and its integration tests.
      Depends on: None

      ### Step 2 (HITL): Bar

      Goal: Choose and apply the Bar user-facing behavior.
      Scope: Confirm the behavior with the user, then update Bar prompts and docs.
      Depends on: Step 1

      ### Step 3 (AFK): EAG Validation

      Goal: Validate the completed change against the Spec's EAG before wrap-up work.
      Scope: Run the automated end-to-end verification path defined in the Design section, or confirm that the Design explicitly says there is no EAG and use the best available Spec-defined validation.
      Depends on: Step 2

      ### Step 4 (AFK): Documentation Sync

      Goal: Keep project documentation aligned with the implemented behavior.
      Scope: If the implementation changes documented behavior, usage, commands, setup, or workflows, update the relevant project docs.
      Depends on: Step 3
      ```
10. Add or update `spec.md` → `## Progress` with a thin progress checklist:
   - Add one checkbox per Plan step.
   - Keep each checklist item to the step title only.
   - Preserve the step type marker after the step number, matching the Plan heading form: `Step N (AFK): ...` or `Step N (HITL): ...`.
   - This checklist is for implementation progress tracking, not for describing the plan.
   - Do not include Deferred Follow-Ups (DFU), because DFU is outside the current Spec's Plan.
   - Format:
      ```markdown
      ## Progress

      - [ ] Step 1 (AFK): Foo
      - [ ] Step 2 (HITL): Bar
      ```
11. Update status based on the starting state:
   - If the spec started as `designed`, run `zest-dev update active planned`.
   - If the spec started as `planned`, skip the update and keep the status as-is.
   - If the spec started as `implemented`, skip the update and keep the status as-is while revising the plan.
12. Present the plan and stop:
   - Report every Plan step's `Type` as `AFK` or `HITL`.
   - For each `HITL` step, tell the user what needs to be discussed, reviewed, judged, or approved in conversation before implementation continues.
   - If all steps are `AFK`, say that no user action is required before implementation.

## Rule
This is where Design becomes issue-scale spec-local implementation steps. Do not publish issues unless the user explicitly asks for that.
