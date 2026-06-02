# Zest Dev Phase: Plan

Canonical workflow for planning implementation of an active change spec.

## When to use
- The design is ready to turn into an implementation checklist
- A thin `plan` command routes here

## Workflow
1. Run `zest-dev status` and verify an active change spec exists.
2. Run `zest-dev show active` and read the spec file.
3. Check status before proceeding:
   - If the status is `new` or `researched`, suggest design first unless the implementation approach is already sufficiently decided.
   - If the status is `designed`, continue.
   - If the status is `planned` or `implemented`, confirm that the user wants to revise the existing plan before continuing.
4. Identify implementation increments, immediate verification points, edge-case validation, and any dependencies between steps.
5. Ask the user clarifying questions when needed.
6. Wait for answers before finalizing the plan when the open questions are consequential.
7. Fill `## Plan` with a compact capability-based checklist:
   - Use markdown checkboxes for every step and substep.
   - Prefer steps that each deliver one meaningful increment and remain easy to review.
   - Good step boundaries usually align with one user-visible workflow, one subsystem or integration boundary, one migration or rollout step, or one stabilization milestone.
   - Each step must include small, independent substeps for implementation work and immediate testing/verification.
   - Within each step, list implementation substeps before verification substeps.
   - The final step may focus on overall testing/verification, edge-case validation, regression coverage, and test coverage improvements.
   - A step is complete only when its relevant tests pass.
   - Size each step so a coding agent can implement and validate it within a single session.
   - Write each substep as one small, independent task.
   - Format as a short checklist, for example:
      - [ ] Step 1: Foo
        - [ ] Substep 1.1 Implement: Foo foundation
        - [ ] Substep 1.2 Implement: Foo integration
        - [ ] Substep 1.3 Implement: Foo edge handling
        - [ ] Substep 1.4 Verify: Foo automated coverage
        - [ ] Substep 1.5 Verify: Foo manual workflow
      - [ ] Step 2: Bar
        - [ ] Substep 2.1 Implement: Bar
        - [ ] Substep 2.2 Verify: Bar
      - [ ] Step 3: Baz
        - [ ] Substep 3.1 Implement: Baz
        - [ ] Substep 3.2 Verify: Baz
8. Update status based on the starting state:
   - If the spec started as `designed`, run `zest-dev update active planned`.
   - If the spec started as `planned`, skip the update and keep the status as-is.
   - If the spec started as `implemented`, skip the update and keep the status as-is while revising the plan.
9. Present the plan and stop.

## Rule
This is where implementation sequencing and verification checkpoints belong.
