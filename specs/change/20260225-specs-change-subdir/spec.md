---
id: 20260225-specs-change-subdir
name: Specs Change Subdir
status: implemented
created: '2026-02-25'
---

## Overview

Reorganize the spec storage location from the root `specs/` directory to a `specs/change/` subdirectory. This makes room for future sibling subdirectories under `specs/` (e.g. `specs/adr/`, `specs/rfcs/`) without cluttering the top-level folder.

**Goals:**
- Move all existing spec directories under `specs/change/`
- Update the CLI (`SPECS_DIR`) to point to the new path
- Keep tests and docs in sync

**Scope:** All existing spec dirs, CLI source, tests, CLAUDE.md, README.md.

**Success Criteria:** `zest-dev status`, `create`, `show`, `set-current`, `update` all work from the new path.

## Research

Identified all files referencing `specs/`:

| File | Reference type |
|---|---|
| `lib/spec-manager.js` | `SPECS_DIR = 'specs'` constant |
| `test/test-integration.js` | 4 hardcoded path assertions |
| `CLAUDE.md` | Documentation text |
| `README.md` | Directory tree diagram |

The `current` symlink lives inside `SPECS_DIR`, so it automatically moved with the rest of the spec dirs — no extra handling needed.

## Design

Single-constant change: `SPECS_DIR = 'specs'` → `'specs/change'`. All downstream paths (`CURRENT_LINK`, `getSpecFilePath`, `createSpec`, `setCurrentSpec`) derive from that constant, so no other logic changes were required.

## Notes

### Implementation

- `lib/spec-manager.js:6` — `SPECS_DIR` changed to `'specs/change'`
- `test/test-integration.js:198,202,238,242` — 4 path strings updated (via `replace_all`)
- `CLAUDE.md` — doc line updated
- `README.md` — directory tree updated to show `specs/change/` nesting
- Physical move: `mv specs/[0-9]* specs/change/`

### Verification

Manually verified `zest-dev create` writes to `specs/change/` and `zest-dev set-current` / `zest-dev show current` resolve correctly after the move.
