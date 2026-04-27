# Zest Dev Phase: Design

Canonical workflow for designing an active change spec.

## When to use
- Research or direct understanding is sufficient to form an implementation plan
- A thin `design` command routes here

## Workflow
1. Run `zest-dev status` and verify an active change spec exists.
2. Run `zest-dev show active` and read the spec file.
3. Check status gating before proceeding:
   - If the status is `new`, suggest research first unless the task is simple and sufficiently understood.
   - If the status is `researched`, continue.
   - If the status is `designed` or `implemented`, confirm that the user wants to revise the existing design before continuing.
4. Identify underspecified areas: scope, edge cases, contracts, compatibility, testing, rollout.
5. Ask the user clarifying questions when needed.
6. Wait for answers before finalizing the architecture when the open questions are consequential.
7. Synthesize one recommended architecture by default, including the matching test strategy.
8. Fill `## Design` with:
   - Architecture Overview
   - Prefer Mermaid for state transition diagrams, sequence diagrams, module diagrams, and other structured visuals; use ASCII only for quick sketches where Mermaid adds no clarity.
   - Design Decisions
   - Why this design
   - Implementation Steps
   - Test Strategy
   - Pseudocode
   - File Structure
   - Interfaces / APIs
   - Edge Cases
   - List all design decisions.
   - Every design decision must cite its fact source inline or immediately adjacent to it.
   - Reuse sources already captured in `## Research` when possible; gather new factual sources when needed.
   - Valid fact sources include code (`path/to/file:line`), database artifacts (schema/table/migration/query reference), and documentation (doc path, URL, or section).
9. Fill `## Plan` only when implementation should be split into steps.
   - Use a capability-based step breakdown.
   - Keep the plan compact and step-based.
   - Use markdown checkboxes for every step and substep.
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
   - Prefer steps that each deliver one meaningful increment and remain easy to review.
   - Good step boundaries usually align with one user-visible workflow, one subsystem or integration boundary, one migration or rollout step, or one stabilization milestone.
   - Each step must include small, independent substeps for implementation work and immediate testing/verification.
   - Within each step, list implementation substeps before verification substeps.
   - The final step may focus on overall testing/verification, edge-case validation, regression coverage, and test coverage improvements.
   - A step is complete only when its relevant tests pass.
   - Size each step so a coding agent can implement and validate it within a single session.
   - Write each substep as one small, independent task.
10. Run `zest-dev update active designed`.
11. Present the design and stop.

## Rule
This is where decisions, trade-offs, and recommendations belong.
