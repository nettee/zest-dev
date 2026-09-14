---
id: 20260914-standalone-file-issue-spec-v3
name: Standalone File Issue Spec V3
status: implemented
created: '2026-09-14'
---

## Overview

`zest-dev dump` and `load` preserve directory-based Specs through Issue Spec Representation V2, but repositories that adopted directory Specs incrementally may still contain standalone dated Markdown records such as `specs/change/20260101-legacy-record.md`. Those records cannot currently use local or GitHub archival because Spec discovery, serialization, loading, and archive automation assume a directory source.

Add a V3 standalone-file representation that preserves the exact filename and UTF-8 Markdown content. Directory dumps remain V2, V1/V2 loading remains compatible, and V3 loading reconstructs the original standalone file. Explicit paths and unambiguous IDs are supported; ambiguous sources, collisions, invalid paths, corrupt protocol data, and data-loss risks fail visibly. README and protocol documentation describe the V1/V2/V3 evolution and compatibility.

## Design

### Summary

Resolve dump inputs into an explicit directory or standalone-file source without changing the directory-oriented Spec lifecycle. Continue emitting V2 for directories and introduce a tagged V3 body representation for standalone files. Load dispatches by protocol version, validates the complete representation before writing, and atomically reconstructs the matching directory or file shape. Archive automation discovers both shapes and rejects duplicate logical IDs before mutation.

See [design.md](./design.md) for the Design Record.

### E2E Acceptance Gate (EAG)

A standalone dated Markdown file can be dumped by explicit path and unambiguous ID, round-tripped byte-for-byte through local and fake-GitHub V3 transport, and restored as the original file while existing V1/V2 directory behavior remains green. Verification: `cd e2e && env UV_CACHE_DIR=/tmp/zest-dev-uv-cache uv run pytest -q tests/test_issue_dump_load.py -k 'standalone or v2_directory_manifest'`.

## Plan

### Ticket 1 (AFK): Add V3 standalone dump/load

Goal: Round-trip standalone dated Markdown records without changing directory Spec behavior.
Scope: Add source resolution, V3 rendering/parsing, strict validation, collision handling, atomic file writes, and local/fake-GitHub E2E coverage.
Depends on: None

### Ticket 2 (AFK): Extend archive automation

Goal: Let old-spec automation archive standalone files safely.
Scope: Discover and sort directory/file candidates, reject duplicate logical IDs, pass resolvable identifiers to dump, delete the exact archived source, and extend script tests.
Depends on: Ticket 1

### Ticket 3 (AFK): EAG Validation

Goal: Validate the completed V3 workflow and V1/V2 compatibility.
Scope: Run the Spec EAG and relevant archive tests against the public CLI behavior.
Depends on: Ticket 2

### Ticket 4 (AFK): Documentation Sync

Goal: Make supported identifiers and protocol compatibility reviewable.
Scope: Document V3 protocol details and add a V1/V2/V3 dump/load evolution and compatibility table to README.
Depends on: Ticket 3

## Progress

- [x] Ticket 1 (AFK): Add V3 standalone dump/load
- [x] Ticket 2 (AFK): Extend archive automation
- [x] Ticket 3 (AFK): EAG Validation
- [x] Ticket 4 (AFK): Documentation Sync
## Implementation

See [implementation.md](./implementation.md).

## Deferred Follow-Ups (DFU)

None.
