# Issue Spec Representation

This document defines the forge-neutral issue representation used by `zest-dev dump` and `zest-dev load`.

## Purpose

An Issue Spec Representation stores either one complete Markdown snapshot of a Zest Dev Spec directory or one standalone dated Markdown record in one forge issue. It is a snapshot format, not a synchronization protocol.

The representation is designed for GitHub and Forgejo issue primitives:
- issue title
- issue labels
- issue body
- issue comments

Load correctness depends only on protocol headers and Markdown content in the issue body and protocol comments. The title and labels are archive metadata for people.

## Versions

`dump` writes protocol version `2` for Spec directories and version `3` for standalone Markdown files. `load` accepts versions `1`, `2`, and `3` so existing archives remain loadable. V1 and V2 always reconstruct directories; V3 always reconstructs a standalone file.

Every protocol body/comment starts with a leading HTML comment header. A V2 issue body for a normal Spec begins like this:

```markdown
<!--
zest-dev-issue-spec: 2
spec-id: 20260627-issue-dump-load
files:
  - design.md
  - spec.md
body-path: spec.md
-->
```

Rules common to V2 body and file comments:
- The header must start at the beginning of the body or comment.
- The header is YAML inside an HTML comment.
- `zest-dev-issue-spec` and `spec-id` are required.
- The `spec-id` identifies the target Spec directory.
- File content starts immediately after the header closing line and one newline.
- File content is stored as renderable Markdown, not inside a fenced code block.

## V2 Directory Manifest

The V2 issue body describes the complete represented directory:
- `files` is a required, non-empty array containing every represented Markdown path.
- `body-path` is optional. When present, it identifies which manifested file is stored after the body header.
- Every manifested path other than `body-path` is stored in exactly one protocol comment.
- Manifest paths emitted by `dump` are sorted for deterministic output.

When `spec.md` exists, `dump` uses it as `body-path` so the Main Spec File remains readable in the issue body:

```markdown
<!--
zest-dev-issue-spec: 2
spec-id: 20260627-issue-dump-load
files:
  - design.md
  - spec.md
body-path: spec.md
-->
---
id: 20260627-issue-dump-load
name: Issue Dump Load
status: planned
created: '2026-06-27'
---

## Overview

...
```

When `spec.md` does not exist, the body has no `body-path` or file content. All manifested Markdown files are stored in protocol comments:

```markdown
<!--
zest-dev-issue-spec: 2
spec-id: 20260812-legacy-spec
files:
  - design.md
  - notes/test-standard.md
-->
```

A V2 file comment carries its path and exact content:

```markdown
<!--
zest-dev-issue-spec: 2
spec-id: 20260812-legacy-spec
path: design.md
-->
# Historical design

...
```

Comment order is not meaningful. Comments without a leading protocol header are ordinary issue discussion and are ignored by `load`.

Before writing any files, `load` verifies that the body payload and protocol comments match the manifest exactly. Missing, duplicate, or unlisted represented paths fail instead of producing a partial directory.

## V3 Standalone File

V3 represents exactly one dated Markdown file that is a direct child of `specs/change`:

```markdown
<!--
zest-dev-issue-spec: 3
kind: standalone-file
spec-id: 20260101-legacy-record
filename: 20260101-legacy-record.md
-->
# Historical change record
```

The V3 body header has exactly four fields:

- `zest-dev-issue-spec` must be `3`.
- `kind` must be `standalone-file`.
- `spec-id` must be a valid dated Spec ID without `.md`.
- `filename` must be exactly `<spec-id>.md`.

The complete file content starts after the header separator and may be empty. V3 has no protocol file comments because its one file is wholly represented in the issue body. Ordinary non-protocol issue comments are ignored during load.

`dump` accepts the standalone path, its filename, or its ID without `.md`. A bare ID is accepted only when exactly one of `specs/change/<id>/` and `specs/change/<id>.md` exists. When both exist, the ID is ambiguous and fails; an explicit path selects the intended source.

## V1 Load Compatibility

V1 archives do not contain a directory manifest. Their issue body header has `path: spec.md`, and the body payload is required to contain the Main Spec File:

