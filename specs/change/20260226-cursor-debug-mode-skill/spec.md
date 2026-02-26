---
id: 20260226-cursor-debug-mode-skill
name: Cursor Debug Mode Skill
status: implemented
created: '2026-02-26'
---

## Portable Cursor's Debug Mode in Claude Code as a Skill

Cursor's Debug Mode is a powerful tool: https://cursor.com/blog/debug-mode

I want to make it available in Claude Code as a skill.

Conversations reference: [cursor-debug-mode-conversations](./cursor-debug-mode-conversations/)

## Research

### Cursor Debug Mode Workflow (from blog + conversations)

Cursor's Debug Mode is a 3-phase human-in-the-loop debugging workflow:

1. **Describe Bug** — User describes the bug; agent reads codebase and generates multiple hypotheses about root causes
2. **Reproduce Bug** — Agent instruments code with logging; user reproduces bug; agent collects runtime evidence
3. **Verify Fix** — Agent analyzes logs, identifies root cause, proposes fix; user verifies; if rejected, loop back to step 2 with more logging; if confirmed, agent removes all instrumentation

Key characteristics:
- Hypothesis-driven: Agent generates 3-5 numbered hypotheses before adding any logs
- Each log is tagged with which hypothesis it tests
- Uses `<reproduction_steps>` to give user clear instructions
- Structured hypothesis evaluation: CONFIRMED/REJECTED with evidence
- Minimal fixes: Typically 2-3 line changes, not speculative rewrites
- Clean removal of all instrumentation after fix is verified

### Conversation Patterns Observed

From the 5 reference conversations, the consistent pattern is:

- **Instrumentation style**: `#region agent log` / `#endregion` markers wrapping `fetch()` calls to a log ingestion server (`http://127.0.0.1:7242/ingest/...`)
- **Log payload structure**: `{ location, message, data, timestamp, sessionId, hypothesisId }`
- **Hypothesis format**: Labeled A-E (or H1-H5), each with a one-line description
- **Reproduction format**: `<reproduction_steps>` with numbered steps
- **Analysis format**: Structured evaluation section with emoji indicators per hypothesis
- **Fix presentation**: Root cause summary + minimal code change + verification steps

### Existing Plugin System

- Skills live in `plugin/skills/<skill-name>/SKILL.md` with YAML frontmatter (`name`, `description`, `version`)
- Commands live in `plugin/commands/<name>.md` with frontmatter (`description`, `argument-hint`, `allowed-tools`)
- Agents live in `plugin/agents/<name>.md` with frontmatter (`name`, `description`, `tools`, `model`, `color`)
- Deployment: `zest-dev init` copies skills/commands to `.cursor/` and `.opencode/` directories
- Currently only one skill directory exists: `plugin/skills/zest-dev/`

### Available Approaches

- **Option A: Skill only** — Create a new `SKILL.md` that provides debug mode guidance when triggered by keywords like "debug mode", "debug this bug"
- **Option B: Command only** — Create a new command (e.g., `/debug`) that the user invokes explicitly to start a debug session
- **Option C: Skill + Command** — Skill provides the methodology knowledge; command provides the step-by-step workflow (similar to how zest-dev skill + research/design/implement commands work together)
- **Option D: Skill + Command + Agent** — Add a specialized debug agent for log analysis

### Constraints

- Claude Code's tool system differs from Cursor: no built-in log ingestion server; logging must use `console.log`, file-based logs, or terminal output
- Claude Code skills are loaded as context/instructions, not as executable code — the skill guides the LLM's behavior
- The `allowed-tools` frontmatter in commands constrains which tools the command can use
- The skill `description` field is critical for triggering — it determines when the skill gets activated
- Plugin deployer currently hardcodes `plugin/skills/zest-dev` as the only skills source directory (`plugin-deployer.js:138`)

### Key References

- `plugin/skills/zest-dev/SKILL.md` — Existing skill structure and content pattern
- `plugin/commands/research.md` — Multi-step workflow command with agent orchestration
- `plugin/commands/implement.md` — Implementation workflow command pattern
- `plugin/agents/code-explorer.md` — Agent definition pattern
- `lib/plugin-deployer.js:137-157` — Skills deployment (currently only `zest-dev` directory)
- `specs/change/20260226-cursor-debug-mode-skill/cursor-debug-mode-conversations/` — 5 real Cursor debug mode sessions as reference

## Design

### Approach: Skill + Command (Option C)

Skill holds methodology knowledge (what & why); command holds the step-by-step workflow (how). Server script ships as a separate file (`plugin/skills/debug-mode/server.js`) that the deployer copies alongside `SKILL.md`; the command copies it into the project's `.debug-mode/` directory. This mirrors how `zest-dev/SKILL.md` + `research.md`/`design.md`/`implement.md` work together.

### Architecture

