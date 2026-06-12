# Zest Dev E2E Tests

This directory contains the Python E2E Test Suite for the `zest-dev` CLI.
The suite uses pytest and is managed as a uv project.

## Test Architecture

- Test cases live in `e2e/tests/` and verify real CLI behavior through subprocesses.
- Shared fixtures and helpers provide isolated temporary projects, fake user config directories, CLI command execution, and packaged-install setup.
- The same behavior suite runs against both the working-tree CLI and a packaged npm install.

## Running Tests

Local development path:

```bash
pnpm test:local
```

Packaged install path:

```bash
pnpm test:package
```

The npm scripts stay thin. They delegate to uv-backed wrappers:

- `e2e/run_e2e_local`
- `e2e/run_e2e_package`

## Coverage

The Python suite preserves the behavior coverage from the former JavaScript E2E suite:

- Spec creation, status, active spec handling, and status transitions
- Init deployment layouts and failure behavior
- Prompt generation
- Ralph task handoff
- Local and packaged CLI execution paths

## Failure Policy

Required setup failures, subprocess failures, package install failures, and assertion failures should fail visibly. The E2E harness should not report success after partial failure.
