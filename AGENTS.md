# CLAUDE.md

## Project Overview

Zest Dev: A lightweight, human-interactive development workflow for AI-assisted coding.

## Agent Skill Environment

- Keep lifecycle invariants, recording rules, and reusable content guidance in the `zest-dev` skill. The skill should route by requested outcome; Section Guides should define the Overview, Requirements, Design, Plan, and Implementation content contracts through progressive disclosure.
- Refer to the skill by its registered name (`zest-dev`), not by repository or deployed file paths.
- Keep the CLI-created Spec templates thin. New Specs include `spec.md` plus `implementation.md` with brief placeholders only; concrete writing guidance belongs in the Section Guides.
- `zest-dev init` installs packaged skills only to `~/.agents/skills/<name>/`; it does not deploy editor-specific command or agent paths.

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

Issue-representation archival uses `zest-dev dump`; there is no public `archive`, `prompt`, or `ralph` CLI subcommand.

Valid Spec statuses are `new`, `designed`, `planned`, and `implemented`.

### Spec content rules

- **Prioritize Brevity**: Write only the main flow and design ideas, not detailed implementation code
- **Easy to Review**: Keep documents concise so others can quickly understand the plan
- **Pseudocode/Flowcharts**: Use pseudocode or step lists for complex logic, instead of full code
