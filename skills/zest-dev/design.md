# Zest Dev Phase: Design

Canonical workflow for designing an active change spec.

## When to use
- Research or direct understanding is sufficient to choose an implementation design

## Workflow
1. Run `zest-dev status` and verify an active change spec exists.
2. Run `zest-dev show active`, read the main spec file, and read `design.md`.
3. Check status gating before proceeding:
   - If the status is `new`, suggest research first unless the task is simple and sufficiently understood.
   - If the status is `researched`, continue.
   - If the status is `designed`, `planned`, or `implemented`, confirm that the user wants to revise the existing design before continuing.
4. Identify underspecified areas: scope, edge cases, contracts, compatibility, testing, rollout.
5. Ask the user clarifying questions when needed.
6. Wait for answers before finalizing the architecture when the open questions are consequential.
7. Synthesize one recommended architecture by default, including the matching test strategy.
8. Fill the Design Section:
   - In `spec.md` → `## Design`, write:
     - `### Design Summary`
     - `### E2E Acceptance Gate (EAG)`
   - In `spec.md` → `## Deferred Follow-Ups (DFU)`, write deferred follow-up items as concise bullets, or write `None.` when the Design defers no follow-up work.
   - In `design.md` → `## Design Detail`, write:
     - Design Decisions
     - System Structure, optional
     - Prefer Mermaid for state transition diagrams, sequence diagrams, module diagrams, and other structured visuals; use ASCII only for quick sketches where Mermaid adds no clarity.
     - System Procedure, optional
     - Interfaces / APIs, optional
     - Change Scope
     - Edge Cases
     - Verification Strategy
   - Use Design Summary to describe the overall design approach and rationale.
   - Use Change Scope as a two-part section:
     - Impact Areas: high-level affected modules, database/schema changes, architecture boundaries, API contracts, compatibility constraints, generated artifacts, and rollout impact.
     - Planned File Changes: concrete files or directories expected to change, plus a brief note about each planned modification.
   - Do not add `Source:` citations inside Change Scope items.
   - Put execution sequencing in `## Plan` during the Plan phase.
   - Use DFU only for follow-up work intentionally deferred out of the current Spec and meant to happen after this Spec is complete.
   - Add DFU items only when the user explicitly says they want to handle that work later, or when a clear functional gap is discovered and you confirm with the user before placing it into DFU.
   - Do not add DFU items on your own initiative.
   - Do not put current-Spec implementation work, Documentation Sync work, or Progress items in DFU.
   - List all design decisions.
   - Every design decision must cite its fact source inline or immediately adjacent to it.
   - Reuse sources already captured in `## Research` when possible; gather new factual sources when needed.
   - Valid fact sources include code (`path/to/file:line`), database artifacts (schema/table/migration/query reference), and documentation (doc path, URL, or section).
9. Run `zest-dev update active designed`.
10. Present the design and stop.

## Rule
This is where decisions, trade-offs, and recommendations belong.

### E2E Acceptance Gate (EAG)

The EAG is the Design Section's automated end-to-end acceptance gate, not a general test plan. Use it as a small, preferably single, reviewer-facing handle for judging whether the Spec's validation proves the intended user- or system-visible behavior.

Write both parts:
- Acceptance behavior: the end-to-end behavior that must be true.
- Verification path: the command, workflow, or automated check that proves it.

Do not use unit tests, manual checks, or a broad case list as the EAG. If no automated end-to-end gate exists, state that there is no EAG.
