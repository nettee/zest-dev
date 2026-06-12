---
id: 20260612-improve-e2e-tests-python
name: Improve E2e Tests Python
status: implemented
created: '2026-06-12'
---

## Overview

Issue 84 asks to improve the E2E test suite by switching it to Python.

Goals:
- Replace the current JavaScript-based E2E test suite with a Python-based suite.
- Preserve the existing local and packaged verification coverage while improving maintainability.
- Keep the test system aligned with the project's fast-fail expectations: required setup and command failures should fail visibly.

Scope:
- E2E/integration tests for the `zest-dev` CLI.
- Local development and packaged-install verification paths.
- CI wiring for the affected test commands.

## Research

See [design.md](./design.md).

## Design

### Design Summary

Replace the JavaScript E2E Test Suite with a Python pytest suite managed as a uv project under `e2e/`. The Python suite tests the real Node-based `zest-dev` CLI through subprocesses, preserves local and packaged verification coverage, and keeps the public `pnpm test`, `pnpm test:local`, and `pnpm test:package` entrypoints thin by delegating to `e2e/` wrapper commands.

See [design.md](./design.md) for design detail.

### E2E Acceptance Gate (EAG)

The migrated Python E2E Test Suite verifies the same CLI behavior coverage as the current JS suite for both working-tree and packaged-install paths.

Verification path:
- Run the existing JS suite once before migration: `pnpm test:local`
- After migration, run the Python suite through preserved entrypoints: `pnpm test:local` and `pnpm test:package`

## Plan

### Step 1: Baseline and Coverage Inventory

Type: AFK
Goal: Establish the pre-migration passing baseline and map existing JS E2E assertions into Python migration clusters.
Scope: Run the current JS local E2E suite once, inspect `test/test-integration.js`, and record a compact coverage inventory grouped by spec lifecycle, init deployment, prompt generation, Ralph integration, package behavior, and shared helpers.
Depends on: None

### Step 2: uv E2E Harness

Type: AFK
Goal: Create the Python E2E project and wrappers without changing the public npm test command names.
Scope: Add `e2e/pyproject.toml`, `e2e/uv.lock`, `run_e2e_local`, `run_e2e_package`, pytest configuration, and shared helper modules for subprocess execution, temporary projects, fake user config, and package install setup.
Depends on: Step 1

### Step 3: Behavior Migration

Type: AFK
Goal: Port the existing JS E2E behavior coverage into clustered pytest files.
Scope: Migrate assertions from the coverage inventory into focused `e2e/tests/test_*.py` files, preserving both local and packaged CLI execution paths and keeping failures visible.
Depends on: Step 2

### Step 4: Entrypoint and CI Switch

Type: AFK
Goal: Route the existing developer and CI test entrypoints through the Python E2E suite.
Scope: Update `package.json` scripts to call the simple uv-backed wrappers, update CI to install/setup uv and keep the local/package jobs, and verify `pnpm test:local` and `pnpm test:package`.
Depends on: Step 3

### Step 5: Remove JS E2E Suite

Type: AFK
Goal: Complete the one-way migration by deleting obsolete JS E2E files and setup code.
Scope: Remove `test/test-integration.js` and replace or remove `test/setup-package-env.js` after equivalent Python package setup exists; clean up stale references in test documentation.
Depends on: Step 4

### Step 6: Documentation Follow-Up

Type: AFK
Goal: Keep project documentation aligned with the implemented behavior.
Scope: If the implementation changes documented behavior, usage, commands, setup, or workflows, update the relevant project docs.
Depends on: Step 5

## Progress

- [x] Step 1: Baseline and Coverage Inventory
- [x] Step 2: uv E2E Harness
- [x] Step 3: Behavior Migration
- [x] Step 4: Entrypoint and CI Switch
- [x] Step 5: Remove JS E2E Suite
- [x] Step 6: Documentation Follow-Up

## Implementation

See [steps.md](./steps.md).
