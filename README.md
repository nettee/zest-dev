# Zest Dev

A lightweight, human-interactive development workflow for AI-assisted coding.

## Quick Start

Install the Claude Code plugin:

```bash
/plugin marketplace add https://github.com/nettee/zest-dev
/plugin install zest-dev
```

Install the CLI:

```bash
npm install -g zest-dev
```

## Usage Workflow

### Step-by-Step

Work through a feature spec one phase at a time, with human review between each stage.

```bash
/zest-dev:new "My new feature"   # Create a spec and set it as active
/zest-dev:research            # Research requirements and explore the codebase
/zest-dev:design              # Clarify requirements and design the architecture
/zest-dev:implement           # Build the feature following the design
/zest-dev:archive             # Agent-guided merge into specs/current, then unset active
```

Each command advances the spec to the next status: `new → researched → designed → implemented`.

### Quick Implementation

Run all stages end-to-end with approval checkpoints. Useful for straightforward tasks.

Start from a description:

```bash
/zest-dev:quick-implement "My new feature"
```

Or start from an existing spec:

```bash
zest-dev set-active <spec-id>
/zest-dev:quick-implement
```

### Summarize a Session

After a quick coding conversation, capture what was discussed and built into a permanent spec file.

```bash
/zest-dev:summarize
```

This is useful when you skipped the planning phase and want to document the work after the fact.

## CLI Reference

The `zest-dev` CLI manages spec files. Use it to inspect and update specs outside of Claude.

### Commands

| Command | Purpose |
|---------|---------|
| `zest-dev status` | View project status |
| `zest-dev show <spec-id\|active>` | View spec content |
| `zest-dev create <slug>` | Create new spec |
| `zest-dev set-active <spec-id>` | Set active change spec |
| `zest-dev unset-active` | Unset active change spec |
| `zest-dev update <spec-id\|active> <status>` | Update spec status |
| `zest-dev create-branch` | Create a git branch from the active change spec |

Archive is intentionally **not** a public CLI subcommand. Use `/zest-dev:archive` in plugin-enabled editors or `zest-dev prompt archive` for prompt-driven flows.

### Status Transitions

Valid status values: `new`, `researched`, `designed`, `implemented`

- Forward-only transitions (skipping is allowed): e.g. `new → designed` is valid
- Backward transitions fail: e.g. `implemented → designed`
- Setting the same status again returns an error

### Generate Prompts for Codex

For editors like Codex that don't support project-level commands, use `zest-dev prompt` to generate the equivalent prompt text:

```bash
codex "$(zest-dev prompt new 'some description')"
codex "$(zest-dev prompt research)"
codex "$(zest-dev prompt design)"
codex "$(zest-dev prompt implement)"
codex "$(zest-dev prompt archive)"
codex "$(zest-dev prompt summarize)"
```

### Project Structure

```
project/
├── specs/
│   ├── change/
│       ├── 20260224-init-project/
│       │   └── spec.md
│       ├── 20260225-feature-name/
│       │   └── spec.md
│       └── active -> 20260225-feature-name (symlink)
│   └── current/
│       └── implementation.md
└── .zest-dev/
    └── template/
        └── spec.md
```

Create a custom spec template at `.zest-dev/template/spec.md`.
