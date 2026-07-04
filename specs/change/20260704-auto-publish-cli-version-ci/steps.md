# Steps

## Step 1

<!-- Implementation and verification notes for the matching Plan step. Add one section per Plan step. -->

## Step 2

- Added `scripts/ci/should-bump-pr-version.js` plus a local test command to detect package-shipped CLI changes, skip manual version bumps, and avoid version-only loop rebumping.
- Extended `.github/workflows/ci.yml` with a same-repository `pull_request` job that fetches the base branch, decides whether a patch bump is needed, runs `pnpm version patch --no-git-tag-version`, refreshes `pnpm-lock.yaml`, and pushes a single bump commit back to the PR branch.

## Step 3

- Added `scripts/ci/check-npm-version.js` plus a local test command so main-branch automation can detect whether `package.json`'s merged version already exists on npm and only treat 404/not-found as a skip-to-publish case.
- Added `.github/workflows/publish-npm.yml` as a dedicated push-to-main publish workflow that runs local and packaged tests, skips duplicate versions explicitly, and publishes with npm Trusted Publishing / GitHub OIDC provenance when the version is absent.

## Step 4

- Created and merged PR `#104` for the initial automation implementation, then configured npm Trusted Publisher settings for `nettee/zest-dev` with workflow filename `publish-npm.yml`.

## Step 5

- Real publish validation initially failed on `main` with a misleading npm `E404` during trusted publishing, even though provenance signing succeeded.
- Researched the failure, prepared remediation in PR `#105`, merged it, and confirmed the next `Publish npm` run successfully published `zest-dev@1.0.1`.

## Step 6

- Revalidated the version freshness helper locally and relied on the successful `publish-npm.yml` run's `pnpm test:local` execution plus the successful `zest-dev@1.0.1` publish as the EAG completion evidence.

## Step 7

- Updated `README.md` so npm publishing documentation matches the automated PR-bump, version freshness, and Trusted Publishing release flow.
