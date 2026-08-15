# Zest Dev Plugin

A plugin for Zest Dev's spec-driven development workflow.

## Architecture

- the `zest-dev` skill owns Spec lifecycle and recording contracts
- Section Guides define Overview, Design, Plan, and Implementation content
- commands select a Design Approach without duplicating skill rules
- `plugin/commands`, `plugin/skills`, and `plugin/agents` are symlinks for plugin compatibility
- the `zest-dev` CLI manages Spec lifecycle and Ralph setup

New-format Specs progress through `new → designed → planned → implemented`.

## Commands

| Command | Purpose |
|---------|---------|
| `/zest-dev:lightweight <requirement>` | Create a new Spec and reach Designed Status through the Lightweight Design Approach |
| `/zest-dev:grilling <requirement>` | Create a new Spec and reach Designed Status through the Grilling Design Approach |

Both commands preserve the user's language and route into the same Designed Contract. The grilling route composes the registered `grilling` and `domain-modeling` skills.

## Spec content

- `Overview` records the requested change and its boundaries.
- `Design` keeps the concise Summary and E2E Acceptance Gate.
- `design.md` is the Design Record containing Research Findings and Design Decisions.
- `Plan` contains Spec-local tracer-bullet Plan Tickets; external publication requires an explicit request.
- `implementation.md` records high-signal outcomes, deviations, verification, and retrospective lessons.

## Installation

```bash
zest-dev init
```

The default global initialization deploys the two OpenCode commands, the `zest-dev` skill, and the supported Codex subagents. Target-specific and local initialization remain available through the CLI options.
