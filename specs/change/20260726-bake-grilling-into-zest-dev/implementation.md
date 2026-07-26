# Implementation

<!-- High-signal implementation notes. Focus on material deviations and what future work must preserve; do not mirror every Plan ticket. -->

## Outcome

- New Specs use a four-state lifecycle and a Design Record split into Research Findings and Design Decisions.
- Zest Dev now ships content-oriented Section Guides plus `lightweight` and `grilling` creation commands; the general prompt CLI is removed.
- Ralph remains supported through a dedicated internal task instruction, and deployment cleans superseded managed resources without touching user files.

## Deviations

None found.

## Verification

- `git diff --check` — passed.
- `pnpm test:local` — 22 passed, 1 package-only test skipped.
- `pnpm test:package` — 23 passed.

## Spec Retrospective

None.
