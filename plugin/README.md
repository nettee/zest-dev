# Zest Dev Plugin

A plugin for Zest Dev's spec-driven development workflow.

## Overview

This plugin integrates the Zest Dev methodology into command- and prompt-driven editors, providing a structured workflow for managing software specifications through sequential development phases.

## Architecture

- the `Zest Dev` skill is the canonical workflow source
- detailed phase workflows live under the `Zest Dev` skill
- commands in `commands/` are thin entrypoints and compatibility shims
- `plugin/commands`, `plugin/skills`, and `plugin/agents` are symlinks for Claude Code plugin compatibility
- the `zest-dev` CLI manages spec lifecycle and prompt generation

## Features

- **Spec creation** - Create new specs from natural language descriptions
- **Phase management** - Guide specs through research → design → plan → implementation phases
- **Active change spec context** - All commands work with the active change spec
- **CLI integration** - Seamlessly integrates with the `zest-dev` CLI tool

## Commands

All command flows keep responding in the user's language unless the user asks to switch languages.

| Command | Purpose |
|---------|---------|
| `/zest-dev:new <description>` | Create a new spec from natural language description |
| `/zest-dev:research` | Enter the Research phase via the main Zest Dev skill |
| `/zest-dev:design` | Enter the Design phase via the main Zest Dev skill |
| `/zest-dev:plan` | Enter the Plan phase via the main Zest Dev skill |
| `/zest-dev:implement` | Enter the Implement phase via the main Zest Dev skill |

## Skills

- **Zest Dev** - Canonical workflow source for the New / Research / Design / Plan / Implement phases

## Prerequisites

- `zest-dev` CLI tool must be installed and available in PATH
- Project must be initialized with `specs/` directory

## Installation

### Local Development

```bash
# Initialize deployed OpenCode commands and skills in the current project
zest-dev init

# Or point an editor/runtime at this plugin source during development
cc --plugin-dir /path/to/zest-dev/plugin
```

## Workflows

### Step-by-step (planned)
Start from a description and work through each phase:
1. `/zest-dev:new <description>` — thin entry into the New phase
2. `/zest-dev:research` — thin entry into the Research phase
3. `/zest-dev:design` — thin entry into the Design phase
4. `/zest-dev:plan` — thin entry into the Plan phase
5. `/zest-dev:implement` — thin entry into the Implement phase

## Prompt Compatibility

`zest-dev prompt <command>` generates prompt text from the thin command files. It supports the real command set in `commands/`.
