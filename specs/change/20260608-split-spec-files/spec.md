---
id: 20260608-split-spec-files
name: Split Spec Files
status: implemented
created: '2026-06-08'
---

## Overview

Issue 74 requests splitting the current single Spec file so content that reviewers usually do not read, such as Research, can live outside the main Spec file. The main Spec should stay concise and easier to review.

Goals:
- Keep the main Spec focused on review-critical content.
- Move lower-review-frequency sections out of the main Spec without losing workflow history.
- Preserve the existing Zest Dev lifecycle and source-recording discipline.

Success criteria:
- Newly created Specs use the split layout.
- Existing CLI workflows can still create, show, activate, update, and consume Specs.
- Research facts and sources remain durable and discoverable after the split.

## Research

### Existing System

- Issue 74 asks to split the current single Spec file and move sections reviewers usually skip, explicitly including Research, into separate files so the main Spec remains concise. Source: https://github.com/nettee/zest-dev/issues/74
- The documented project structure shows each change Spec directory containing a single `spec.md`, and documents `.zest-dev/template/spec.md` as the custom Spec template path. Source: `README.md:134-152`
- The packaged default Spec template currently creates one `spec.md` with top-level `## Overview`, `## Research`, `## Design`, `## Plan`, and `## Notes` sections. Source: `lib/template/spec.md:8-24`
- `createSpec` chooses `.zest-dev/template/spec.md` before the packaged default template, substitutes `{id}`, `{name}`, and `{date}`, then writes only `specs/change/<id>/spec.md`. Source: `lib/spec-manager.js:206-220`
- The repository currently has a custom `.zest-dev/template/spec.md`; it also creates one `spec.md` with the same major sections, but its Plan comment still contains older checkbox/substep guidance. Source: `.zest-dev/template/spec.md:8-57`
- `getSpecFilePath` currently resolves a Spec body to `spec.md`, falling back to `README.md` only for backwards compatibility. Source: `lib/spec-manager.js:136-148`
- `getSpec("active")` and status reporting expose a single `path` for the active Spec, derived from `getSpecFilePath`. Source: `lib/spec-manager.js:154-181`, `lib/spec-manager.js:100-132`
- `updateSpecStatus` reads and rewrites frontmatter in the resolved Spec file path. Source: `lib/spec-manager.js:322-357`

### Design Inputs

- Current tests assert that the packaged default template creates `## Research`, `## Design`, `## Plan`, and `## Notes` in `spec.md`; they also assert the custom template override is used verbatim. Source: `test/test-integration.js:521-596`
- Current tests assert `status.active_change.path` points to `specs/change/<id>/spec.md`. Source: `test/test-integration.js:619-635`
- The canonical Research phase says every finding must cite a fact source and lists `Key References` as part of the Research section. Source: `skills/zest-dev/research.md:17-27`
- The canonical Plan phase says `## Plan` must be compact structured prose without markdown checkboxes, while `## Notes -> ### Progress` contains one checkbox per Plan Step. Source: `skills/zest-dev/plan.md:28-65`
- `zest-dev ralph` parses only `## Notes -> ### Progress` from the active Spec's resolved file path and fails fast if `## Notes` or `### Progress` is missing. Source: `lib/ralph-setup.js:27-67`, `lib/ralph-setup.js:91-106`
- Ralph integration tests create planned active Specs with `## Notes -> ### Progress` in the main Spec file and assert failures when Progress is missing or malformed. Source: `test/test-integration.js:810-948`

### Constraints & Dependencies

- The current project glossary defines a Spec as a change record stored as a Spec directory with a concise Main Spec File and optional supporting files. Source: `CONTEXT.md:7-17`
- The current glossary defines Planned Status as the milestone where Design and Plan are ready for implementation, and defines Progress Checklist as a thin checklist in the Main Spec File. Source: `CONTEXT.md:43-53`
- The current Implement phase instructions still refer to `## Notes -> ### Progress` and filling `## Notes`, so this change must update that workflow language. Source: `skills/zest-dev/implement.md:17-22`
- The Zest Dev skill requires lifecycle operations to use the CLI and allows only `new`, `researched`, `designed`, `planned`, and `implemented` statuses. Source: `skills/zest-dev/SKILL.md:50-58`
- The repository's fast-fail rule says missing required inputs, files, config, or violated invariants should fail immediately with a clear error instead of substituting placeholder or fabricated data. Source: `AGENTS.md:33-50`

### Key References

