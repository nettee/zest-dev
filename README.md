# Zest Dev

A lightweight, human-interactive development workflow for AI-assisted coding.

## Quick Start

Install the CLI from npm, then initialize the editor-facing commands and skills in your project:

```bash
npm install -g zest-dev
zest-dev init
```

If you prefer not to install globally, run it with `npx`:

```bash
npx zest-dev init
```

After installation, verify the CLI is available:

```bash
zest-dev --version
zest-dev --help
```

### Initialize a Project

From the project where you want to use Zest Dev, run:

```bash
zest-dev init
```

### Local Development Setup

When developing this repository locally, install dependencies and link the CLI into your global PATH:

```bash
npm install
npm link
```

`npm link` makes the global `zest-dev` command point at this checkout, so local source changes are picked up immediately:

```bash
zest-dev --help
zest-dev init
```

### Publishing to npm

Publishing writes to the public npm registry and should remain a human-authorized release step.

Before publishing, validate the package locally:

```bash
npm pack --dry-run --json
pnpm test:local
pnpm test:package
```

Then have the release operator confirm package ownership, version, tag, registry, and authentication requirements before running `npm publish`. If the npm account requires 2FA, the operator must complete the OTP prompt.

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
/zest-dev:plan                  # Create the implementation plan
/zest-dev:implement             # Build the feature following the plan
```

Each command routes into the main Zest Dev skill, which advances the spec through `new → researched → designed → planned → implemented`.

### Quick Implementation

Run all stages end-to-end with approval checkpoints. Useful for straightforward tasks.

Start from a description:

```bash
/zest-dev:quick-implement "My new feature"
```

`quick-implement` creates a new spec, follows the full Zest Dev workflow, and asks for explicit approval before Implementation.

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
| `zest-dev dump <spec-id\|active> [--dry-run]` | Archive a spec as an issue representation or GitHub issue |
| `zest-dev load [issue] [--from-file <path>]` | Reconstruct a spec from an issue representation or GitHub issue |

### Status Transitions

Valid status values: `new`, `researched`, `designed`, `planned`, `implemented`

- Forward-only transitions (skipping is allowed): e.g. `new → designed` is valid
- Backward transitions fail: e.g. `implemented → designed`
- Setting the same status again returns an error

### Generate Prompts for Codex

For editors that don't support project-level commands, use `zest-dev prompt` to generate the equivalent thin-entry prompt text:

```bash
codex "$(zest-dev prompt new 'some description')"
codex "$(zest-dev prompt research)"
codex "$(zest-dev prompt design)"
codex "$(zest-dev prompt plan)"
codex "$(zest-dev prompt implement)"
codex "$(zest-dev prompt quick-implement 'some description')"
```

`zest-dev prompt` supports the actual command files in `commands/`.

### Resource Layout

Zest Dev's editor-facing resources are stored in top-level directories:

- `commands/` - thin command prompts
- `skills/` - workflow and helper skills
- `agents/` - reusable subagent definitions

The `plugin/` directory is a Claude Code compatibility layer. It keeps plugin metadata under `plugin/.claude-plugin/`, while `plugin/commands`, `plugin/skills`, and `plugin/agents` are symlinks to the top-level source directories.

### Project Structure

```
project/
├── specs/
│   ├── change/
│       ├── 20260224-init-project/
│       │   ├── spec.md
│       │   ├── design.md
│       │   └── steps.md
│       ├── 20260225-feature-name/
│       │   ├── spec.md
│       │   ├── design.md
│       │   └── steps.md
│       └── active -> 20260225-feature-name (symlink)
│   └── current/
│       └── steps.md
```

## References

- [OpenSpec](https://github.com/Fission-AI/OpenSpec/blob/main/docs/concepts.md) - Inspired by its current-spec methodology, where specs act as the source of truth for how a system currently behaves and changes are managed separately until they are merged back.
- [Matt Pocock Skills: `to-issues`](https://github.com/mattpocock/skills/tree/main/skills/engineering/to-issues) - References its issue-scale vertical-slice planning style for breaking design work into Zest Dev Plan steps.
- [Matt Pocock Skills: `tdd`](https://github.com/mattpocock/skills/tree/main/skills/engineering/tdd) - References its test-driven implementation methodology for coding work, separate from Plan step slicing.
