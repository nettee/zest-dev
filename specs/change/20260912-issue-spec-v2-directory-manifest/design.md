# Design Record

## Research Findings

### Existing System

- Issue Spec Representation V1 defines the issue body as `spec.md`, supporting files as comments, and rejects a missing Main Spec File. Source: `docs/issue-spec-representation.md:17-79,98-130`.
- `specToIssueRepresentation` checks for `spec.md` before walking the directory and always renders that file into the body. Source: `lib/spec-manager.js:292-328`.
- `issueRepresentationToFiles` requires the body path to equal `spec.md`, rejects empty body content, then reconstructs supporting files from protocol comments. Source: `lib/spec-manager.js:331-375`.
- Local and GitHub modes share the same core conversion functions; the GitHub adapter transports opaque body/comment strings and does not interpret file roles. Source: `lib/spec-manager.js:509-574`.
- Directory writes already use a temporary directory followed by rename, preventing a validation or write failure from exposing a partially loaded target. Source: `lib/spec-manager.js:378-412`.
- Directory walking collects nested `.md` files, ignores ordinary non-Markdown files, and rejects unsupported entry types such as symlinks. Source: `lib/spec-manager.js:212-229`; `e2e/tests/test_issue_dump_load.py:71-81`.

### Design Inputs

- Issue #148 requires lossless dump/load for historical Markdown-only directories without inventing `spec.md`, in dry-run and remote GitHub modes, while preserving normal directories and visible failures. Source: https://github.com/nettee/zest-dev/issues/148.
- All future dumps should use V2 rather than conditionally emitting V1; V1 is retained only for loading existing archives. Source: user decision in this Spec session, 2026-09-12.
- A Spec directory no longer needs `spec.md` to be dumpable, but the represented scope remains its Markdown file set. Source: user decision in this Spec session, 2026-09-12.

### Constraints And Evidence Gaps

- Repository error-handling rules prohibit placeholder Main Spec Files, partial success, or hidden recovery from malformed protocol data. Source: `AGENTS.md`, Error Handling / Fast Fail.
- Existing E2E tests exercise the public CLI and are reused by both local and packed-package runners. Source: `e2e/tests/conftest.py:15-55`; `package.json:31-38`.
- The current protocol document says non-Markdown files fail dump, but current implementation and tests intentionally ignore them. The implementation/test behavior is treated as current behavior and the stale documentation will be corrected. Source: `docs/issue-spec-representation.md:98-109`; `lib/spec-manager.js:220-226`; `e2e/tests/test_issue_dump_load.py:71-81`.

## Design Decisions

### Protocol And Compatibility

- `dump` always emits Issue Spec Representation V2. `load` accepts V1 and V2 so previously archived issues remain reconstructable. Rationale: one current write format avoids permanent mode-dependent serialization while explicit version dispatch preserves compatibility. Premises: V1 is currently hard-coded in both directions and historical archives already exist (`lib/spec-manager.js:232-288,331-375`).
- A V2 body header contains `zest-dev-issue-spec: 2`, `spec-id`, a non-empty `files` array of normalized Markdown paths, and optional `body-path`. The manifest paths are emitted in sorted order for deterministic dry-run output. Premise: file discovery is already recursive and sorted before V1 rendering (`lib/spec-manager.js:212-229,302`).
- `body-path` is a storage mapping, not a Main Spec File requirement. When `spec.md` exists, dump sets `body-path: spec.md` and preserves its content after the header; without `spec.md`, `body-path` is absent, the body has no file payload, and every manifested file is a protocol comment. Rationale: normal issues keep their readable body while legacy directories do not receive fabricated content. Premise: issue #148 requires both properties.
- V1 retains its current body-is-`spec.md` rules during load. V1 is not emitted after this change. Premise: existing V1 archives derive identity and `spec.md` content from the body (`docs/issue-spec-representation.md:132-154`).

### Validation And Write Boundary

- Parse the leading protocol header independently from file-path validation, then dispatch by version. V1 uses the existing file-body contract; V2 validates its manifest and optional body mapping before returning a common `{ specId, files }` representation. Premise: transport and filesystem writing already consume a common representation (`lib/spec-manager.js:378-412,509-574`).
- V2 loading rejects an absent/empty manifest, invalid or duplicate paths, a `body-path` outside the manifest, unexpected body payload without `body-path`, mismatched versions or Spec IDs, duplicate represented paths, and any missing or extra protocol file relative to the manifest. Ordinary non-protocol comments remain ignored. Rationale: the manifest must detect partial remote archives instead of silently producing an incomplete directory. Premises: issue #148 requires visible data-loss failures; V1 already ignores ordinary discussion (`lib/spec-manager.js:352-369`).
- Empty Markdown files are valid V2 file payloads. A directory with no Markdown files fails dump because there is no preservable Spec representation. Premise: losslessness applies to Markdown paths and exact content, including empty content (issue #148).
- Dump reads Markdown through a strict UTF-8 boundary and fails when decoding would replace invalid bytes. Rationale: replacement characters would violate exact-content preservation. Premises: issue #148 requires lossless content and visible failure for non-preservable input.
- Loading without `spec.md` reports the Spec directory as `spec.path` and status `new`; loading with `spec.md` preserves the existing file path and frontmatter-derived status. Rationale: output must not point to a fabricated or nonexistent Main Spec File. Premise: current output always constructs a `spec.md` path (`lib/spec-manager.js:403-410`).

### Change Scope

Impact Areas:
- Core protocol rendering/parsing and directory conversion in `lib/spec-manager.js`.
- Local, package, and fake-GitHub E2E coverage in `e2e/tests/test_issue_dump_load.py`.
- Protocol contract in `docs/issue-spec-representation.md`.

Planned File Changes:
- `lib/spec-manager.js`: implement V2 writes, V1/V2 reads, manifest validation, and truthful load metadata.
- `e2e/tests/test_issue_dump_load.py`: cover normal and Markdown-only V2 round trips, remote compatibility, V1 reads, and corrupt V2 failures.
- `docs/issue-spec-representation.md`: replace the V1-only write contract with V2 plus V1 compatibility rules.

### Verification Strategy

- EAG: run the focused public-CLI test selected by `v2_directory_manifest`, which constructs a nested Markdown-only directory, round-trips it through a local representation, compares exact paths/content, and also checks a normal V2 dump plus V1 load compatibility.
- Regression: run the complete local E2E suite, then the package E2E suite before PR creation. The fake-`gh` coverage proves remote V2 behavior without mutating GitHub issues.
