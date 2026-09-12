---
id: 20260912-issue-spec-v2-directory-manifest
name: Issue Spec V2 Directory Manifest
status: implemented
created: '2026-09-12'
---

## Overview

`zest-dev dump` currently rejects historical Spec directories that contain Markdown files but no `spec.md`. Repositories that adopted Zest Dev incrementally therefore cannot archive those directories without manufacturing false Main Spec File content.

Change Issue Spec Representation writes to a V2 directory-manifest format for every Spec directory. V2 must preserve the complete Markdown file path/content set whether or not `spec.md` exists, while `load` remains compatible with existing V1 archives. Local dry-run/file loading and remote GitHub dump/loading must share the same representation behavior and continue to fail visibly on malformed or incomplete protocol data.

The change does not make Issue Spec Representation a general filesystem archive: ordinary non-Markdown files remain outside the represented file set, and unsupported filesystem entries remain errors.

## Design

### Summary

Make V2 the only format emitted by `dump` and retain V1 as a load-only compatibility format. Every V2 issue body carries a complete, deterministic Markdown file manifest and an optional `body-path`; when `spec.md` exists it remains the body payload, otherwise every file is represented by a protocol comment. `load` validates the manifest against the body and protocol comments before writing through the existing temporary-directory boundary.

See [design.md](./design.md) for the Design Record.

### E2E Acceptance Gate (EAG)

Acceptance behavior: A nested Markdown-only Spec directory without `spec.md` can be dumped through V2 and loaded with an identical Markdown path/content set, while a normal Spec is also emitted as V2 and historical V1 input remains loadable.

Verification path: `cd e2e && env UV_CACHE_DIR=/tmp/zest-dev-uv-cache uv run pytest -q tests/test_issue_dump_load.py -k 'v2_directory_manifest'`

## Plan

### Ticket 1 (AFK): V2 Directory Manifest Round Trip

Goal: Dump and load any non-empty Markdown Spec directory through one lossless V2 representation.
Scope: Add version-aware protocol parsing/rendering, emit a complete manifest for all dumps, support optional body payloads, validate manifest completeness, preserve nested paths and exact content, and add local E2E coverage for directories with and without `spec.md`.
Depends on: None

### Ticket 2 (AFK): Compatibility And Transport Stabilization

Goal: Preserve historical archives and prove V2 uses the existing GitHub transport without weakening failure behavior.
Scope: Retain V1 loading, cover remote legacy-directory round trips through the fake `gh` boundary, add malformed/incomplete V2 cases, and keep truthful load metadata when no Main Spec File exists.
Depends on: Ticket 1

### Ticket 3 (AFK): EAG Validation

Goal: Validate the finished behavior through the Spec's E2E Acceptance Gate.
Scope: Run the Design EAG and the complete local E2E suite after functional tickets are complete.
Depends on: Ticket 2

### Ticket 4 (AFK): Documentation Sync

Goal: Align the Issue Spec Representation contract and user-facing behavior with V2.
Scope: Document V2 writes, V1 read compatibility, optional body payloads, manifest validation, Markdown-only scope, and current failure rules.
Depends on: Ticket 3

## Progress

- [x] Ticket 1 (AFK): V2 Directory Manifest Round Trip
- [x] Ticket 2 (AFK): Compatibility And Transport Stabilization
- [x] Ticket 3 (AFK): EAG Validation
- [x] Ticket 4 (AFK): Documentation Sync

## Implementation

See [implementation.md](./implementation.md).

## Deferred Follow-Ups (DFU)

None.
