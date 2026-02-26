---
id: 20260210-init-project
name: "Init Project"
status: complete
created: "2026-02-10"
---

## Overview

Init Zest Spec Project: a npm CLI that manages spec files.

## Research

Evaluated existing spec management approaches and decided on a minimal CLI design with:
- YAML output format for both human and AI readability
- File-based structure with numbered spec directories
- Symlink-based current spec tracking

## Design

### CLI

npm CLI.

Can be installed globally, and download by users via npm.

```bash
npm install -g zest-spec
```

Follow the best practices of npm CLI (project structure, metadata, etc.).

### Spec files structure

- specs/
  - 001-init-project/
    - spec.md
  - 002-add-dependencies/
    - spec.md
  - 003-configure-ci/
    - spec.md
  - current/ -> symlink to the on-the-desk spec folder (e.g., 001-init-project/)

### Commands

First design principle: use YAML as CLI output format, ensuring a balance for human and AI readability.

#### zest-spec status

Example output:

```bash
$ zest-spec status
specs_count: 3
current: "001"

$ zest-spec status
specs_count: 3
current: null
```

#### zest-spec show

```bash
zest-spec show <spec_number>
zest-spec show current
```

Example output:

```bash
$ zest-spec show 001
id: "001"
name: "Init Zest Spec Project"
path: "specs/001-init-project/spec.md"
current: false
status: "planned"

$ zest-spec show current
id: "002"
name: "Add Dependencies"
path: "specs/002-add-dependencies/spec.md"
current: true
status: "planned"
```

#### zest-spec create

```bash
zest-spec create <spec_slug>
```

Example:

```yaml
$ zest-spec create init-project
ok: true
spec:
  id: "001"
  name: "Init Zest Spec Project"
  path: "specs/001-init-project/spec.md"
  current: false
  status: "planned"
```

Read spec template from project file `.zest-spec/template/spec.md`.

#### zest-spec set-current

```bash
zest-spec set-current <spec_number>
```

Example:

```yaml
$ zest-spec set-current 001
ok: true
current: "001"
```

#### zest-spec unset-current

```bash
zest-spec unset-current
```

Example:

```yaml
$ zest-spec unset-current
ok: true
current: null
```

### How to track the current spec

Using symlink.

## Plan

- [x] Initialize npm project with package.json
- [x] Implement CLI commands (status, show, create, set-current, unset-current)
- [x] Implement spec file management with YAML output
- [x] Verify all commands return valid YAML output
- [x] Verify spec creation works and uses template correctly

## Notes

Template design prioritizes simplicity with minimal frontmatter fields (id, name, status, created) to keep specs focused on content rather than metadata.
