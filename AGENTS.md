# CLAUDE.md

## Project Overview

Zest Dev: A lightweight, human-interactive development workflow for AI-assisted coding.

## Command Prompt Environment

This repository's custom command prompts are designed for **OpenCode / oh-my-opencode-slim**, not Claude Code.

### Prompt writing guidance

- Write prompts in terms of **capabilities and roles**, not Claude-specific tool names or fixed implementations.
- Prefer flexible role names such as **explorer subagent**, **architect subagent**, and **reviewer subagent**.
- Do **not** hardcode specific oh-my-opencode-slim agent handles in prompts unless there is a strong reason; let the runtime choose the best matching subagent.
- For user interaction, say **ask the user directly** or **use the question tool** rather than Claude-specific names.
- For codebase work, describe the goal (read files, search code, inspect references, run shell commands) rather than enumerating a Claude-only tool contract.
- When referring to a skill in prompts or command docs, refer to it by its registered skill name (for example `zest-dev`), not by repository or deployed file paths.
- Keep lifecycle invariants, recording rules, and reusable content guidance in skills. The main `zest-dev` skill should route by requested outcome; Section Guides should define the Overview, Design, Plan, and Implementation content contracts through progressive disclosure.
- Keep command prompts thin. Commands should provide a simple entry prompt and route intent into the relevant skill workflow; they should not duplicate detailed process, rules, or templates.
- Keep the CLI-created Spec templates thin. They should create the required Main Spec, Design Record, and Implementation File structure with brief placeholders only; concrete writing guidance belongs in the Zest Dev Section Guides.

### Prompt format constraints

- Do **not** rely on `allowed-tools` frontmatter for deployed OpenCode commands. Our deploy step strips non-OpenCode frontmatter and keeps only `description`.
- `argument-hint` may exist in source command files for authoring convenience, but it is not preserved in deployed `.opencode/commands/` files.
- Avoid prompt text that assumes Claude Code-only primitives such as `AskUserQuestion` or Claude-specific plugin agent names.
- When describing delegation, prefer generic subagent language over implementation-specific names so the same prompt remains portable across OpenCode setups.

## Development

### Testing Zest Dev CLI

#### Manual Testing

To manually test the CLI during development:

```bash
# Run directly with node
node bin/zest-dev.js status
node bin/zest-dev.js show 20260224-init-project
node bin/zest-dev.js create <slug>
node bin/zest-dev.js set-active <spec-id>
node bin/zest-dev.js unset-active
node bin/zest-dev.js update <spec-id> <status>
```

#### Automated Testing

**Test Architecture:** E2E tests exercise the public CLI through Python test cases under `e2e/tests/`. `e2e/tests/conftest.py` owns the shared CLI harness and isolated environments; the local and package runners execute the same suite.

**Running tests:**

```bash
# Local development testing (uses bin/zest-dev.js directly)
pnpm test:local

# Package testing (packs CLI, installs from tarball, runs same tests)
pnpm test:package
```

**Adding new tests:**

1. Add or update a behavior-focused test under `e2e/tests/`.
2. Exercise the CLI through the shared `cli` fixture rather than internal implementation functions.
3. Run `pnpm test:local`; package verification uses the same test suite through `pnpm test:package`.

**Key principles:**
- ✅ All test logic in JS files (never in GitHub Actions YAML)
- ✅ Same test suite runs in both local and package environments
- ✅ Adding tests doesn't require touching GitHub Actions

**Common issue:** If package tests fail but local tests pass, check `package.json` `files` array to ensure all required directories are included.

## Spec-Driven Development by Zest Dev

Specs are stored in `specs/change/`. Managed via `zest-dev` CLI.

### Commands

**Never** manually create spec files or edit frontmatter. Use `zest-dev` CLI to create and manage specs.

| Command                         | Purpose                    |
| ------------------------------- | -------------------------- |
| `zest-dev status`              | View project status        |
| `zest-dev show <spec-id\|active>` | View spec content          |
| `zest-dev create <slug>`           | Create new spec            |
| `zest-dev set-active <spec-id>`   | Set active change spec   |
| `zest-dev unset-active`           | Unset active change spec |
| `zest-dev update <spec-id\|active> <status>` | Update spec status |

Issue-representation archival uses `zest-dev dump`; there is no public `archive` or `prompt` CLI subcommand.

Valid Spec statuses are `new`, `designed`, `planned`, and `implemented`.

### Spec content rules

- **Prioritize Brevity**: Write only the main flow and design ideas, not detailed implementation code
- **Easy to Review**: Keep documents concise so others can quickly understand the plan
- **Pseudocode/Flowcharts**: Use pseudocode or step lists for complex logic, instead of full code
