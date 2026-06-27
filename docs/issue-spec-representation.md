# Issue Spec Representation

This document defines the forge-neutral issue representation used by `zest-dev dump` and `zest-dev load`.

## Purpose

An Issue Spec Representation stores one complete Zest Dev Spec directory in one forge issue. It is a snapshot format, not a synchronization protocol.

The representation is designed for GitHub and Forgejo issue primitives:
- issue title
- issue labels
- issue body
- issue comments

Load correctness depends only on protocol headers and Markdown content in the issue body and protocol comments. The title and labels are archive metadata for people.

## Version

The initial protocol version is `1`.

Every protocol body/comment starts with a leading HTML comment header:

```markdown
<!--
zest-dev-issue-spec: 1
spec-id: 20260627-issue-dump-load
path: spec.md
-->
```

Rules:
- The header must start at the beginning of the body or comment.
- The header is YAML-like line data inside an HTML comment.
- `zest-dev-issue-spec` is required and must be `1`.
- `spec-id` is required and identifies the Spec directory.
- `path` is required and identifies the file path inside the Spec directory.
- The Markdown file content starts immediately after the header closing line and one newline.
- The file content is stored as renderable Markdown, not inside a fenced code block.

## Issue Mapping

One issue represents one Spec directory.

The issue body stores `spec.md`:

```markdown
<!--
zest-dev-issue-spec: 1
spec-id: 20260627-issue-dump-load
path: spec.md
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

Each additional Markdown file is stored in one issue comment:

```markdown
<!--
zest-dev-issue-spec: 1
spec-id: 20260627-issue-dump-load
path: design.md
-->
# Design

...
```

Comment order is not meaningful. `load` matches supporting files by `path`.

Comments without a leading protocol header are ordinary issue discussion and are ignored by `load`.

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

`load` must not use title or labels as authoritative Spec data.

## File Set

`dump` walks the Spec directory and includes every Markdown file:
- `spec.md` is written to the issue body.
- Every other Markdown file is written to one protocol comment.

`dump` fails when:
- `spec.md` is missing.
- The Spec directory contains any non-Markdown file.
- A discovered Markdown path is invalid.

Legacy `README.md` main files are not supported by this protocol.

## Path Rules

Paths are relative to the Spec directory.

Allowed:
- `spec.md`
- `design.md`
- `steps.md`
- `notes/review.md`

Rejected:
- empty paths
- absolute paths
- paths containing parent-directory traversal
- non-Markdown paths
- duplicate paths
- path separators that cannot be normalized safely for the current platform

`load` always writes issue body content to `spec.md`. The body header path must be `spec.md`.

## Spec Identity

The loaded Spec identity comes from the protocol header `spec-id`, not from `spec.md` frontmatter, title, labels, issue number, or URL.

`load` fails when the body protocol header is missing `spec-id` or contains an invalid `spec-id`.

The `spec-id` must be a valid Spec directory name:

```text
YYYYMMDD-<slug>
```

`load` creates:

```text
specs/change/<spec-id>/
```

Protocol comments must repeat the same `spec-id`. If a protocol comment omits `spec-id` or includes a different `spec-id`, `load` fails.

If the target Spec directory already exists, `load` fails.

`load` does not change `specs/change/active`.

## Local Representation Mode

The same body/comment mapping can be represented locally for dry-run and tests:

```yaml
title: "[archive] 20260627-issue-dump-load"
labels:
  - spec:change
  - archive
body: |
  <!--
  zest-dev-issue-spec: 1
  spec-id: 20260627-issue-dump-load
  path: spec.md
  -->
  ...
comments:
  - |
    <!--
    zest-dev-issue-spec: 1
    spec-id: 20260627-issue-dump-load
    path: design.md
    -->
    ...
```

`dump --dry-run` emits this local representation without creating a remote issue.

`load --from-file <path>` loads from this local representation without reading a remote issue.

## Failure Rules

The protocol is fail-fast:
- unsupported protocol version fails
- missing body protocol header fails
- malformed protocol header fails
- missing or invalid body `spec-id` fails
- mismatched comment `spec-id` fails
- missing `spec.md` content fails
- invalid or duplicate file paths fail
- existing target Spec directory fails
- unsupported forge transport fails
- failed remote issue or comment operations fail

Remote `dump` is not transactional. If issue creation succeeds and a later comment creation fails, the command fails and reports the created issue URL. It does not silently close, delete, or repair the issue.
