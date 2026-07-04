# Steps

## Step 1

Completed release-readiness updates:
- Bumped package version from `0.1.0` to `0.1.1` because `zest-dev@0.1.0` already exists on npm; later retargeted the release to `1.0.0` by Human request.
- Changed `bin/zest-dev.js` to read `--version` from `package.json` instead of hardcoding it.
- Updated README Quick Start with npm install, `npx`, verification, and human-authorized publishing guidance.

Verification:
- Deferred full package validation to Step 2.

## Step 2

Completed package contents and E2E validation:
- Ran `npm pack --dry-run --json` for `zest-dev@0.1.1`, then reran it for `zest-dev@1.0.0` after the Human retargeted the release version.
- Inspected the tarball manifest: 39 entries, including `LICENSE`, `README.md`, `package.json`, `bin/`, `lib/`, `commands/`, `skills/`, `agents/`, `scripts/`, and `plugin/` content.
- Confirmed generated specs, E2E fixtures, caches, node modules, npm cache, and package tarballs are not in the package file list.
- Ran `pnpm test:local`: 22 passed, 1 skipped.
- Ran `pnpm test:package`: 23 passed.
- After retargeting to `1.0.0`, reran `node bin/zest-dev.js --version`: `1.0.0`.
- After retargeting to `1.0.0`, reran `npm pack --dry-run --json`: package `zest-dev@1.0.0`, 39 entries.
- After retargeting to `1.0.0`, reran `pnpm test:local`: 22 passed, 1 skipped.
- After retargeting to `1.0.0`, reran `pnpm test:package`: 23 passed.

Notes:
- Added `.npmignore` as an explicit ignore file, but npm still emitted its gitignore-fallback warning during dry-run. The published content remains controlled and verified through `package.json` `files` plus the dry-run manifest.
- The release target is now `1.0.0`.

## Step 3

Status: awaiting Human release authorization.

AI summary for Human review:
- Package: `zest-dev`
- Current repository version: `1.0.0`
- Current npm latest version: `0.1.0`
- Proposed npm dist-tag: `latest`
- Proposed registry: default public npm registry
- Provenance: not included in the first manual publish command unless Human explicitly requires it
- Proposed publish command for Step 4: `npm publish`

Human must confirm before Step 4:
- They control or can publish to the npm package `zest-dev`.
- `1.0.0` is the intended release version.
- Publishing to the default public npm registry under `latest` is intended.
- Manual publish without provenance is acceptable, or they explicitly request a provenance/trusted-publishing path instead.
- They are ready to handle npm login, OTP, or access-token prompts locally.
