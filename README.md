# Zest Dev

A lightweight, human-interactive development workflow for AI-assisted coding.

## Installation

```bash
npm install -g zest-dev
```

## Usage

### Check Project Status

```bash
zest-dev status
```

Output:
```yaml
specs_count: 3
current:
  id: "001"
  name: "Init Project"
  path: "specs/001-init-project/spec.md"
  status: "new"
```

### Show Spec Details

```bash
# Show specific spec
zest-dev show 001

# Show current spec
zest-dev show current
```

Output:
```yaml
id: "001"
name: "Init Project"
path: "specs/001-init-project/spec.md"
current: false
status: "new"
```

### Create New Spec

```bash
zest-dev create feature-name
```

Output:
```yaml
ok: true
spec:
  id: "002"
  name: "Feature Name"
  path: "specs/002-feature-name/spec.md"
  current: false
  status: "new"
```

### Set Current Spec

```bash
zest-dev set-current 001
```

Output:
```yaml
ok: true
current: "001"
```

### Unset Current Spec

```bash
zest-dev unset-current
```

Output:
```yaml
ok: true
current: null
```

### Update Spec Status

```bash
zest-dev update 003 researched
```

Output:
```yaml
ok: true
spec:
  id: "003"
  status: "researched"
status:
  from: "new"
  to: "researched"
  changed: true
```

Rules:
- Valid status values: `new`, `researched`, `designed`, `implemented`
- Forward-only transitions (skip allowed): e.g. `new -> designed` is valid
- Backward transitions fail: e.g. `implemented -> designed`
- No-op updates fail: setting the same status again returns an error

### Generate Prompts for Codex Editor

The `prompt` command generates formatted prompts for editors like Codex that don't support project-level commands:

```bash
# Create a new spec
codex "$(zest-dev prompt new 'some description')"

# Work on research phase
codex "$(zest-dev prompt research)"

# Work on design phase
codex "$(zest-dev prompt design)"

# Work on implementation phase
codex "$(zest-dev prompt implement)"

# Summarize a coding session
codex "$(zest-dev prompt summarize)"
```

This allows you to launch Codex with the appropriate initial prompt for each spec workflow phase.

## Project Structure

```
project/
├── specs/
│   ├── 001-init-project/
│   │   └── spec.md
│   ├── 002-feature-name/
│   │   └── spec.md
│   └── current -> 002-feature-name (symlink)
└── .zest-dev/
    └── template/
        └── spec.md
```

## Spec Template

Create a custom spec template at `.zest-dev/template/spec.md`.

## License

MIT
