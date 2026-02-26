---
id: 20260224-date-based-spec-naming
name: Date Based Spec Naming
status: implemented
created: '2026-02-24'
---

## Overview

### Problem Statement
- Current spec naming uses sequential numeric IDs (`[id]-[slug]`, e.g. `001-init-project`), which conflict in team environments where multiple contributors create specs concurrently
- No global coordination mechanism exists to prevent ID collisions across branches or forks

### Terminology
- **spec id**: `[date]-[slug]` — the unique directory name and CLI identifier (e.g. `20260224-my-feature`)
- **spec name**: human-readable title (e.g. `My Feature`)

### Goals
- Replace numeric ID prefix with date prefix so spec ids no longer conflict across team branches
- `zest-dev create <slug>` generates a date-based spec id (`YYYYMMDD-slug`)
- All CLI commands that previously took a 3-digit numeric id now take the full date-based spec id
- CLI output: `id` field value changes from `'005'` to `'20260224-slug'`; `name` field (human-readable) is unchanged

### Scope
**In scope:**
- New spec directory naming format: `YYYYMMDD-slug`
- CLI commands updated to reference spec by id (`show`, `set-current`, `update`)
- `id` frontmatter field value changes from numeric (`"005"`) to date-slug (`"20260224-slug"`)
- All plugin prompts and documentation updated to use correct terminology

**Out of scope:**
- Migration of existing specs to the new naming format

## Research

### Existing System

**Core logic — `lib/spec-manager.js`:**
- `getSpecDirs()` filters `specs/` with regex `/^\d{3}-/` — only 3-digit-prefix directories recognized
- `parseSpecId(dirName)` extracts the 3-digit prefix: `/^(\d{3})-/`
- `parseSpecName(dirName)` strips `^\d{3}-` and title-cases the remainder
- `createSpec()` generates sequential IDs: reads last dir, `parseInt` + 1, zero-pads to 3 digits
- "Current" spec stored as a symlink at `specs/current` pointing to spec dir; ID recovered via `parseSpecId(basename(linkTarget))`
- `getSpec()` matches dirs by `parseSpecId(dir) === specId`
- `setCurrentSpec(specId)` looks up dir by numeric ID, creates symlink

**CLI — `bin/zest-dev.js`:**
- `show <spec>`: accepts numeric ID or `"current"`
- `set-current <spec>`: accepts numeric ID only (no `"current"`)
- `update <spec> <status>`: accepts numeric ID or `"current"`
- All output includes an `id` field (e.g. `spec.id: "001"`)

**Templates — `lib/template/spec.md` and `.zest-dev/template/spec.md`:**
- Both use `{id}`, `{name}`, `{date}` placeholders; `id` frontmatter field is written at create time

**Tests — `test/test-integration.js`:**
- Hardcoded path assertions: `specs/001-default-template/spec.md`, `specs/002-custom-template/spec.md`
- Hardcoded `frontmatter.id === '001'`, `frontmatter.id === '002'`
- `set-current 002`, `show 001`, `update '001' <status>` — all use numeric IDs
- Error message regex includes `spec 001`

**Plugin/docs — `plugin/commands/*.md`, `plugin/skills/zest-dev/SKILL.md`, `CLAUDE.md`:**
- All reference `<spec-id>` in command examples and workflow instructions

### Key Constraints
- The symlink approach for "current" works with any directory name — no change needed there
- The `id` frontmatter field is only written at create time and never read back by the CLI; safe to remove
- Tests are the most invasive part — all numeric ID assumptions must be replaced with date-format equivalents

## Design

### New spec naming format

```
specs/
  20260224-init-project/
    spec.md
  20260225-add-auth/
    spec.md
  current -> (symlink, unchanged)
```

`create <slug>` generates: `YYYYMMDD-slug` using today's date. If a name collision occurs (same date+slug on same day), raise an error (rare; the user can adjust the slug).

### CLI command changes

```
zest-dev show <spec-id|current>
zest-dev set-current <spec-id>
zest-dev update <spec-id|current> <status>
zest-dev create <slug>           # slug only; id = YYYYMMDD-slug generated automatically
zest-dev create-branch           # unchanged — uses current symlink
```

### Output field changes

`id` field value changes from 3-digit number to full date-slug. `name` (human-readable title) is unchanged.

```yaml
# Before
spec:
  id: '005'
  name: Date Based Spec Naming
  path: specs/005-date-based-spec-naming/spec.md

# After
spec:
  id: 20260224-date-based-spec-naming
  name: Date Based Spec Naming
  path: specs/20260224-date-based-spec-naming/spec.md
```

### Frontmatter changes

Remove the `id: "{id}"` line from both template files. Frontmatter after:

```yaml
---
name: "{name}"
status: new
created: "{date}"
---
```

The `{id}` template placeholder and its replacement logic are removed.

### `lib/spec-manager.js` — specific changes

1. `getSpecDirs()`: regex `/^\d{3}-/` → `/^\d{8}-/`
2. Remove `parseSpecId()` — id is now the full dir name, no prefix parsing needed
3. `parseSpecName()`: strip `^\d{8}-` instead of `^\d{3}-`
4. `getCurrentSpecId()`: return `path.basename(linkTarget)` (full dir name) instead of parsed 3-digit prefix
5. All dir lookups: `specDirs.find(dir => dir === specId)` instead of matching by parsed prefix
6. `createSpec()`: generate `datePrefix = YYYYMMDD`, dir name = `${datePrefix}-${slug}`, remove `{id}` template substitution, return `id: specDirName`
7. `getSpecSlug()`: strip `^\d{8}-` instead of `^\d+-`

### Test changes (`test/test-integration.js`)

- Parse create output (`result.spec.id`) for the actual spec id — no hardcoded `001`/`002` paths
- Assert id format: `/^\d{8}-slug$/`
- Assert `frontmatter.id === undefined` (id removed from frontmatter)
- Error message regex uses `\S+` instead of literal `001`

### Plugin/docs changes

Update all plugin command and doc files to use `<spec-id>` (date-slug format) for the identifier argument:
- `plugin/commands/new.md`, `research.md`, `design.md`, `implement.md`, `summarize.md`, `compound.md`, `quick-implement.md`
- `plugin/skills/zest-dev/SKILL.md`
- `CLAUDE.md`

## Plan

<!-- Optional: Phase breakdown for complex features that need multiple implementation phases.
     Decided during Design. Checked off during Implement. -->

## Notes

<!-- Optional sections — add what's relevant. -->

### Implementation

<!-- Files created/modified, decisions made during coding, deviations from design -->

### Verification

<!-- How the feature was verified: tests written, manual testing steps, results -->
