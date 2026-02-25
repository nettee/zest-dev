---
id: "003"
name: "Plugin Deployment Script"
status: implemented
created: "2026-02-11"
---

## Overview

**Problem**: The zest-spec project is a Claude Code plugin that needs to support multiple AI code editors (OpenCode and Cursor) in addition to Claude Code. Each editor has different directory structures and frontmatter requirements.

**Goal**: Create a deployment system that transforms and deploys plugin commands and skills to editor-specific directories with a single `zest-spec init` command.

**Why now**: To make zest-spec accessible to users of OpenCode and Cursor, expanding the plugin's reach beyond Claude Code.

## Research

### Current Project Structure

**Commands** (`plugin/commands/`):
- 4 files: new.md, research.md, design.md, implement.md
- Claude Code frontmatter format with fields: `description`, `argument-hint`, `allowed-tools`
- Body contains structured workflow steps with `$ARGUMENTS` placeholders

**Skills** (`plugin/skills/zest-spec/`):
- Single file: SKILL.md (comprehensive methodology guide)
- No transformation needed, can be copied directly

**CLI Architecture**:
- Entry point: `bin/zest-spec.js` using commander.js
- Business logic: `lib/spec-manager.js`
- Existing commands: status, show, create, set-current, unset-current
- No `init` command exists yet
- All commands output YAML format

### Target Editor Requirements

**Cursor & OpenCode**:
- Simplified frontmatter: only `description` field
- Commands must be prefixed with `zest-spec-` to avoid conflicts
- Directory structure: `.cursor/` and `.opencode/` in project root
- Skills can be copied without transformation

### Alternatives Considered

1. **Shell script vs Node.js**: Chose Node.js for consistency with existing codebase and better YAML handling
2. **npm script vs CLI command**: Chose CLI command for discoverability and consistency
3. **Template engine vs string manipulation**: Chose string manipulation for simplicity

## Design

### Architecture

**New Module**: `lib/plugin-deployer.js`
- Contains all deployment logic
- Follows existing pattern from `spec-manager.js`
- Exports single function: `deployPlugin()`

**CLI Integration**: `bin/zest-spec.js`
- Add new `init` command
- Follow existing commander.js pattern
- Output YAML format grouped by target

### Key Components

**1. Frontmatter Transformation**:
```
Input:  { description, argument-hint, allowed-tools }
Output: { description }
```
- Remove `argument-hint` and `allowed-tools` fields
- Keep only `description`
- Same transformation for both Cursor and OpenCode

**2. File Naming**:
- Source: `plugin/commands/new.md`
- Cursor: `.cursor/commands/zest-spec-new.md`
- OpenCode: `.opencode/commands/zest-spec-new.md`
- Both targets use same prefix: `zest-spec-`

**3. Skills Deployment**:
- Direct recursive copy of `plugin/skills/zest-spec/`
- Target: `.cursor/skills/zest-spec/` and `.opencode/skills/zest-spec/`
- No transformation needed

**4. Output Format** (grouped by target):
```yaml
ok: true
cursor:
  commands: [zest-spec-new.md, zest-spec-research.md, ...]
  skills: [zest-spec/]
opencode:
  commands: [zest-spec-new.md, zest-spec-research.md, ...]
  skills: [zest-spec/]
```

**5. Idempotency**:
- Use `fs.mkdirSync(path, { recursive: true })` for directories
- Use `fs.writeFileSync()` to overwrite files
- Multiple runs produce identical results

### Error Handling

- Validate `plugin/` directory exists
- Catch filesystem errors (EACCES, ENOENT) with helpful messages
- Handle malformed YAML gracefully

## Plan

- [x] Phase 1: Core Module Implementation
  - [x] Create `lib/plugin-deployer.js`
  - [x] Implement frontmatter parsing (reuse pattern from spec-manager.js)
  - [x] Implement frontmatter transformation function
  - [x] Implement markdown file writer with frontmatter
  - [x] Implement directory creation with recursive option
  - [x] Implement commands deployment (with prefix for both targets)
  - [x] Implement skills deployment (recursive copy)
  - [x] Implement main orchestration function with error handling

- [x] Phase 2: CLI Integration
  - [x] Import `deployPlugin` in bin/zest-spec.js
  - [x] Add `init` command using commander.js pattern
  - [x] Wire up action handler with YAML output

- [x] Phase 3: Testing & Verification
  - [x] Run `zest-spec init` and verify YAML output format
  - [x] Verify 4 commands deployed to `.cursor/commands/` with prefix
  - [x] Verify 4 commands deployed to `.opencode/commands/` with prefix
  - [x] Verify skills deployed to both `.cursor/skills/` and `.opencode/skills/`
  - [x] Verify frontmatter transformation (only description field)
  - [x] Verify content preservation (body unchanged)
  - [x] Test idempotency (run init twice, verify same result)

## Implementation Summary

**Files Created**:
- `lib/plugin-deployer.js` (218 lines) - Core deployment module

**Files Modified**:
- `bin/zest-spec.js` - Added init command integration

**Key Functions Implemented**:
- `parseMarkdownWithFrontmatter()` - Parse YAML frontmatter and separate content
- `transformFrontmatter()` - Remove Claude Code specific fields
- `writeMarkdownWithFrontmatter()` - Serialize and write complete file
- `ensureDirectories()` - Create target directories
- `copyDirectoryRecursive()` - Recursive directory copy
- `deployCommands()` - Deploy and transform command files
- `deploySkills()` - Copy skill files
- `deployPlugin()` - Main orchestration with error handling

**Test Results**:
- ✅ All 4 commands deployed with correct prefix to both targets
- ✅ Skills deployed to both targets
- ✅ Frontmatter correctly transformed (only description field)
- ✅ Content body preserved exactly
- ✅ Idempotent (multiple runs produce identical results)
- ✅ Output format grouped by target as specified

**Usage**:
```bash
zest-spec init
```

**Deployed Structure**:
```
.cursor/commands/zest-spec-{new,research,design,implement}.md
.cursor/skills/zest-spec/SKILL.md
.opencode/commands/zest-spec-{new,research,design,implement}.md
.opencode/skills/zest-spec/SKILL.md
```

## Notes

**Design Decisions**:
- Used Node.js instead of shell script for YAML handling and consistency
- Followed existing `spec-manager.js` pattern for frontmatter parsing
- Chose file overwriting for idempotency (simpler than checking/merging)
- Both Cursor and OpenCode use same frontmatter format (only description)
- All command files use `zest-spec-` prefix for both targets (user correction)

**Future Enhancements**:
- Could add `--target` flag to deploy to specific editor only
- Could add `--dry-run` flag to preview changes
- Could add validation to check if deployed files are out of sync with source

**Status**: ✅ Completed and tested successfully
