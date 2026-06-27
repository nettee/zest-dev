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

### Step 1 (AFK): Protocol Document And Core Local Representation

Goal: Establish the forge-neutral Issue Spec Representation and prove local lossless round-trip behavior.
Scope: Keep [docs/issue-spec-representation.md](../../../docs/issue-spec-representation.md) aligned with implementation, add parser/renderer code, walk Spec directories for Markdown files, load local representations into new Spec directories, and cover local round-trip plus fail-fast protocol errors.
Depends on: None

### Step 2 (AFK): CLI Local Mode

Goal: Expose the pure local protocol path through the public CLI.
Scope: Add `zest-dev dump <spec|active> --dry-run` and `zest-dev load --from-file <path>`, preserving YAML-style command output, active-spec behavior, and package-install coverage.
Depends on: Step 1

### Step 3 (AFK): GitHub Transport

Goal: Support real issue archive creation and loading for the first forge transport.
Scope: Infer forge/repo from the default remote with GitHub fallback, use `gh` to create issues/comments and read issue body/comments, fail clearly for unsupported Forgejo, and test the adapter with stubbed `gh` behavior including partial failure reporting.
Depends on: Step 2

### Step 4 (AFK): EAG Validation

Goal: Validate the completed change against the Spec's EAG before wrap-up work.
Scope: Run the local representation round-trip EAG and fail-fast cases defined in the Design section, then run relevant local/package E2E coverage.
Depends on: Step 3

### Step 5 (AFK): Documentation Sync

Goal: Keep project documentation aligned with the implemented behavior.
Scope: If the implementation changes documented behavior, usage, commands, setup, or workflows, update the relevant project docs.
Depends on: Step 4

## Progress

- [ ] Step 1 (AFK): Protocol Document And Core Local Representation
- [ ] Step 2 (AFK): CLI Local Mode
- [ ] Step 3 (AFK): GitHub Transport
- [ ] Step 4 (AFK): EAG Validation
- [ ] Step 5 (AFK): Documentation Sync

## Implementation

See [steps.md](./steps.md).

## Deferred Follow-Ups (DFU)

None.
