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

## 2026-07-04 - Step 3 complete

- Added `scripts/ci/check-npm-version.js` and a local test command so main-branch CI can distinguish an already-published version from required publish/auth/network failures.
- Extended `.github/workflows/ci.yml` with a push-to-main publish job that waits for the existing test jobs, skips duplicate npm versions explicitly, and runs `npm publish --access public` with `NODE_AUTH_TOKEN`-based auth when publish is required.
- Marked Step 3 complete in the spec progress checklist.

## 2026-07-04 - Step 4 handoff

- AFK implementation through Step 3 is complete and committed locally.
- Waiting on Human review, repository secret setup, and PR merge decisions before continuing to real GitHub/npm validation.

## 2026-07-04 - Step 4 PR created

- Created PR: https://github.com/nettee/zest-dev/pull/104
- PR body documents local validation and the required `NPM_TOKEN` repository secret setup.
- The PR patch-bump workflow ran on the PR branch and created `ci: auto bump patch version`, updating `package.json` to `1.0.1`.

## 2026-07-04 - Step 4 publish auth revised

- Switched the publish workflow from expiring `NPM_TOKEN` secret auth to npm Trusted Publishing / GitHub OIDC.
- The publish job now requests `id-token: write` and runs `npm publish --access public --provenance` when the version is absent from npm.
- Human setup changed from configuring a repository secret to adding a trusted publisher for repository `nettee/zest-dev` and workflow `ci.yml` in npm package settings.
- Corrected the OIDC `id-token: write` permission so it belongs only to the `publish-npm` job.

## 2026-07-04 - Step 4 publish workflow split

- Moved npm publishing out of `.github/workflows/ci.yml` into dedicated `.github/workflows/publish-npm.yml`.
- Trusted Publisher setup should now use workflow filename `publish-npm.yml`, keeping CI and release permissions separate.

## 2026-07-04 - Step 4 Trusted Publisher configured

- Human configured npm Trusted Publisher for `nettee/zest-dev` with workflow filename `publish-npm.yml`.
- npm shows publish permissions for the trusted publisher, so no expiring `NPM_TOKEN` secret is needed.

## 2026-07-04 - Step 5 publish validation failed

- PR #104 was merged to `main` as merge commit `c65782e`.
- The `Publish npm` workflow ran on `main` and failed in the `npm publish --access public --provenance` step.
- Provenance signing reached npm successfully, but the final registry publish failed with `npm error code E404` and `404 Not Found - PUT https://registry.npmjs.org/zest-dev - Not found`.
- `npm view zest-dev version --json` still reports `1.0.0`, while merged `package.json` is `1.0.1`; publish is not complete.
- `npm owner ls zest-dev` reports package owner `nettee <anchori@163.com>`.
- External research is in progress to identify the exact Trusted Publishing remediation before rerunning the release.

## 2026-07-04 - Step 5 remediation prepared

- Prepared a follow-up fix branch after research identified three high-probability causes for misleading Trusted Publishing 404s.
- Removed `registry-url` from `actions/setup-node` in `publish-npm.yml` so GitHub Actions does not inject `_authToken` config that can block OIDC publishing.
- Upgraded the publish workflow runtime to Node `22.14.0` and npm `^11.5.1`, matching current npm Trusted Publishing requirements.
- Normalized `package.json.repository` to `{ type: "git", url: "git+https://github.com/nettee/zest-dev.git" }` so published metadata matches the GitHub repo exactly.

## 2026-07-04 - Step 5 remediation PR created

- Created follow-up PR: https://github.com/nettee/zest-dev/pull/105
- This PR is intended to unblock a rerun of the `Publish npm` workflow so the real release validation can continue.
