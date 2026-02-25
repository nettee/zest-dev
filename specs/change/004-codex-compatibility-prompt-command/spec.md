---
id: "004"
name: "Codex Compatibility Prompt Command"
status: implemented
created: "2026-02-11"
---

## Overview

**Problem**: Codex editor doesn't support project-level commands (like `/new`, `/research`, etc.) that Claude Code, Cursor, and OpenCode support via plugin systems.

**Solution**: Add a `zest-spec prompt` CLI command that generates formatted prompts for launching Codex with appropriate instructions for each workflow phase.

**Why it matters**: Enables Codex users to leverage the same spec-driven workflow by launching the editor with pre-formatted prompts via command substitution: `codex $(zest-spec prompt new "task")`

**Scope**:
- CLI command to generate prompts from existing command files
- Support all workflow phases: new, research, design, implement, summarize
- Strip YAML frontmatter for plain text output
- Documentation updates for Codex users

## Research

### Existing System
- Plugin commands stored in `plugin/commands/*.md` with YAML frontmatter
- Commands work via slash syntax in Claude Code/Cursor/OpenCode
- Codex doesn't have plugin/command infrastructure

### Options Evaluated
1. **Separate CLI commands** (e.g., `zest-spec codex-new`, `zest-spec codex-research`)
   - Pro: Explicit and clear
   - Con: Maintenance burden, duplicates command logic

2. **Single `prompt` command with subcommands** (recommended)
   - Pro: Reuses existing command files, maintainable, extensible
   - Con: None significant

3. **Generate shell scripts**
   - Pro: Could be sourced directly
   - Con: More complex, platform-specific issues

### Recommendation
Use `zest-spec prompt <command> [args...]` that reads existing command markdown files, strips frontmatter, and outputs plain text prompts suitable for shell command substitution.

### Key Decisions
- **Reuse command files**: No duplication, single source of truth
- **Strip frontmatter**: Codex doesn't need YAML metadata
- **Plain text output**: Works with command substitution `$(...)` pattern

## Design

### Architecture
```
CLI Command
    ↓
prompt-generator.js
    ↓
Read plugin/commands/*.md → Strip YAML → Replace $ARGUMENTS → Output
```

### Implementation Steps
1. **Create prompt generator module** (`lib/prompt-generator.js`)
   - Function: `generatePrompt(command, args)`
   - Read command file from `plugin/commands/<command>.md`
   - Strip YAML frontmatter (between `---` markers)
   - Replace `$ARGUMENTS` placeholder with actual args
   - Return plain text prompt

2. **Add CLI command** (`bin/zest-spec.js`)
   - Command: `prompt <command> [args...]`
   - Import prompt generator
   - Handle variadic args (join into string)
   - Output prompt to stdout
   - Error handling for invalid commands

3. **Update documentation**
   - Add Codex integration section to CLAUDE.md
   - Add usage examples to README.md
   - Update command reference table

### Pseudocode: Prompt Generator
```
Function generatePrompt(command, args):
  Validate command in [new, research, design, implement, summarize]
  Construct path: plugin/commands/{command}.md
  Read file content
  Strip YAML frontmatter using regex: /^---\n[\s\S]*?\n---\n/
  Replace $ARGUMENTS with args
  Trim whitespace
  Return prompt text
```

### Files to Modify
- `lib/prompt-generator.js` (create) - Core prompt generation logic
- `bin/zest-spec.js` - Add new CLI command
- `CLAUDE.md` - Add Codex integration docs
- `README.md` - Add usage examples

### Edge Cases
- Invalid command name → Error with valid options list
- Missing command file → Error with file path
- Empty args for commands that need them → Empty string (graceful)

## Plan

**Phase 1: Core Implementation**
- [x] Create `lib/prompt-generator.js` module
  - [x] Implement `generatePrompt(command, args)` function
  - [x] Read command files from plugin directory
  - [x] Strip YAML frontmatter with regex
  - [x] Replace `$ARGUMENTS` placeholder
  - [x] Add validation for command names
- [x] Update `bin/zest-spec.js` CLI
  - [x] Import prompt generator module
  - [x] Add `prompt <command> [args...]` command
  - [x] Handle variadic arguments correctly
  - [x] Add error handling and exit codes

**Phase 2: Documentation**
- [x] Update CLAUDE.md
  - [x] Add Codex integration section
  - [x] Add usage examples
  - [x] Update command reference table
- [x] Update README.md
  - [x] Add prompt command documentation
  - [x] Add Codex usage examples
  - [x] Position after existing commands

**Phase 3: Testing & Verification**
- [x] Test prompt generation for all commands
  - [x] `prompt new "task description"` - works correctly
  - [x] `prompt research` - outputs research prompt
  - [x] `prompt design` - outputs design prompt
  - [x] `prompt implement` - outputs implement prompt
  - [x] `prompt summarize` - outputs summarize prompt
- [x] Test error handling
  - [x] Invalid command name - shows error with valid options
- [x] Verify output format
  - [x] YAML frontmatter stripped
  - [x] $ARGUMENTS replaced correctly
  - [x] Plain text suitable for command substitution

### Files Created/Modified
- `lib/prompt-generator.js` (created, ~30 lines) - Prompt generation logic
- `bin/zest-spec.js` (modified) - Added prompt command and import
- `CLAUDE.md` (modified) - Added Codex integration section
- `README.md` (modified) - Added prompt command documentation

### Implementation Summary
**Key Components**:
- `generatePrompt()`: Core function that reads command files, strips frontmatter, replaces placeholders
- CLI integration: New `prompt` command with proper arg handling
- Validation: Checks for valid command names and file existence

**Test Results**:
- All 5 commands generate correct prompts
- Error handling works for invalid commands
- Output format is clean and suitable for Codex

**Current Status**: ✅ Complete and working

## Notes

### Design Decisions
- **Reuse existing command files**: Avoids duplication and ensures consistency with other editors. Single source of truth for all command documentation.
- **Strip YAML frontmatter**: Codex doesn't understand or need the metadata (description, allowed-tools, etc.), so we output only the markdown content.
- **Plain text output**: Enables shell command substitution pattern `codex $(zest-spec prompt new "task")`, which is natural and composable.
- **Variadic args**: Allows multi-word task descriptions without quoting complexity: `prompt new add user auth` works correctly.

### What Worked Well
- Simple implementation (~30 lines) leveraging existing infrastructure
- No changes needed to existing command files
- Consistent behavior across all commands
- Error messages are clear and helpful

### Future Enhancements
- Could add `--json` flag for structured output if other editors need it
- Could support custom template paths for user-defined commands
- Could add `--list` to show available commands

### Related Files
- `lib/prompt-generator.js:8-28` - Core prompt generation logic
- `bin/zest-spec.js:9` - Import statement
- `bin/zest-spec.js:108-120` - CLI command definition
- `plugin/commands/*.md` - Source command files