- GitHub issue: https://github.com/nettee/zest-dev/issues/74
- Spec lifecycle core: `lib/spec-manager.js:6-18,136-220,322-357`
- Default and custom templates: `lib/template/spec.md:8-24`, `.zest-dev/template/spec.md:8-57`
- Workflow phase guidance: `skills/zest-dev/research.md:17-28`, `skills/zest-dev/plan.md:28-65`
- Downstream Progress consumer: `lib/ralph-setup.js:27-67,91-106`

## Design

### Design Summary

Change each new Spec from a single large `spec.md` into a small review-oriented main file plus supporting Markdown files in the same Spec directory. The main `spec.md` remains the lifecycle and review entrypoint, preserves the familiar workflow section order, and uses natural-language links where detail moves out. Research and Design move together into `design.md`; implementation and verification records move into `steps.md` and are organized by Plan step; Progress becomes a top-level peer of Plan in the main file.

### Design Decisions

- Decision: Treat `spec.md` as the review entrypoint, not the complete storage location for every workflow detail. It must keep frontmatter and Overview, and should stay concise for review. Source: user decision; https://github.com/nettee/zest-dev/issues/74; `CONTEXT.md:7-17`
- Decision: Keep Plan and Progress in the main `spec.md`, with Progress promoted out of Notes to a Plan-level peer because both are necessary during implementation handoff. Source: user decision; `skills/zest-dev/plan.md:28-65`; `lib/ralph-setup.js:27-67,91-106`
- Decision: Move both Research and Design into `design.md`, because after planning these are low-frequency review material. Source: user decision; `skills/zest-dev/research.md:17-27`; `skills/zest-dev/design.md:24-39`
- Decision: Move implementation and verification records into lowercase `steps.md`, keeping execution history separate from review-critical content and aligning each record section with the corresponding Plan step. Source: user decision; `lib/template/spec.md:24-30`; `lib/template/steps.md:1-5`
- Decision: Remove custom Spec template support and always use the built-in template layout. This avoids preserving a user-defined single-file layout that contradicts the new canonical split layout. Source: user decision; `lib/spec-manager.js:206-220`; `test/test-integration.js:557-596`
- Decision: Do not automatically migrate old single-file Specs and do not preserve compatibility for old layouts in this change. New Specs use the new layout; existing historical Specs are not part of the supported workflow surface for this feature. Source: user decision; `README.md:134-152`; `lib/spec-manager.js:136-148`
- Decision: Treat only the main `spec.md` as required by CLI lifecycle operations. Supporting files are created by the normal new-Spec flow and linked from the main Spec, but commands do not need special missing-file validation beyond the files they actually read or write. Source: user decision; `lib/spec-manager.js:154-181,322-357`
- Decision: Do not enhance `zest-dev show` to list supporting files. The main `spec.md` remains the only entrypoint, and supporting files are discovered through links from `spec.md` to preserve progressive disclosure. Source: user decision; `bin/zest-dev.js:149-161`; `lib/spec-manager.js:154-181`
- Decision: Preserve the main Spec's workflow section order. `## Research` and `## Design` remain in their original positions in `spec.md`, but each section contains only a link to `design.md`. Source: user decision; `lib/template/spec.md:8-24`; `skills/zest-dev/SKILL.md:177-182`
- Decision: Keep separate `## Research` and `## Design` sections inside `design.md` so factual research and design decisions remain distinct even though they share one supporting file. Source: user decision; `skills/zest-dev/research.md:17-27`; `skills/zest-dev/design.md:24-39`
- Decision: Remove `Notes` as a section name everywhere in the new layout. Main `spec.md` gets a `## Implementation` section that references `steps.md`; implementation and verification process detail is fused inside step-specific sections in that supporting file. Source: user decision; `lib/template/spec.md:24-30`; `skills/zest-dev/implement.md:17-21`
- Decision: Main `spec.md` should not use bare link text such as `[Design and research](./design.md)`. Supporting-file references should read naturally in English, such as `See design.md`. Source: user decision; `lib/template/spec.md:12-30`

### System Structure

New Spec directory layout:

```text
specs/change/<YYYYMMDD-slug>/
├── spec.md
├── design.md
└── steps.md
```

Main `spec.md` layout:

```markdown
---
id: "<id>"
name: "<name>"
status: new
created: "<date>"
---

## Overview

## Research

See [design.md](./design.md).

## Design

See [design.md](./design.md).

## Plan

## Progress

## Implementation

See [steps.md](./steps.md).
```

