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
9. Fill `## Plan` only when implementation should be split into phases.
   - Use a capability-based phase breakdown.
   - Prefer phases that each deliver one meaningful increment and remain easy to review.
   - Good phase boundaries usually align with one user-visible workflow, one subsystem or integration boundary, one migration or rollout step, or one stabilization milestone.
   - Each implementation phase must include both implementation work and its own immediate testing/verification.
   - The final phase may focus on overall testing/verification, edge-case validation, regression coverage, and test coverage improvements.
   - A phase is complete only when its relevant tests pass.
   - Size each phase so a coding agent can implement and validate it within a single session.
   - Write each phase so its wording clearly states the implementation content and the verification approach.
10. Run `zest-dev update active designed`.
11. Present the design and stop for implementation approval.

## Rule
This is where decisions, trade-offs, and recommendations belong.
