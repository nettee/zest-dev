# Design

## Research

### Existing System

- Issue 84 is open and requests: "完善 e2e test 体系，改成用 Python。" Source: GitHub issue [nettee/zest-dev#84](https://github.com/nettee/zest-dev/issues/84).
- The current package scripts run the E2E/integration suite with Node's built-in test runner. `test`, `test:local`, and the packaged path all call `node --test test/test-integration.js`. Source: `package.json:34-39`.
- The current test README describes the suite as `node:test` based and says test logic lives in `test/test-integration.js`, while environment setup lives in `test/setup-package-env.js`. Source: `test/README.md:1-13,15-40`.
- The packaged verification path packs the CLI, creates `test-package-env/`, installs the tarball, and then runs the same integration suite against the installed binary. Source: `test/README.md:55-66`, `test/setup-package-env.js:29-76`.
- CI has two integration jobs: local verification runs `pnpm test:local`; packaged verification runs `pnpm test:package`. Source: `.github/workflows/ci.yml:9-56`.
- The integration test file currently centralizes CLI command execution helpers, isolated test directories, fake home/XDG environments, package CLI resolution, and many CLI behavior assertions. Source: `test/test-integration.js:1-120`.

### Design Inputs

- The project documents the current test architecture as a separation between test cases and environment setup, with the same suite running in local and packaged environments. Source: `test/README.md:6-13,153-158`.
- Package testing is explicitly meant to catch distribution failures such as missing `package.json` files, wrong paths, and missing dependencies. Source: `test/README.md:90-119`.
- The repository-level development instructions require test logic to stay in JS files today, but the issue explicitly asks to switch the E2E suite to Python. Source: `AGENTS.md` "Automated Testing"; GitHub issue [nettee/zest-dev#84](https://github.com/nettee/zest-dev/issues/84).
- The project values fast failure and rejects fallback data, swallowed errors, and success after partial failure. Source: `AGENTS.md` "Let It Crash / Fast Fail".
- pytest supports fixtures requested by test functions, reusable fixtures that help each test start from a clean state, `tmp_path` temporary directories, and parametrized tests. Source: [pytest fixtures docs](https://docs.pytest.org/en/stable/how-to/fixtures.html), [pytest tmp_path docs](https://docs.pytest.org/en/stable/how-to/tmp_path.html), [pytest parametrization docs](https://docs.pytest.org/en/stable/how-to/parametrize.html).
- uv supports Python projects defined by `pyproject.toml`, creates `.venv` and `uv.lock` for project commands, and uses `uv run` to run commands in a synchronized project environment. Source: [uv project docs](https://docs.astral.sh/uv/guides/projects/), [uv run docs](https://docs.astral.sh/uv/concepts/projects/run/).
- uv's GitHub Actions guide recommends `astral-sh/setup-uv`, pinning uv versions as best practice, and running tests with `uv run pytest tests` after uv/Python setup. Source: [uv GitHub Actions docs](https://docs.astral.sh/uv/guides/integration/github/).

### Constraints & Dependencies

- The CLI under test remains a Node package with executable `bin/zest-dev.js`; Python tests will still need to execute the real CLI commands rather than replacing the product runtime. Source: `package.json:18-20`.
- CI currently provisions Node.js 20 and pnpm only; any Python-based suite needs CI Python setup if the GitHub runner default is not treated as an explicit dependency. Source: `.github/workflows/ci.yml:17-29,41-53`.
- The current packaged setup script uses npm commands and exits non-zero on setup failure. Source: `test/setup-package-env.js:29-82`.

### Key References

- GitHub issue: [nettee/zest-dev#84](https://github.com/nettee/zest-dev/issues/84)
- Test scripts: `package.json:34-39`
- Test architecture docs: `test/README.md:1-158`
- Existing integration helpers: `test/test-integration.js:1-120`
- Package environment setup: `test/setup-package-env.js:29-82`
- CI jobs: `.github/workflows/ci.yml:9-56`
- Project fast-fail rule: `AGENTS.md` "Let It Crash / Fast Fail"

## Design Detail

### Design Summary

Switch the E2E Test Suite harness from JavaScript to Python while continuing to test the real Node-based `zest-dev` CLI. Python owns test orchestration, temporary project setup, subprocess execution, and assertions; it does not replace the product runtime or reimplement CLI behavior.

### Design Decisions

- Migrate only the E2E Test Suite harness and tests to Python; keep `zest-dev` itself as the Node package under test. Source: GitHub issue [nettee/zest-dev#84](https://github.com/nettee/zest-dev/issues/84), `package.json:18-20`.
  - Derived rules: Python tests execute real CLI commands through subprocesses; no Python CLI implementation; no mocks for product behavior; no fallback success path when command execution fails.
- Preserve the current local-vs-packaged verification model while changing the test language. Source: `test/README.md:6-13,55-66`, `.github/workflows/ci.yml:9-56`.
  - Derived rules: local tests exercise the working tree CLI; packaged tests install the packed npm artifact and run the same behavioral suite against the installed binary.
- Use pytest as the Python test framework. Source: [pytest fixtures docs](https://docs.pytest.org/en/stable/how-to/fixtures.html), [pytest tmp_path docs](https://docs.pytest.org/en/stable/how-to/tmp_path.html), [pytest parametrization docs](https://docs.pytest.org/en/stable/how-to/parametrize.html), [pytest assertions docs](https://docs.pytest.org/en/stable/how-to/assert.html).
  - Derived rules: use pytest fixtures for CLI environments and temporary projects; use parametrization for local/package environment reuse where it keeps one behavioral test body; let subprocess failures and assertion failures surface directly in pytest output.
- Replace the JavaScript E2E suite rather than keeping a long-term JS/Python dual track. Source: user decision in design discussion, `package.json:34-39`, `test/test-integration.js:1-120`.
  - Derived rules: run the existing JS suite once before migration to establish a passing baseline; after migration, run the Python suite as the success gate; delete `test/test-integration.js` as a primary E2E entrypoint; replace or absorb `test/setup-package-env.js` into the Python test harness.
- Manage the Python E2E suite as a uv project under `e2e/`. Source: user decision in design discussion, [uv project docs](https://docs.astral.sh/uv/guides/projects/), [uv run docs](https://docs.astral.sh/uv/concepts/projects/run/).
  - Derived rules: put Python test configuration and dependencies in `e2e/pyproject.toml`; commit `e2e/uv.lock`; run tests via uv from the `e2e/` project; update npm scripts and CI to invoke that uv-backed E2E entrypoint rather than direct `node --test`.
- Preserve the behavior coverage of the existing JavaScript E2E suite while migrating it to Python. Source: user decision in design discussion, `test/test-integration.js:1-120`, `test/README.md:20-29`.
  - Derived rules: inventory current behavioral assertions before migration; migrate by functional clusters; allow restructuring and deduplication, but do not drop behavior coverage except for assertions that are clearly duplicate or implementation-detail-only.
- Preserve the public npm test entrypoints while keeping their implementation thin. Source: user decision in design discussion, `package.json:34-39`, `.github/workflows/ci.yml:31-56`.
  - Derived rules: keep `test`, `test:local`, and `test:package`; have package scripts call simple `uv run ...py` wrapper commands under `e2e/`; put environment setup, package install, pytest invocation, and cleanup logic in Python wrapper scripts instead of complex shell in `package.json`.
- Provide separate `e2e/` wrapper commands for local and packaged E2E runs. Source: user decision in design discussion, `test/README.md:55-88`.
  - Derived rules: use `run_e2e_local` for the working-tree CLI path and `run_e2e_package` for pack/install verification; share subprocess, temporary environment, and cleanup helpers inside the `e2e/` Python project; keep each wrapper focused on orchestration for one verification path.
- Split migrated Python tests by functional cluster instead of recreating one large integration file. Source: user decision in design discussion, `test/test-integration.js:1-120`.
  - Derived rules: keep shared fixtures in `conftest.py` and helper modules; split behavior tests across focused `test_*.py` files such as spec lifecycle, init deployment, prompt generation, Ralph integration, and package behavior; use the coverage inventory to map existing JS assertions into these clusters.

### System Structure

```text
package.json
  test / test:local / test:package
          |
          v
e2e/ uv project
  run_e2e_local      -> pytest against working-tree CLI
  run_e2e_package    -> pack npm artifact, install it, pytest against installed CLI, cleanup
  tests/
    conftest.py      -> shared fixtures and CLI environment selection
    test_*.py        -> behavior clusters migrated from the JS suite
  helpers/
    cli.py           -> subprocess execution with visible stdout/stderr on failure
    package_env.py   -> packaged install setup and cleanup
```

### System Procedure

1. Before migration, run the existing JavaScript suite once and record that baseline in implementation notes.
2. Inventory current JS behavioral assertions and group them into Python test clusters.
3. Create `e2e/` as a uv project with pytest and wrapper commands.
4. Port shared CLI execution, isolated temporary project setup, fake HOME/XDG_CONFIG_HOME handling, and package install setup into Python helpers.
5. Port behavior assertions into clustered pytest files while preserving local/package reuse.
6. Update `package.json` and CI to call the `e2e/` wrappers.
7. Delete the JS E2E entrypoints after Python coverage is in place.
8. Run the new Python E2E suite as the migration success gate.

### Interfaces / APIs

- `pnpm test`: thin alias for the local E2E path.
- `pnpm test:local`: calls the `e2e/` local wrapper through uv.
- `pnpm test:package`: calls the `e2e/` packaged wrapper through uv.
- `e2e/run_e2e_local`: runs pytest against the working-tree CLI.
- `e2e/run_e2e_package`: prepares a packaged install, runs pytest against the installed CLI, and cleans up.

### Change Scope

Impact Areas:
- E2E test harness language and layout.
- npm test scripts and CI setup.
- Test documentation and developer testing instructions.
- Removal of obsolete JS E2E files once Python coverage is complete.

Planned File Changes:
- `e2e/`: add uv project, wrappers, helpers, fixtures, and clustered pytest files.
- `package.json`: keep existing script names but delegate to simple uv-backed wrappers.
- `.github/workflows/ci.yml`: add uv/Python setup and keep local/package job responsibilities.
- `test/test-integration.js`: delete after coverage is ported.
- `test/setup-package-env.js`: delete or replace with Python package setup in `e2e/`.
- `test/README.md`: update testing architecture and command documentation.
- `CONTEXT.md`: keep E2E Test Suite terminology aligned if implementation changes the final language.

### Edge Cases

- Missing uv, Python, npm, pnpm, or Node setup should fail immediately with a clear error.
- Packaged install failures should fail the package E2E wrapper and must not be reported as successful test completion.
- Temporary package environments and tarballs should be cleaned up on normal completion; cleanup errors should be visible rather than silently ignored when they affect later runs.
- Tests must not depend on the developer's real HOME, XDG config, global OpenCode/Codex config, or existing npm cache state except where explicitly configured.
- Local and packaged paths must both run against real CLI binaries, not helper functions or mocks.

### Verification Strategy

- Baseline: run the existing JavaScript suite before migration and record the passing command in `steps.md`.
- Migration gate: run `pnpm test:local` and `pnpm test:package` after the Python suite replaces the JS suite.
- CI gate: both local and packaged jobs run through the preserved npm entrypoints.
