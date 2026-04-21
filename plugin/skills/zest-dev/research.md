# Zest Dev Phase: Research

Canonical workflow for researching an active change spec.

## When to use
- An active spec exists and the team needs repository facts, patterns, and options
- A thin `research` command routes here

## Workflow
1. Run `zest-dev status` and verify an active change spec exists.
2. Run `zest-dev show active` and read the spec file.
3. If the status is `new`, continue. If later, confirm whether the user wants to refresh research.
4. Clarify missing requirement details if needed.
5. Summarize your understanding of the request and confirm it with the user before deeper exploration when the requirements are still ambiguous.
6. Explore the codebase and locate relevant files.
7. Read the identified files.
8. Fill `## Research` with facts only:
   - Existing System
   - Available Approaches
   - Constraints & Dependencies
   - Key References
9. If the current status is `new`, run `zest-dev update active researched`.
10. If this is a refresh for a later-phase spec, keep the current status and do not downgrade it.
11. Summarize findings and point to the design phase.

## Rule
Document what exists and what is possible, not what should be chosen.
