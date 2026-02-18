# Zest Spec Tests

This directory contains integration tests for the Zest Spec CLI.
The suite uses the built-in Node.js test runner (`node:test`).

## Test Architecture

The test system follows a **separation of concerns** design:

- **Test Cases** (what to test): Defined in `test-integration.js` with `node:test`
- **Test Environment** (where to test): Controlled by setup scripts and npm commands

This separation makes tests maintainable and ensures the same test suite runs in both local development and packaged environments.

## Test Files

### `test-integration.js`
Core integration test suite that verifies CLI functionality.

**What it tests:**
- Command output format (YAML structure)
- Directory structure creation
- Command file deployment
- Skills deployment
- Frontmatter transformation
- Content preservation
- Idempotency (running init multiple times)

**Key principle:** This test file contains only test logic, no environment setup.

### `setup-package-env.js`
Environment setup script that creates a clean package installation.

**What it does:**
1. Packs the CLI with `npm pack`
2. Creates a fresh npm environment
3. Installs the packaged CLI from tarball
4. Verifies basic CLI functionality

**Key principle:** This script only sets up the environment, doesn't run tests.

## Running Tests

### Local Development Testing
```bash
npm test
# or
npm run test:local
```

**Prerequisites:**
- Node.js 20+ (for the built-in test runner)
- Tests run against your local development code

### Package Testing
```bash
npm run test:package
```

**What happens:**
1. CLI is packed into a tarball
2. Fresh environment is created in `test-package-env/`
3. Tarball is installed as an npm package
4. Same test suite from `test-integration.js` runs

**Why this matters:** Catches issues with `package.json` `files` field that local testing misses.

## GitHub Actions CI

The CI workflow runs two parallel jobs with **the same test suite** but **different environments**:

### 1. test-local
```yaml
- Install dependencies (pnpm install)
- Run tests (pnpm test:local)
```

**Purpose:** Fast feedback on logic errors and functionality issues

### 2. test-package
```yaml
- Install dependencies (pnpm install)
- Setup package environment and run tests (pnpm test:package)
```

**Purpose:** Verify packaging configuration and catch distribution issues

**Key difference:** GitHub Actions only controls the environment setup. All test logic lives in JS files, not YAML.

## Common Issues Caught by Package Testing

### Missing files in package.json
```json
{
  "files": [
    "bin/",
    "lib/"
    // ❌ Forgot to include "plugin/" directory
  ]
}
```

**Result:**
- ✅ Local tests pass (files exist in your repo)
- ❌ Package tests fail (files not included in tarball)
- ❌ Users can't use the CLI after installing

### Wrong file paths
```json
{
  "files": [
    "src/bin/",  // ❌ Wrong path (should be "bin/")
    "lib/"
  ]
}
```

### Missing dependencies
If code requires a dependency not in `package.json`, package tests catch it.

## Best Practices

### Before Committing
```bash
# Run local tests (fast)
npm test
```

### Before Publishing
```bash
# Run package tests (thorough)
npm run test:package
```

### When Adding Features
1. Add test cases to `test-integration.js`
2. Tests automatically run in both environments
3. No need to modify GitHub Actions

### Debugging Failed Tests

Inspect package contents:
```bash
npm pack
tar -tzf zest-dev-*.tgz
```

Check installed package structure:
```bash
ls -la test-package-env/node_modules/zest-dev/
```

## Design Principles

1. **DRY (Don't Repeat Yourself)**: Test cases written once, run everywhere
2. **Separation of Concerns**: Test logic separate from environment setup
3. **Maintainability**: Adding tests doesn't require touching GitHub Actions
4. **Clarity**: Each file has a single, clear responsibility
