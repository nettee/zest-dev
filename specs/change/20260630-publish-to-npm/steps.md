# Steps

## Step 1

Completed release-readiness updates:
- Bumped package version from `0.1.0` to `0.1.1` because `zest-dev@0.1.0` already exists on npm.
- Changed `bin/zest-dev.js` to read `--version` from `package.json` instead of hardcoding it.
- Updated README Quick Start with npm install, `npx`, verification, and human-authorized publishing guidance.

Verification:
- Deferred full package validation to Step 2.

## Step 2

Completed package contents and E2E validation:
- Ran `npm pack --dry-run --json` for `zest-dev@0.1.1`.
- Inspected the tarball manifest: 39 entries, including `LICENSE`, `README.md`, `package.json`, `bin/`, `lib/`, `commands/`, `skills/`, `agents/`, `scripts/`, and `plugin/` content.
- Confirmed generated specs, E2E fixtures, caches, node modules, npm cache, and package tarballs are not in the package file list.
- Ran `pnpm test:local`: 22 passed, 1 skipped.
- Ran `pnpm test:package`: 23 passed.

Notes:
- Added `.npmignore` as an explicit ignore file, but npm still emitted its gitignore-fallback warning during dry-run. The published content remains controlled and verified through `package.json` `files` plus the dry-run manifest.
