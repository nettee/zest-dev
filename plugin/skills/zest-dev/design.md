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
7. Synthesize one recommended architecture by default.
8. Fill `## Design` with:
   - Architecture Overview
   - Why this design
   - Implementation Steps
   - Pseudocode
   - File Structure
   - Interfaces / APIs
   - Edge Cases
9. Fill `## Plan` only when implementation should be split into 2-3 coarse phases.
10. Run `zest-dev update active designed`.
11. Present the design and stop for implementation approval.

## Rule
This is where decisions, trade-offs, and recommendations belong.
