---
id: "002"
name: "Replace Lean Spec"
status: complete
created: "2026-02-10"
---

## Overview

The zest-spec CLI is developed to replace the lean-spec CLI.

Remove all lean-spec related files and code in this project.

## Research

Found all lean-spec references in the project:

1. **CLAUDE.md** - Command table and workflow instructions
2. **.claude/settings.local.json** - Permission settings for lean-spec commands
3. **.lean-spec/** - Old configuration directory with config.json and templates

## Design

Replace lean-spec with zest-spec following the actual CLI design from spec 001:

- `lean-spec board` → `zest-spec status`
- `lean-spec view <spec>` → `zest-spec show <spec-id>`
- `lean-spec create <name>` → `zest-spec create <spec-name>`
- Remove commands not yet implemented in zest-spec (search, update, link)
- Add new zest-spec commands (set-current, unset-current)

## Plan

- [x] Search for all lean-spec references in the project
- [x] Update CLAUDE.md with zest-spec commands and workflow
- [x] Update .claude/settings.local.json permissions
- [x] Remove .lean-spec directory and its contents
- [x] Verify zest-spec CLI still works correctly

## Notes

The zest-spec template already exists at `.zest-spec/template/spec.md`, so no template migration was needed.
