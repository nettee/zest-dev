---
id: 20260627-issue-dump-load
name: Issue Dump Load
status: planned
created: '2026-06-27'
---

## Overview

Add programmatic `dump` and `load` capabilities that convert a Zest Dev Spec between its file-system directory form and a forge issue form without using an LLM and without losing represented Markdown file information.

Initial direction:
- `dump` writes the Main Spec File to the issue body.
- `dump` writes each additional Markdown file as a separate issue comment.
- The issue title, labels, body, and comments carry enough protocol metadata for smooth `load`.
- `load` reconstructs the Spec directory from the issue representation.
- The E2E Acceptance Gate should dump and load a test Spec, then verify represented Markdown file paths and content are unchanged.

Source issue: [nettee/zest-dev#98](https://github.com/nettee/zest-dev/issues/98).

## Research

See [design.md](./design.md).

## Design

### Design Summary

Implement a forge-neutral Issue Spec Representation protocol, documented in [docs/issue-spec-representation.md](../../../docs/issue-spec-representation.md), then add `zest-dev dump` and `zest-dev load` around it. The core protocol layer must work without network access; the first remote transport uses GitHub through `gh`, while Forgejo remains a future adapter behind the same representation boundary.

See [design.md](./design.md) for design detail.

### E2E Acceptance Gate (EAG)

Dump a test Spec directory with multiple Markdown files to a local Issue Spec Representation, load it into a fresh Spec directory, and verify the original and loaded Spec have identical Markdown file paths and file content. Also verify fail-fast cases for missing `spec.md`, non-Markdown files, duplicate protocol paths, missing or invalid `spec-id`, mismatched comment `spec-id`, and existing target directory.

## Plan

- [ ] Step 1: Protocol document and core local representation
  - [ ] Substep 1.1 Implement: Add parser/renderer for Issue Spec Representation v1.
  - [ ] Substep 1.2 Implement: Walk Spec directories and build representation from all Markdown files.
  - [ ] Substep 1.3 Implement: Load local representation into a new Spec directory.
  - [ ] Substep 1.4 Verify: Add E2E coverage for local round-trip and fail-fast protocol errors.
- [ ] Step 2: CLI commands and local mode
  - [ ] Substep 2.1 Implement: Add `zest-dev dump <spec|active> --dry-run`.
  - [ ] Substep 2.2 Implement: Add `zest-dev load --from-file <path>`.
  - [ ] Substep 2.3 Verify: Cover command output, active-spec behavior, and package test path.
- [ ] Step 3: GitHub transport
  - [ ] Substep 3.1 Implement: Infer forge/repo from the default remote, falling back to GitHub.
  - [ ] Substep 3.2 Implement: Create GitHub issues and comments through `gh`.
  - [ ] Substep 3.3 Implement: Read GitHub issue body/comments through `gh` for remote load.
  - [ ] Substep 3.4 Verify: Add adapter-focused tests with stubbed `gh` behavior.
- [ ] Step 4: Documentation sync and acceptance
  - [ ] Substep 4.1 Implement: Update README or command docs with `dump/load` usage.
  - [ ] Substep 4.2 Verify: Run local E2E suite.
  - [ ] Substep 4.3 Verify: Run package E2E suite when practical.

## Progress

- [ ] Step 1: Protocol document and core local representation
- [ ] Step 2: CLI commands and local mode
- [ ] Step 3: GitHub transport
- [ ] Step 4: Documentation sync and acceptance

## Implementation

See [steps.md](./steps.md).

## Deferred Follow-Ups (DFU)

None.
