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
