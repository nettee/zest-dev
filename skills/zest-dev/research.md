# Zest Dev Phase: Research

Canonical workflow for researching an active change spec.

## When to use
- An active spec exists and the team needs repository facts, patterns, and options

## Outcome
Produce a concise, source-backed account of the existing system and the constraints that materially inform Design, without choosing an architecture.

## Success means
- An active spec and its current status were verified with `zest-dev status` and `zest-dev show active`.
- The main spec, `design.md`, and relevant repository sources were read.
- `design.md` → `## Research` contains enough evidence for Design to proceed and makes material evidence gaps visible.
- A `new` spec advances to `researched`; a later-phase research refresh keeps its existing status.

## Required output
Fill `design.md` → `## Research` with facts only:
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

## Constraints
- Clarify missing requirement details only when they materially affect what must be researched.
- When the request is still ambiguous, summarize the current understanding and confirm it before deep exploration.
- If the current status is later than `new`, confirm that the user wants to refresh Research before changing it.
- Keep Research factual; leave choices and recommendations to Design.

## Stop or block
- Stop when the Design inputs have representative evidence and any material gaps or conflicts are recorded.
- If a required repository source cannot be found or read, report the missing evidence instead of filling the gap by assumption.
- After writing Research, update an eligible `new` spec to `researched`, summarize the findings, and point to Design without starting it.

## Rule
Document what exists and what can inform design, not competing options or what should be chosen.
