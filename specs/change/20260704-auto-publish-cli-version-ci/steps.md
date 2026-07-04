# Steps

## Step 1

<!-- Implementation and verification notes for the matching Plan step. Add one section per Plan step. -->

## Step 2

- Added `scripts/ci/should-bump-pr-version.js` plus a local test command to detect package-shipped CLI changes, skip manual version bumps, and avoid version-only loop rebumping.
- Extended `.github/workflows/ci.yml` with a same-repository `pull_request` job that fetches the base branch, decides whether a patch bump is needed, runs `pnpm version patch --no-git-tag-version`, refreshes `pnpm-lock.yaml`, and pushes a single bump commit back to the PR branch.
