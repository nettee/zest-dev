---
id: 20260630-publish-to-npm
name: Publish To Npm
status: planned
created: '2026-06-30'
---

## Overview

Publish `zest-dev` to npm so users can install and run the CLI without cloning this repository or using `npm link`.

Goals:
- Confirm the package metadata, CLI entrypoint, package contents, and packaged-install behavior are publish-ready.
- Separate agent-doable release preparation from human-only or dangerous npm registry actions.
- Produce a clear release procedure for the first npm publish.

Scope:
- Prepare this repository for publishing the current `zest-dev` package to the public npm registry.
- Validate the packed package and documented install path.
- Include Human-in-the-loop publishing steps for authentication, OTP/token handling, and the actual registry write.

Success Criteria:
- `npm pack --dry-run` shows only intended package contents.
- Existing local and packaged CLI tests pass before publish.
- The Plan clearly distinguishes AFK steps from HITL steps and states what AI and Human each do in every HITL step.

## Research

See [design.md](./design.md).

## Design

### Design Summary

Treat npm publishing as a release-readiness and operator handoff change, not as a fully automated registry write. The AI prepares and validates package metadata, tarball contents, test coverage, README install guidance, and a release checklist. The Human performs npm-account-sensitive actions: confirming package ownership, choosing final version/tag, authenticating, entering OTP or using a protected token, and running the final `npm publish` command.

See [design.md](./design.md) for design detail.

### E2E Acceptance Gate (EAG)

Acceptance behavior: A freshly packed package installs into an isolated project and exposes a working `zest-dev` CLI with the repository's packaged-install E2E behavior intact.

Verification path: `pnpm test:package`

## Plan

### Step 1 (AFK): Release Readiness Fixes

Goal: Make the package publish-ready before any registry write.
Scope: Review and update package metadata, version wiring, README install guidance, and any package content controls needed for the intended public npm package.
Depends on: None

### Step 2 (AFK): Package Contents and E2E Validation

Goal: Prove the packed artifact contains the intended files and works after installation.
Scope: Run `npm pack --dry-run --json`, inspect the file list, run `pnpm test:local`, and run `pnpm test:package`; fix any required readiness issues that are safe for AI to change.
Depends on: Step 1

### Step 3 (HITL): Human Release Authorization

Goal: Confirm the irreversible npm release parameters before publishing.
Scope: AI summarizes validated package name, version, tag, tarball contents, and exact publish command; Human confirms npm account/package ownership, final version/tag, registry target, whether provenance is required, and whether to proceed.
Depends on: Step 2

### Step 4 (HITL): npm Publish

Goal: Publish the validated package to the public npm registry.
Scope: AI provides the exact command and watches/interprets output if the Human shares it; Human runs the registry-writing `npm publish` command, completes login/OTP/token prompts, and reports success or failure output back to AI.
Depends on: Step 3

### Step 5 (AFK): EAG Validation

Goal: Validate the completed change against the Spec's EAG before wrap-up work.
Scope: Run `pnpm test:package` to verify the packaged-install acceptance behavior defined in the Design section.
Depends on: Step 4

### Step 6 (AFK): Documentation Sync

Goal: Keep project documentation aligned with the implemented behavior.
Scope: If the implementation or release outcome changes documented install, setup, commands, publishing, or workflow behavior, update the relevant project docs.
Depends on: Step 5

## Progress

- [x] Step 1 (AFK): Release Readiness Fixes
- [x] Step 2 (AFK): Package Contents and E2E Validation
- [x] Step 3 (HITL): Human Release Authorization
- [x] Step 4 (HITL): npm Publish
- [ ] Step 5 (AFK): EAG Validation
- [ ] Step 6 (AFK): Documentation Sync

## Implementation

See [steps.md](./steps.md).

## Deferred Follow-Ups (DFU)

None.
