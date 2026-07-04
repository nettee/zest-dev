# Journal

## 2026-07-04 - Execution start

- Created and activated spec `20260704-auto-publish-cli-version-ci`.
- Advanced the spec through research, design, and plan to `planned`.
- Starting implementation from Step 1, following the Plan order.
- Commit policy for this execution: commit after each completed step or meaningful phase progress, with commit messages prefixed by `journal:`.

## 2026-07-04 - Step 1 complete

- Added `scripts/ci/check-version-freshness.js` plus a small local test command for ahead, unchanged, behind, and invalid-version cases.
- Added a pull-request CI job in `.github/workflows/ci.yml` that fetches the base branch `package.json` and fails when a PR version change is not greater than base.
- Marked Step 1 complete in the spec progress checklist.

## 2026-07-04 - Step 2 complete

- Added `scripts/ci/should-bump-pr-version.js` and a local test command so PR automation can detect package-shipped CLI changes, skip manual version bumps, and avoid version-only rebump loops.
- Extended `.github/workflows/ci.yml` with a same-repo PR patch-bump job that runs `pnpm version patch --no-git-tag-version`, refreshes `pnpm-lock.yaml`, commits the bump, and pushes it back to the PR branch.
- Marked Step 2 complete in the spec progress checklist.
