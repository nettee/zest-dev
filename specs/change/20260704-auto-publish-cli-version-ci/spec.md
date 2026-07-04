---
id: 20260704-auto-publish-cli-version-ci
name: Auto Publish Cli Version Ci
status: planned
created: '2026-07-04'
---

## Overview

Automate the npm release path for the already-published `zest-dev` CLI while keeping unsafe registry setup and final PR/merge judgment visible to a Human.

Goals:
- On same-repository PRs that modify CLI/package-shipped files, automatically bump the package patch version when the PR has not already changed the version.
- Add CI that fails when a PR includes a version change that is not ahead of `main`, so stale concurrent PR bumps are caught before merge.
- After merge to `main`, publish to npm only when the merged version is not already present on the registry.
- Include implementation, PR, and real validation steps in the plan.

Scope:
- GitHub Actions workflows and small CI helper scripts for version bump, version freshness checking, and npm publish.
- Same-repository PRs only; fork PR automation is out of scope.
- No automatic merge-from-main handling in this spec.

Success Criteria:
- CLI-affecting PRs receive a patch version bump commit when needed.
- PR CI rejects version changes that are less than or equal to `main`'s version.
- Merge-to-main publishes a new npm version and skips safely if the version is already published.

## Research

See [design.md](./design.md).

## Design

### Design Summary

Use GitHub Actions as the automation boundary. A PR workflow detects package-shipped CLI changes and commits a patch bump back to same-repository PR branches. A separate PR CI check compares the PR version to `main` and fails fast if the PR version is not greater when a version change is present. A main-branch publish workflow validates that the merged version is new on npm before publishing.

See [design.md](./design.md) for design detail.

### E2E Acceptance Gate (EAG)

Acceptance behavior: A version-staleness check fails when a branch's package version is equal to or behind the base version, and passes when it is ahead.

Verification path: Run the CI helper's local test fixture or command documented by the implementation, plus `pnpm test:local`.

## Plan

### Step 1 (AFK): Version Freshness CI

Goal: Add the required CI check that prevents stale version changes from merging.
Scope: Implement a small script or workflow step that compares `package.json` version on PR head against `main` when the PR contains a version change; fail when head version is less than or equal to main version; wire it into a `pull_request` workflow.
Depends on: None

### Step 2 (AFK): PR Patch Bump Automation

Goal: Automatically create the expected patch bump on CLI-affecting same-repository PRs.
Scope: Add a `pull_request` workflow that detects changes under package-shipped CLI paths, skips forks, skips PRs that already changed version, runs `pnpm version patch --no-git-tag-version`, refreshes the lockfile if needed, and commits the bump to the PR branch.
Depends on: Step 1

### Step 3 (AFK): Main npm Publish Automation

Goal: Publish merged versions automatically without hiding duplicate-version failures.
Scope: Add a `push` to `main` workflow that runs tests, compares the merged version against npm, publishes only if the version is absent, and uses the configured npm authentication/provenance path.
Depends on: Step 2

### Step 4 (HITL): PR Review and Secret/Publishing Setup

Goal: Get the automation merged and connect it to authorized npm publishing credentials.
Scope: AI opens or prepares the PR, summarizes changed workflows, required repository secrets/trusted-publishing configuration, and expected CI behavior. Human reviews the PR, configures `NPM_TOKEN` or npm trusted publishing in GitHub/npm, confirms branch protection/check requirements, and merges when satisfied.
Depends on: Step 3

### Step 5 (HITL): Real Release Validation

Goal: Prove the automation works against the real GitHub and npm systems after merge.
Scope: AI creates or guides a minimal CLI-affecting validation PR, watches/interprets workflow results from shared logs, and verifies npm registry output after merge. Human authorizes and merges the validation PR, resolves any version conflict if CI catches staleness, and confirms the actual npm publish result in GitHub/npm if privileged access is required.
Depends on: Step 4

### Step 6 (AFK): EAG Validation

Goal: Validate the completed change against the Spec's EAG before wrap-up work.
Scope: Run the version-staleness helper's local verification fixture or documented command, plus `pnpm test:local`.
Depends on: Step 5

### Step 7 (AFK): Documentation Sync

Goal: Keep project documentation aligned with the implemented automation.
Scope: If implementation changes release workflow, required secrets, branch protection, or maintainer instructions, update the relevant project docs.
Depends on: Step 6

## Progress

- [ ] Step 1 (AFK): Version Freshness CI
- [ ] Step 2 (AFK): PR Patch Bump Automation
- [ ] Step 3 (AFK): Main npm Publish Automation
- [ ] Step 4 (HITL): PR Review and Secret/Publishing Setup
- [ ] Step 5 (HITL): Real Release Validation
- [ ] Step 6 (AFK): EAG Validation
- [ ] Step 7 (AFK): Documentation Sync

## Implementation

See [steps.md](./steps.md).

## Deferred Follow-Ups (DFU)

None.
