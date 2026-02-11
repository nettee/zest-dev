# Zest Spec Plugin

A Claude Code plugin for spec-driven development workflow.

## Overview

This plugin integrates the Zest Spec methodology into Claude Code, providing a structured workflow for managing software specifications through sequential development phases.

## Features

- **Spec creation** - Create new specs from natural language descriptions
- **Phase management** - Guide specs through research → design → implementation phases
- **Current spec context** - All commands work with the currently active spec
- **CLI integration** - Seamlessly integrates with the `zest-spec` CLI tool

## Commands

| Command | Purpose |
|---------|---------|
| `/new <description>` | Create a new spec from natural language description |
| `/research` | Fill research section and advance to researched phase |
| `/design` | Fill design section and advance to designed phase |
| `/implement` | Fill implementation plan and advance to implemented phase |

## Skills

- **zest-spec** - Comprehensive guide to spec-driven development principles and best practices

## Prerequisites

- `zest-spec` CLI tool must be installed and available in PATH
- Project must be initialized with `specs/` directory

## Installation

### Local Development

```bash
# Run Claude Code with this plugin
cc --plugin-dir /path/to/zest-spec/plugin
```

## Workflow

1. **Create** - Use `/new` with a description to create a new spec
2. **Research** - Use `/research` to document research findings
3. **Design** - Use `/design` to create the design approach
4. **Implement** - Use `/implement` to create the implementation plan
5. **Build** - Implement according to the spec
