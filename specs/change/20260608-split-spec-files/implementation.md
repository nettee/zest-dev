# Implementation

## Implementation

- Updated `zest-dev create` to always use built-in templates and create `spec.md`, `design.md`, and `implementation.md`.
- Replaced the main Spec template with a review-oriented entrypoint that preserves workflow section order and links to supporting files.
- Added built-in `design.md` and `implementation.md` templates.
- Removed the repository custom template override at `.zest-dev/template/spec.md`.
- Updated Research, Design, Plan, Implement, and summarize workflow guidance for the split layout.
- Updated Ralph setup to parse top-level `## Progress` from the main Spec file.
- Updated README, glossary language, and integration tests for the new layout and removal of the Notes section name.

## Verification

- Ran `pnpm test:local` successfully.
- Ran `pnpm test:package` successfully.
