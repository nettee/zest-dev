# Zest Dev

A lightweight, human-interactive development workflow for AI-assisted coding.

## Quick Start

Assuming `zest-dev` is already installed and available in PATH, initialize the editor-facing commands and skills in your project:

```bash
zest-dev init
```

## Usage Workflow

Zest Dev uses a **thick skill / thin command** model:
- the `Zest Dev` skill is the workflow source of truth
- detailed phase workflows are owned by the `Zest Dev` skill
- `/zest-dev:*` commands are lightweight entrypoints and compatibility shims
- `zest-dev` CLI manages spec lifecycle only

### Step-by-Step

Work through a feature spec one phase at a time, with human review between each stage.

```bash
/zest-dev:new "My new feature"   # Create a spec and set it as active
/zest-dev:research              # Research requirements and explore the codebase
/zest-dev:design                # Clarify requirements and design the architecture
/zest-dev:implement             # Build the feature following the design
/zest-dev:archive               # Agent-guided merge into specs/current, then unset active
```

Each command routes into the main Zest Dev skill, which advances the spec through `new → researched → designed → implemented`.

### Quick Implementation

Run all stages end-to-end with an approval checkpoint before implementation. Useful for straightforward tasks.

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

For editors that don't support project-level commands, use `zest-dev prompt` to generate the equivalent thin-entry prompt text:

```bash
codex "$(zest-dev prompt new 'some description')"
codex "$(zest-dev prompt research)"
codex "$(zest-dev prompt design)"
codex "$(zest-dev prompt implement)"
codex "$(zest-dev prompt archive)"
codex "$(zest-dev prompt draft)"
codex "$(zest-dev prompt quick-implement 'some description')"
codex "$(zest-dev prompt summarize-chat)"
codex "$(zest-dev prompt summarize-pr 123)"
```

`zest-dev prompt` supports the actual command files in `plugin/commands/`. The legacy alias `summarize` maps to `summarize-chat` for compatibility.

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
