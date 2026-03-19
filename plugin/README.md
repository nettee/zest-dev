# Zest Dev Plugin

A Claude Code plugin for spec-driven development workflow.

## Overview

This plugin integrates the Zest Dev methodology into Claude Code, providing a structured workflow for managing software specifications through sequential development phases.

## Features

- **Spec creation** - Create new specs from natural language descriptions
- **Phase management** - Guide specs through research → design → implementation phases
- **Current spec context** - All commands work with the currently active spec
- **CLI integration** - Seamlessly integrates with the `zest-dev` CLI tool

## Commands

| Command | Purpose |
|---------|---------|
| `/new <description>` | Create a new spec from natural language description |
| `/draft` | Crystallize a conversation into a spec, then proceed step by step |
| `/research` | Fill research section and advance to researched phase |
| `/design` | Fill design section and advance to designed phase |
| `/implement` | Fill implementation plan and advance to implemented phase |
| `/summarize-chat` | Capture a completed coding session into a spec (post-hoc) |
| `/summarize-pr <pr>` | Summarize a GitHub PR into a spec (post-hoc) |

## Skills

- **zest-dev** - Comprehensive guide to spec-driven development principles and best practices

## Prerequisites

- `zest-dev` CLI tool must be installed and available in PATH
- Project must be initialized with `specs/` directory

## Installation

### Local Development

```bash
# Run Claude Code with this plugin
cc --plugin-dir /path/to/zest-dev/plugin
```

## Workflows

### Step-by-step (planned)
Start from a description and work through each phase:
1. `/new <description>` — create spec with overview
2. `/research` — explore codebase and options
3. `/design` — design architecture, choose approach
4. `/implement` — build the feature

### Vibe coding first (post-hoc)
Code first, then document what was built:
1. Write code freely
2. `/summarize-chat` or `/summarize-pr` — capture into a spec

### Discussion-driven (new)
Chat and brainstorm first, then formalize and proceed:
1. Have a free-form discussion about the feature
2. `/draft` — crystallize discussion into a spec with overview
3. Optionally continue with `/research`, `/design`, `/implement`
