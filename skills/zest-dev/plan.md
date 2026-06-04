# Zest Dev Phase: Plan

Canonical workflow for planning implementation of an active change spec.

## When to use
- The design is ready to turn into implementation steps
- A thin `plan` command routes here

## Workflow
1. Run `zest-dev status` and verify an active change spec exists.
2. Run `zest-dev show active` and read the spec file.
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
5. Ask the user clarifying questions when needed.
6. Wait for answers before finalizing the plan when the open questions are consequential.
7. Fill `## Plan` with compact structured steps:
   - Do not use markdown checkboxes in `## Plan`.
   - Keep the step label as `Step 1`, `Step 2`, and so on.
   - Prefer steps that each deliver one meaningful vertical slice and remain easy to review.
   - Good step boundaries usually align with one user-visible workflow, one subsystem integration boundary, one migration or rollout step, or one stabilization milestone.
   - Each step should be issue-scale: large enough to matter, small enough for a coding agent to implement and validate in one focused session.
   - Keep fields brief. Do not turn each step into a second design document.
   - Include `Type`, `Goal`, `Scope`, and `Depends on`.
   - Use `Depends on: None` when the step has no dependency.
   - Add acceptance criteria only when they are necessary to remove ambiguity.
   - Format as structured prose, for example:
      ```markdown
      ### Step 1: Foo

      Type: AFK
      Goal: Deliver the smallest useful end-to-end Foo behavior.
      Scope: Update the Foo command path and its integration tests.
      Depends on: None

      ### Step 2: Bar

      Type: HITL
      Goal: Choose and apply the Bar user-facing behavior.
      Scope: Confirm the behavior with the user, then update Bar prompts and docs.
      Depends on: Step 1
      ```
8. Add or update `## Notes` with a thin progress checklist:
   - Use the heading `### Progress`.
   - Add one checkbox per Plan step.
   - Keep each checklist item to the step title only.
   - This checklist is for implementation progress tracking, not for describing the plan.
   - Format:
      ```markdown
      ### Progress

      - [ ] Step 1: Foo
      - [ ] Step 2: Bar
      ```
9. Update status based on the starting state:
   - If the spec started as `designed`, run `zest-dev update active planned`.
   - If the spec started as `planned`, skip the update and keep the status as-is.
   - If the spec started as `implemented`, skip the update and keep the status as-is while revising the plan.
10. Present the plan and stop:
   - Report every Plan step's `Type` as `AFK` or `HITL`.
   - For each `HITL` step, tell the user what needs to be discussed, reviewed, judged, or approved in conversation before implementation continues.
   - If all steps are `AFK`, say that no user action is required before implementation.

## Rule
This is where Design becomes issue-scale spec-local implementation steps. Do not publish issues unless the user explicitly asks for that.
