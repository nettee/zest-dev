# Journal

## Step 1 (AFK): Release Readiness Fixes

Status: completed.

Actions:
- Reviewed the planned npm publish spec and release-readiness scope.
- Confirmed the existing public npm package version is `zest-dev@0.1.0`, so the repository package version must move forward before publish.
- Bumped `package.json` to `0.1.1`.
- Updated the CLI version wiring so `zest-dev --version` reads from `package.json`.
- Updated README Quick Start with npm installation, `npx`, version/help verification, and pre-publish validation commands.

Notes:
- Full tarball inspection and E2E validation are intentionally left for Step 2.
- Actual npm publish remains blocked behind HITL authorization and publish steps.
