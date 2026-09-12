# Implementation

## Outcome

- `dump` now emits one V2 directory-manifest representation for normal and Markdown-only Spec directories; `load` validates V2 completeness and remains compatible with V1 archives.
- Local/file and GitHub transports preserve nested paths, empty files, and exact UTF-8 content without creating a synthetic `spec.md`.

## Deviations

### Strict UTF-8 validation at the dump boundary

Current behavior: Dump rejects a Markdown file whose bytes cannot round-trip through UTF-8 decoding.

Deviation: The initial Design required exact content and non-preservable-input failures but did not explicitly identify Node's replacement-character decoding risk. Final review made the encoding boundary explicit in the Design and protocol documentation.

Attention: Future file-reading refactors must preserve strict validation rather than returning a successfully corrupted representation.

Evidence: `lib/spec-manager.js` `readMarkdownFile`; `e2e/tests/test_issue_dump_load.py` invalid UTF-8 assertion.

## Verification

- EAG: `cd e2e && env UV_CACHE_DIR=/tmp/zest-dev-uv-cache uv run pytest -q tests/test_issue_dump_load.py -k 'v2_directory_manifest'` — 2 passed.
- Local E2E: `env UV_CACHE_DIR=/tmp/zest-dev-uv-cache pnpm test:local` — 26 passed, 1 package-only test skipped.
- Package E2E: `env UV_CACHE_DIR=/tmp/zest-dev-uv-cache pnpm test:package` — 27 passed.
- Static checks: `git diff --check` and `node --check lib/spec-manager.js` passed.

## Spec Retrospective

The Design should have named the UTF-8 decoding boundary when it first translated “exact content” into failure behavior; final review supplied that missing constraint before completion.