```markdown
<!--
zest-dev-issue-spec: 1
spec-id: 20260627-issue-dump-load
path: spec.md
-->
# Existing V1 Spec
```

Every V1 supporting Markdown file remains stored in one protocol comment with the same version, `spec-id`, and its own `path`. V1 keeps its original validation behavior during load. New dumps never emit V1.

## Title And Labels

`dump` creates issue titles as:

```text
[archive] <spec-id>
```

`dump` applies these labels:

```text
spec:change
archive
```

`load` does not use title or labels as authoritative Spec data.

## Represented File Set

`dump` recursively includes every Markdown file under the Spec directory. A directory does not need a Main Spec File, but it must contain at least one Markdown file.

Ordinary non-Markdown files are outside the Issue Spec Representation and are ignored. Unsupported filesystem entry types, including symlinks, fail visibly because they cannot be represented safely.

Empty Markdown files are valid and retain their empty content through V2.

Markdown files must contain valid UTF-8. Invalid byte sequences fail rather than being replaced during decoding.

## Path Rules

Paths are relative to the Spec directory.

Allowed:
- `spec.md`
- `design.md`
- `implementation.md`
- `steps.md` (legacy Spec)
- `notes/review.md`

Rejected:
- empty paths
- absolute paths
- paths containing parent-directory traversal
- non-Markdown paths
- duplicate paths
- paths whose directory segments end in `.md`
- path separators that cannot be normalized safely for the current platform

In V2, `body-path` must be one of the manifested paths. It describes storage location only and does not designate or create a Main Spec File.

## Spec Identity And Local Write

The loaded Spec identity comes from the protocol header `spec-id`, not from `spec.md` frontmatter, title, labels, issue number, or URL. For V3, `filename` must agree with that identity.

The `spec-id` must be a valid Spec directory name:

```text
YYYYMMDD-<slug>
```

V1 and V2 `load` create:

```text
specs/change/<spec-id>/
```

Every protocol comment must use the same version and `spec-id` as the issue body. If the target Spec directory already exists, `load` fails. Files are written to a temporary directory and renamed into place only after validation and successful writes.

`load` does not change `specs/change/active`. For a directory without `spec.md`, successful output reports the Spec directory path rather than a nonexistent Main Spec File path.

V3 `load` creates the exact standalone target:

```text
specs/change/<spec-id>.md
```

It fails if that target file or a same-ID target directory already exists. The file is written to a temporary sibling and renamed into place only after validation and a successful write. A loaded standalone historical record is never made active.

## Local Representation Mode

The same body/comment mapping can be represented locally as YAML:

```yaml
title: "[archive] 20260812-legacy-spec"
labels:
  - spec:change
  - archive
body: |
  <!--
  zest-dev-issue-spec: 2
  spec-id: 20260812-legacy-spec
  files:
    - design.md
  -->
comments:
  - |
    <!--
    zest-dev-issue-spec: 2
    spec-id: 20260812-legacy-spec
    path: design.md
    -->
    # Historical design
```

`dump --dry-run` emits this local representation without creating a remote issue. `load --from-file <path>` loads it without reading a remote issue.

## Failure Rules

The protocol is fail-fast:
- unsupported or mismatched protocol versions fail
- missing or malformed body protocol headers fail
- missing or invalid `spec-id` values fail
- V2 missing, empty, invalid, or duplicate manifest paths fail
- V2 body mappings outside the manifest fail
- V2 missing, duplicate, or unlisted represented files fail
- unexpected V2 body content without `body-path` fails
- V1 body paths other than `spec.md` or empty `spec.md` content fail
- V3 kinds other than `standalone-file`, mismatched filenames, extra metadata fields, or protocol comments fail
- invalid file paths fail
- invalid UTF-8 Markdown content fails
- existing target shapes or conflicting same-ID directory/file shapes fail
- unsupported forge transports fail
- failed remote issue or comment operations fail

Remote `dump` is not transactional. If issue creation succeeds and a later comment creation or issue close fails, the command fails and reports the created issue URL. It does not silently close, delete, or repair the issue.
