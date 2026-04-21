# Zest Dev Plugin

A plugin for Zest Dev's spec-driven development workflow.

## Overview

This plugin integrates the Zest Dev methodology into command- and prompt-driven editors, providing a structured workflow for managing software specifications through sequential development phases.

## Architecture

- `plugin/skills/zest-dev/SKILL.md` is the canonical workflow source
- commands in `plugin/commands/` are thin entrypoints and compatibility shims
- the `zest-dev` CLI manages spec lifecycle and prompt generation

## Features

- **Spec creation** - Create new specs from natural language descriptions
- **Phase management** - Guide specs through research → design → implementation phases
- **Active change spec context** - All commands work with the active change spec
- **CLI integration** - Seamlessly integrates with the `zest-dev` CLI tool

## Commands

All command flows keep responding in the user's language unless the user asks to switch languages.

| Command | Purpose |
|---------|---------|
| `/zest-dev:new <description>` | Create a new spec from natural language description |
| `/zest-dev:draft` | Crystallize a conversation into a spec, then proceed step by step |
| `/zest-dev:research` | Enter the Research phase via the main Zest Dev skill |
| `/zest-dev:design` | Enter the Design phase via the main Zest Dev skill |
| `/zest-dev:implement` | Enter the Implement phase via the main Zest Dev skill |
| `/zest-dev:archive` | Merge implemented active change spec knowledge into `specs/current/`, then unset active |
| `/zest-dev:summarize-chat` | Capture a completed coding session into a spec (post-hoc) |
| `/zest-dev:summarize-pr <pr>` | Summarize a GitHub PR into a spec (post-hoc) |

## Skills

- **zest-dev** - Canonical workflow source for the New / Research / Design / Implement phases

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
4. `/zest-dev:implement` — thin entry into the Implement phase
5. `/zest-dev:archive` — merge into `specs/current/` and unset active change spec

### Vibe coding first (post-hoc)
Code first, then document what was built:
1. Write code freely
2. `/zest-dev:summarize-chat` or `/zest-dev:summarize-pr` — capture into a spec

### Discussion-driven (new)
Chat and brainstorm first, then formalize and proceed:
1. Have a free-form discussion about the feature
2. `/zest-dev:draft` — crystallize discussion into a spec with overview
3. Optionally continue with `/zest-dev:research`, `/zest-dev:design`, `/zest-dev:implement`

## Prompt Compatibility

`zest-dev prompt <command>` generates prompt text from the thin command files. It supports the real command set in `plugin/commands/`, plus a compatibility alias from `summarize` to `summarize-chat`.