```
User: /debug-mode "cart total wrong after coupon"
        │
        ▼
  debug-mode.md command (9-step procedure)
        │
        ├─ Step 2: Read codebase (Grep, Read)
        ├─ Step 3: Generate H1-H5 hypotheses → present to user
        ├─ Step 4: Copy server.js from plugin skill dir → .debug-mode/server.js
        │          Start server: node .debug-mode/server.js 3333 &
        ├─ Step 5: Instrument code with fetch() calls tagged by hypothesisId
        │          Ask user to reproduce
        ├─ Step 6: Read .debug-mode/debug.log → evaluate H1-H5
        ├─ Step 7: Propose minimal fix → user approves
        ├─ Step 8: User verifies → if fails, loop to Step 5
        └─ Step 9: Remove ALL instrumentation + .debug-mode/
```

### File Structure

**Create:**
- `plugin/skills/debug-mode/SKILL.md` — Methodology, log format, instrumentation patterns
- `plugin/skills/debug-mode/server.js` — Debug log ingestion server (copied into project at runtime)
- `plugin/commands/debug-mode.md` — 9-step workflow procedure

**Modify:**
- `lib/plugin-deployer.js` — Generalize `deploySkills()` to enumerate all subdirs of `plugin/skills/`

### Key Design Decisions

**Server script as a separate file** (`plugin/skills/debug-mode/server.js`). Deployer copies it alongside SKILL.md via `copyDirectoryRecursive()`. The command copies it into the project: `cp <deployed-skill-dir>/server.js .debug-mode/server.js`. No agent-generated code needed.

**Extended log format**: `{ hypothesisId, location, message, data }` → server writes lines as:
```
[ISO_TIMESTAMP] [H1] fn-name:entry | state captured | {"key":"value"}
```

**Deployer generalization**: Replace hardcoded `plugin/skills/zest-dev` with dynamic enumeration of all subdirs in `plugin/skills/`. Same pattern as `deployCommands()` already uses for command files.

**Command allowed-tools**: Unrestricted `Bash` (not `Bash(zest-dev:*)`) because the command must run `node`, `curl`, `pkill`, `cat`, `rm`.

**`.debug-mode/` gitignore**: Command Step 4 adds `.debug-mode/` to `.gitignore` if not already present.

### Skill Content (pseudocode outline)

```
Frontmatter: name=debug-mode, description=[trigger keywords], version=0.1.0

# Debug Mode: Hypothesis-Driven Runtime Debugging
## Overview — methodology summary
## Methodology — the 7-point approach
## Debug Server — reference to server.js (shipped as separate file, copied at runtime)
## Log Format — { hypothesisId, location, message, data } spec
## Instrumentation Pattern — fetch() one-liner template
## Label Conventions — table: fn-entry, fn-exit, error, state, branch
## Cleanup — pkill + rm -rf + remove fetch calls
```

### Command Content (pseudocode outline)

```
Frontmatter: description, argument-hint=<bug description>, allowed-tools=Read,Write,Edit,Bash,Glob,Grep,TodoWrite,AskUserQuestion

Step 1: Create task list
Step 2: Understand the bug (ask user if vague)
Step 3: Generate 3-5 hypotheses → present to user
Step 4: Copy server.js from skill dir + start debug server, add .debug-mode/ to .gitignore
Step 5: Instrument code with hypothesis-tagged fetch() calls → ask user to reproduce
Step 6: Read debug.log, evaluate each hypothesis (CONFIRMED/REJECTED with evidence)
Step 7: Propose minimal fix for confirmed hypothesis → user approves
Step 8: User verifies → if bug persists, loop to Step 5
Step 9: Remove ALL instrumentation, kill server, rm -rf .debug-mode/
```

### Deployer Change

```
deploySkills():
  skillsDir = plugin/skills/
  skillDirs = readdir(skillsDir).filter(isDirectory).sort()
  for each skillName in skillDirs:
    copy skillsDir/skillName → .cursor/skills/skillName
    copy skillsDir/skillName → .opencode/skills/skillName
```

## Plan

- [x] Phase 1: Generalize deployer + create skill and command files
- [x] Phase 2: Deploy, smoke test, verify integration

## Notes

<!-- Optional sections — add what's relevant. -->

### Implementation

**Files created:**
- `plugin/skills/debug-mode/SKILL.md` — Skill with methodology, log format, instrumentation patterns, trigger keywords
- `plugin/skills/debug-mode/server.js` — Node.js HTTP debug log ingestion server
- `plugin/commands/debug-mode.md` — 9-step `/debug-mode` command workflow

**Files modified:**
- `lib/plugin-deployer.js` — Generalized `deploySkills()` to enumerate all subdirs of `plugin/skills/` dynamically
- `test/test-integration.js` — Added `zest-dev-debug-mode.md` to `EXPECTED_COMMANDS` array

**Decisions during coding:**
- Command Step 4 uses a `find` chain to locate `server.js` across multiple possible plugin installation paths (Claude Code plugins dir, .cursor, .opencode, source repo)

### Verification

- All 22 integration tests pass (`pnpm test:local`)
- `zest-dev init` deploys both `debug-mode/` skill (SKILL.md + server.js) and `zest-dev-debug-mode.md` command to `.cursor/` and `.opencode/`
- Deployer correctly handles multiple skill directories (zest-dev + debug-mode)
