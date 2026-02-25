# CLAUDE.md

## Project Overview

Zest Dev: A lightweight, human-interactive development workflow for AI-assisted coding.

## Development

### Testing Zest Dev CLI

#### Manual Testing

To manually test the CLI during development:

```bash
# Run directly with node
node bin/zest-dev.js status
node bin/zest-dev.js show 20260224-init-project
node bin/zest-dev.js create <slug>
node bin/zest-dev.js set-current <spec-id>
node bin/zest-dev.js unset-current
node bin/zest-dev.js update <spec-id> <status>
```

#### Automated Testing

**Test Architecture:** Tests follow a separation of concerns design:
- **Test cases** → `test/test-integration.js` (single source of truth)
- **Environment setup** → `test/setup-package-env.js` (package environment)
- **GitHub Actions** → Controls environment only, no test logic

**Running tests:**

```bash
# Local development testing (uses bin/zest-dev.js directly)
pnpm test:local

# Package testing (packs CLI, installs from tarball, runs same tests)
pnpm test:package
```

**Adding new tests:**

1. Edit `test/test-integration.js`:
   ```javascript
   function testNewFeature() {
     console.log('\nTest: New Feature');
     if (condition) {
       pass('Feature works');
     } else {
       fail('Feature broken');
     }
   }
   ```

2. Call it in `main()`:
   ```javascript
   function main() {
     // ...
     testNewFeature();  // Add this line
     // ...
   }
   ```

3. Done! Tests automatically run in both local and package environments.

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
| `zest-dev show <spec-id\|current>` | View spec content          |
| `zest-dev create <slug>`           | Create new spec            |
| `zest-dev set-current <spec-id>`   | Set current working spec   |
| `zest-dev unset-current`           | Unset current working spec |
| `zest-dev update <spec-id\|current> <status>` | Update spec status |

### Spec content rules

- **Prioritize Brevity**: Write only the main flow and design ideas, not detailed implementation code
- **Easy to Review**: Keep documents concise so others can quickly understand the plan
- **Pseudocode/Flowcharts**: Use pseudocode or step lists for complex logic, instead of full code
