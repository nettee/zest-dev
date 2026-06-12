# Steps

## Step 1: Baseline and Coverage Inventory

Ran the pre-migration JavaScript baseline with `pnpm test:local`; it passed with 50 tests, 49 passed, 1 skipped, and 0 failed. Inventoried the old JS suite into init deployment, spec lifecycle/status/update, Ralph integration, prompt generation, package behavior, and shared helper coverage.

Verification: `pnpm test:local` before deleting the JS suite.

## Step 2: uv E2E Harness

Added `e2e/` as a uv-managed pytest project with `pyproject.toml`, `uv.lock`, local/package wrapper commands, and shared helpers for CLI execution, pytest orchestration, package install setup, and repository paths.

Verification: `uv run ./run_e2e_local`.

## Step 3: Behavior Migration

Ported the JS E2E behavior coverage into pytest files split by functional cluster: init deployment, spec lifecycle/status/update, Ralph integration, and prompt generation. The tests execute real `zest-dev` subprocesses and use isolated temporary projects plus fake HOME/XDG config directories.

Verification: `uv run ./run_e2e_local`.

## Step 4: Entrypoint and CI Switch

Kept `test`, `test:local`, and `test:package` in `package.json`, but changed them to delegate to the `e2e/` uv wrappers. Updated CI to install uv and Python while preserving separate local and packaged jobs.

Verification: `pnpm test:local` and `pnpm test:package`.

## Step 5: Remove JS E2E Suite

Deleted the obsolete JavaScript E2E files from `test/` after the pytest suite covered the same behavior. Package setup previously handled by `test/setup-package-env.js` now lives in `e2e/helpers/package_env.py`.

Verification: `pnpm test:local` and `pnpm test:package` pass without the old JS files.

## Step 6: Documentation Follow-Up

Replaced the old test README with `e2e/README.md`, documenting the uv/pytest E2E architecture, wrapper commands, coverage areas, and fail-fast expectations. The glossary already includes the resolved E2E Test Suite terminology.

Verification: documentation reviewed alongside the final diff.
