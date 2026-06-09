# Zest Dev Phase: Research

Canonical workflow for researching an active change spec.

## When to use
- An active spec exists and the team needs repository facts, patterns, and options

## Workflow
1. Run `zest-dev status` and verify an active change spec exists.
2. Run `zest-dev show active`, read the main spec file, and read `design.md`.
3. If the status is `new`, continue. If later, confirm whether the user wants to refresh research.
4. Clarify missing requirement details if needed.
5. Summarize your understanding of the request and confirm it with the user before deeper exploration when the requirements are still ambiguous.
6. Explore the codebase and locate relevant files.
7. Read the identified files.
8. Fill `design.md` → `## Research` with facts only:
   - Existing System
   - Design Inputs
   - Constraints & Dependencies
   - Key References
   - Every finding must cite its fact source inline or immediately adjacent to it.
   - Valid fact sources include code (`path/to/file:line`), database artifacts (schema/table/migration/query reference), and documentation (doc path, URL, or section).
   - Keep sources compact: cite the smallest useful evidence, usually 1 representative line or short range per finding.
   - Merge same-file citations into ranges or grouped refs: `src/media.ts:770-811,829,855,877-890`.
   - Move long evidence lists to `Key References`; keep inline `Source:` entries short.
   - Do not list competing options, rank alternatives, or recommend a choice; capture existing patterns, reference code, docs, best practices, and implementation considerations as design raw materials.
9. If the current status is `new`, run `zest-dev update active researched`.
10. If this is a refresh for a later-phase spec, keep the current status and do not downgrade it.
11. Summarize findings and point to the design phase.

## Rule
Document what exists and what can inform design, not competing options or what should be chosen.
