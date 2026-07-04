# Steps

## Step 1

<!-- Implementation and verification notes for the matching Plan step. Add one section per Plan step. -->

## Step 2

- Added `scripts/ci/should-bump-pr-version.js` plus a local test command to detect package-shipped CLI changes, skip manual version bumps, and avoid version-only loop rebumping.
- Extended `.github/workflows/ci.yml` with a same-repository `pull_request` job that fetches the base branch, decides whether a patch bump is needed, runs `pnpm version patch --no-git-tag-version`, refreshes `pnpm-lock.yaml`, and pushes a single bump commit back to the PR branch.

## Step 3

- Added `scripts/ci/check-npm-version.js` plus a local test command so main-branch automation can detect whether `package.json`'s merged version already exists on npm and only treat 404/not-found as a skip-to-publish case.
- Extended `.github/workflows/ci.yml` with a push-to-main publish job that waits for the existing test jobs, reuses the repo's pnpm/node setup, skips duplicate versions explicitly, and publishes with `NODE_AUTH_TOKEN`-based npm auth when the version is absent.
