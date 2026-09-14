# Design Record

## Research Findings

- Issue #151 requires lossless local and remote dump/load for `specs/change/YYYYMMDD-slug.md`, exact filename/content preservation, explicit directory/file protocol distinction, and visible failure for ambiguity, collisions, corruption, or data-loss risk. Source: https://github.com/nettee/zest-dev/issues/151.
- Spec discovery accepts only dated directories; general identifier normalization preserves `.md` for standalone paths, so both an explicit file path and its extensionless ID fail lookup. Source: `lib/spec-manager.js:37-46,163-181` and reproduced public CLI behavior.
- V2 serialization walks `specs/change/<spec-id>` as a directory, while loading always creates that directory and writes manifested relative files beneath it. Source: `lib/spec-manager.js:328-367,409-537`.
- V1 requires `spec.md`; V2 adds a complete directory manifest and supports directories without `spec.md`. Existing focused E2E coverage passes. Source: `docs/issue-spec-representation.md`; `e2e/tests/test_issue_dump_load.py`.
- Archive candidate discovery filters for directories and later removes `specs/change/<spec-id>`, so standalone files are invisible to automation. Source: `scripts/ci/archive-old-specs.js:41-57,127-149`.
- Inference: changing global Spec discovery would expose standalone historical records to lifecycle commands that require directory structure. A dump-specific source resolver keeps this compatibility boundary narrow.

## Design Decisions

- Directory dump remains V2 and V1/V2 load behavior remains unchanged. Standalone dump emits V3, and V3 is accepted only as a tagged standalone representation. Rationale: this is the smallest protocol extension and avoids reinterpreting existing directory archives. Premises: V1/V2 are already documented directory protocols and issue #151 requires preserving V2 behavior.
- A V3 issue body includes `zest-dev-issue-spec: 3`, `kind: standalone-file`, `spec-id`, exact `filename`, and the file content; protocol comments are not allowed. Rationale: a single body is complete and human-readable, while required shape metadata prevents load-time guessing.
- Dump source resolution accepts an explicit path/filename or a bare dated ID. A bare ID resolves only when exactly one of `<id>/` and `<id>.md` exists; both or neither fail. Explicit sources must be direct children of `specs/change`, match the dated filename/ID grammar, and have the expected filesystem type. Rationale: path inputs can disambiguate deliberate access, while bare IDs cannot silently choose one source.
- Parsing produces either directory files or one standalone target. V3 validates exact allowed metadata, matching `filename === <spec-id>.md`, absence of protocol comments, valid UTF-8, and non-conflicting target paths before writing through a temporary-file rename boundary. Both the target file and same-ID directory, including dangling symlink entries, are collisions. Rationale: issue #151 prioritizes losslessness and visible failure.
- Archive automation models candidates with logical ID, kind, and exact path. It includes dated directories and dated `.md` files, orders/limits by logical ID, rejects duplicate IDs before preflight, dumps explicit standalone paths, and removes only the resolved source after confirmed archival. Rationale: CLI support alone does not make directory-only automation complete.
- Local and fake-GitHub paths share the same representation builder/parser. Public-CLI E2E tests cover byte-for-byte content, explicit and bare identifiers, remote transport, corrupt V3 input, collisions, invalid UTF-8, and V1/V2 regression behavior; archive script tests cover discovery, ambiguity, and exact deletion.
- Planned file changes: `lib/spec-manager.js` for source/protocol/write dispatch; `e2e/tests/test_issue_dump_load.py` for CLI behavior; `scripts/ci/archive-old-specs.js` and its test for automation; `docs/issue-spec-representation.md` and `README.md` for protocol and compatibility documentation.
