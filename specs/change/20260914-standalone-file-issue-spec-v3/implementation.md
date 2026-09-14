# Implementation

<!-- High-signal implementation notes. Focus on material deviations and what future work must preserve; do not mirror every Plan ticket. -->

## Outcome

- Standalone dated Markdown records now dump as explicit V3 representations and load back to their exact filename/content through local or GitHub transport, while directory Specs continue to use V2 and V1/V2 loading remains compatible.
- Archive automation now discovers, preflights, archives, and removes standalone files by exact path, with fail-fast ambiguity and collision handling.
- README and protocol documentation describe supported identifiers and the V1/V2/V3 evolution and compatibility matrix.

## Deviations

None found.

## Verification

- EAG: `cd e2e && env UV_CACHE_DIR=/tmp/zest-dev-uv-cache uv run pytest -q tests/test_issue_dump_load.py -k 'standalone or v2_directory_manifest'` — 6 passed, 6 deselected.
- Local E2E: `env UV_CACHE_DIR=/tmp/zest-dev-uv-cache pnpm test:local` — 30 passed, 1 package-only test skipped.
- Package E2E: `env UV_CACHE_DIR=/tmp/zest-dev-uv-cache pnpm test:package` — 31 passed.
- Archive automation: `node scripts/ci/test-archive-old-specs.js` — passed.
- Diff hygiene: `git diff --check` — passed.

## Spec Retrospective

None.
