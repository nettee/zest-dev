# CLAUDE.md

## Project Overview

Zest Spec: A lightweight, file-driven development workflow for swappable coding agents.

## Development

### Testing Zest Spec CLI

To test the CLI during development:

```bash
# Run directly with node
node bin/zest-spec.js status
node bin/zest-spec.js show 001
node bin/zest-spec.js create <spec-name>
node bin/zest-spec.js set-current <spec-id>
node bin/zest-spec.js unset-current
```

## Spec-Driven Development by Zest Spec

Specs are stored in `specs/`. Managed via `zest-spec` CLI.

### Commands

**Never** manually create spec files or edit frontmatter. Use `zest-spec` CLI to create and manage specs.

| Command                         | Purpose                    |
| ------------------------------- | -------------------------- |
| `zest-spec status`              | View project status        |
| `zest-spec show <spec-id>`      | View spec content          |
| `zest-spec create <spec-name>`  | Create new spec            |
| `zest-spec set-current <id>`    | Set current working spec   |
| `zest-spec unset-current`       | Unset current working spec |

### Spec content rules

- **Prioritize Brevity**: Write only the main flow and design ideas, not detailed implementation code
- **Easy to Review**: Keep documents concise so others can quickly understand the plan
- **Pseudocode/Flowcharts**: Use pseudocode or step lists for complex logic, instead of full code


