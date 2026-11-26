# Zest Dev

A lightweight, human-interactive development workflow for AI-assisted coding.

## Quick Start

Install the CLI from npm, then install the packaged skills into `~/.agents/skills/`:

```bash
npm install -g zest-dev
zest-dev init
```

If you prefer not to install globally, run it with `npx`:

```bash
npx zest-dev init
```

After installation, verify the CLI is available:

```bash
zest-dev --version
zest-dev --help
```

### Install Skills

`zest-dev init` copies every packaged skill under `skills/<name>/` to `~/.agents/skills/<name>/`.

### Local Development Setup

When developing this repository locally, install dependencies and link the CLI into your global PATH:

```bash
npm install
npm link
```

`npm link` makes the global `zest-dev` command point at this checkout, so local source changes are picked up immediately:

```bash
zest-dev --help
zest-dev init
```

### Publishing to npm

Publishing is automated from GitHub Actions after merge to `main` when `package.json` contains a new version.

Before publishing, validate the package locally:

```bash
npm pack --dry-run --json
pnpm test:local
pnpm test:package
```

The repository uses npm Trusted Publishing with GitHub Actions OIDC:

- PRs that change package-shipped CLI files automatically receive a patch version bump when needed.
- PRs fail CI if their version is not ahead of `main`.
- The `publish-npm.yml` workflow publishes merged versions with `npm publish --access public --provenance`.
- npm package settings must include a trusted publisher for `nettee/zest-dev` with workflow filename `publish-npm.yml`.

Optional repository secret:

- Set `AUTO_BUMP_TOKEN` to a fine-grained GitHub token with write access to this repository if you want PR auto-bump pushes to be attributed to that token owner instead of `github-actions[bot]`. This can avoid GitHub's approval gate on follow-up PR runs triggered by the auto-bump commit.

If publishing fails, inspect the `Publish npm` workflow run on `main` before retrying.

## Usage Workflow

Zest Dev uses a **content-contract skill** model:

- the `zest-dev` skill owns Spec lifecycle and recording contracts
- Section Guides define Overview, Requirements, Design, Plan, and Implementation content
- the Spec focuses on requirement semantics and scope; Design stays short; implementation notes stay minimal with text verification proof
- the `zest-dev` CLI manages Spec files and lifecycle state

There is one skill plus the CLI. There are no editor command entrypoints or Design Approach routes.

New-format Specs progress through `new → designed → planned → implemented`.

## CLI Reference

The `zest-dev` CLI manages spec files. Use it to inspect and update specs outside of Claude.

### Commands

| Command | Purpose |
|---------|---------|
| `zest-dev init` | Install packaged skills to `~/.agents/skills/` |
| `zest-dev status` | View project status |
| `zest-dev show <spec-id\|active>` | View spec content |
| `zest-dev create <slug>` | Create new spec |
| `zest-dev set-active <spec-id>` | Set active change spec |
| `zest-dev unset-active` | Unset active change spec |
| `zest-dev update <spec-id\|active> <status>` | Update spec status |
| `zest-dev create-branch` | Create a git branch from the active change spec |
| `zest-dev dump <spec-id\|path\|active> [--dry-run]` | Archive a directory Spec or standalone dated Markdown record as an issue representation or GitHub issue |
| `zest-dev load [issue] [--from-file <path>]` | Reconstruct a spec from an issue representation or GitHub issue |

### Issue Spec Representation Compatibility

Issue Spec Representation evolves without making existing archives unreadable:

| Protocol | Represented source | `dump` behavior | `load` compatibility | Restored shape |
|----------|--------------------|-----------------|----------------------|----------------|
| V1 | Directory with `spec.md` | No longer emitted | Supported | `specs/change/<spec-id>/` |
| V2 | Directory with one or more Markdown files; `spec.md` is optional | Emitted for directory Specs | Supported | `specs/change/<spec-id>/` |
| V3 | Standalone `YYYYMMDD-slug.md` record | Emitted for standalone files | Supported | `specs/change/<spec-id>.md` |

For directory Specs, `dump` accepts the existing Spec ID, directory/Main Spec path, or `active`. For standalone files, it accepts the direct path, filename, or an unambiguous ID without `.md`. If both `specs/change/<id>/` and `specs/change/<id>.md` exist, the bare ID is ambiguous and fails; pass an explicit path to select one. `load` validates the protocol and refuses to overwrite either the target shape or a conflicting directory/file with the same logical ID.

See [Issue Spec Representation](docs/issue-spec-representation.md) for the body/comment protocol and validation rules.

### Status Transitions

Valid status values: `new`, `designed`, `planned`, `implemented`

- Forward-only transitions (skipping is allowed): e.g. `new → designed` is valid
- Backward transitions fail: e.g. `implemented → designed`
- Setting the same status again returns an error

### Resource Layout

Packaged agent skills live under `skills/` and are installed by `zest-dev init` into `~/.agents/skills/<name>/`.

### Project Structure

```
project/
├── specs/
│   └── change/
│       ├── 20260224-init-project/
│       │   ├── spec.md
│       │   └── implementation.md
│       ├── 20260225-feature-name/
│       │   ├── spec.md
│       │   └── implementation.md
│       └── active -> 20260225-feature-name (symlink)
```

## References

- [OpenSpec](https://github.com/Fission-AI/OpenSpec/blob/main/docs/concepts.md) - Inspired by its current-spec methodology, where specs act as the source of truth for how a system currently behaves and changes are managed separately until they are merged back.
- [Matt Pocock Skills: `to-tickets`](https://github.com/mattpocock/skills/tree/main/skills/engineering/to-tickets) - References its tracer-bullet vertical-slice planning style for breaking design work into Zest Dev Plan tickets.
- [Matt Pocock Skills: `tdd`](https://github.com/mattpocock/skills/tree/main/skills/engineering/tdd) - References its test-driven implementation methodology for coding work, separate from Plan ticket slicing.
