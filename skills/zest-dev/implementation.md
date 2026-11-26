# Zest Dev Section Guide: Implementation

## Implemented Contract

Implemented Status requires:

- every Plan slice is complete;
- relevant tests pass, including an end-to-end check when user- or system-visible behavior changed;
- `## Progress` mirrors completion accurately;
- `implementation.md` → `## Verification` records text proof of the checks that were run;
- no current-scope deviation remains unresolved when one was material enough to record.

## Plan execution

- Use `spec.md` → `## Progress` to find the next incomplete slice, then read that Plan item plus the Overview, Requirements, and Design.
- Implement against the Spec and repository conventions.
- Run tests relevant to changed behavior. When visible behavior changed, prefer an end-to-end check that reuses existing project commands or suites; do not invent Spec-local acceptance harnesses or one-off e2e scripts unless the user requests a reusable capability.
- Mark Progress complete only when the slice and its relevant tests are done.
- If required evidence, configuration, credentials, or a consequential Design decision is missing, fail observably instead of guessing.

## Implementation File

Keep `implementation.md` minimal.

- Add brief notes only when they carry durable signal.
- Always fill `## Verification` with text proof after final checks: commands or suites run and their outcomes. No screenshots or images.
- Do not maintain ceremonial Outcome / Deviation / Retrospective sections unless the user asks for that detail.