Supporting file responsibilities:
- `design.md`: `## Research` for facts and fact sources, followed by `## Design` for decisions, trade-offs, and verification strategy.
- `steps.md`: one section per Plan step, combining implementation notes, files changed, deviations from design, and verification results for that step.

### Interfaces / APIs

- `zest-dev create <slug>` creates the full built-in multi-file layout.
- `zest-dev show <spec-id|active>` continues to identify only the active main file path.
- `zest-dev update <spec-id|active> <status>` continues to update frontmatter in the main `spec.md`.
- Workflow phase instructions must route section writing to the new file locations:
  - New phase: Overview in `spec.md`.
  - Research and Design phases: `design.md`.
  - Plan phase: Plan and Progress in `spec.md`.
  - Implement phase: Progress in `spec.md`, implementation/verification detail by Plan step in `steps.md`.

### Change Scope

Impact Areas:
- Spec lifecycle creation changes from one generated file to a multi-file built-in layout.
- Custom template override behavior is removed, including docs and tests that describe it.
- Research, Design, Plan, Implement, summarize, and Ralph-facing instructions need section-location updates.
- Ralph parsing must read top-level `## Progress` from the main Spec file instead of `## Notes -> ### Progress`.
- The `Notes` section name is removed from templates, skills, command guidance, README examples, tests, and glossary language for the new workflow.

Planned File Changes:
- `lib/spec-manager.js`: remove custom template lookup; create built-in `spec.md`, `design.md`, and `steps.md`; keep lifecycle status updates on main `spec.md`.
- `lib/template/spec.md`: replace single-file template content with the concise main Spec template.
- Add built-in supporting templates under `lib/template/` for `design.md` and `steps.md`.
- `.zest-dev/template/spec.md`: remove the repository custom template override.
- `skills/zest-dev/*.md`: update phase instructions for the new file locations and source discipline.
- `commands/summarize-chat.md` and `commands/summarize-pr.md`: update capture guidance for split files.
- `lib/ralph-setup.js`: parse top-level `## Progress`.
- `README.md` and `CONTEXT.md`: document the new layout and terminology.
- `test/test-integration.js`: update create, custom-template, status, Ralph, prompt/skill content, and layout assertions.

### Edge Cases

- Existing single-file Specs may still exist in the repository and in user projects, but this change does not provide automatic migration or compatibility behavior for them.
- Missing supporting files do not need proactive CLI validation because `spec.md` remains the only required lifecycle file.
- `steps.md` uses lowercase by user decision; tests should lock the exact filename to avoid accidental drift.

### Verification Strategy

- Update create tests to assert all three built-in files are created and no custom template override is honored.
- Update status and show tests to preserve the main `spec.md` path.
- Update Ralph tests to parse `## Progress` in `spec.md` and fail fast when it is missing or malformed.
- Update generated prompt/skill deployment assertions where they mention old section locations or `Notes`.
- Run `pnpm test:local` after implementation.

## Plan

### Step 1: Generate Split Spec Layout

Type: AFK
Goal: Make new Specs use the built-in split layout with `spec.md`, `design.md`, and `steps.md`.
Scope: Update template files, remove custom template override behavior, and update create-related tests/docs.
Depends on: None

### Step 2: Route Workflow Content To Split Files

Type: AFK
Goal: Make Zest Dev phases and summarize commands write to the new section locations.
Scope: Update `skills/zest-dev/*.md`, summarize command guidance, and deployed-content assertions so Research/Design go to `design.md`, Plan/Progress stay in `spec.md`, and implementation detail goes to `steps.md`.
Depends on: Step 1

### Step 3: Update Progress Consumers

Type: AFK
Goal: Keep downstream implementation handoff working after Progress moves out of Notes.
Scope: Update `lib/ralph-setup.js` and Ralph integration tests to parse top-level `## Progress` in `spec.md`.
Depends on: Step 1

### Step 4: Refresh Documentation And Regression Coverage

Type: AFK
Goal: Make public docs, glossary, and tests reflect the new layout and removal of `Notes`.
Scope: Update README/project structure, glossary language, integration tests, and run the local test suite.
Depends on: Step 2, Step 3

## Progress

- [x] Step 1: Generate Split Spec Layout
- [x] Step 2: Route Workflow Content To Split Files
- [x] Step 3: Update Progress Consumers
- [x] Step 4: Refresh Documentation And Regression Coverage

## Implementation

See [steps.md](./steps.md).
