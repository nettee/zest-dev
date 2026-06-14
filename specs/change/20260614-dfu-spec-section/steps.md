# Steps

## Step 1

- Added `## Deferred Follow-Ups (DFU)` to the built-in main Spec template after `## Implementation`.
- Updated Zest Dev workflow guidance so Design owns DFU, Plan excludes DFU from Progress, Implement does not append DFU, and the final documentation Plan step is named Documentation Sync.
- Added glossary entries for Deferred Follow-Ups (DFU) and Documentation Sync.
- Verified with `pnpm test:local` and `pnpm test:package`.

## Step 2

- Added a fixed DFU Ralph task after the existing PR task in `lib/ralph-setup.js`.
- Updated Ralph E2E fixtures and assertions to expect the extra task.
- Verified with `pnpm test:local` and `pnpm test:package`.

## Step 3

- Updated deployed skill assertions and spec lifecycle tests for the new DFU section and Documentation Sync wording.
- No extra project docs beyond glossary and skill workflow docs were needed.
- Verified with `pnpm test:local` and `pnpm test:package`.
