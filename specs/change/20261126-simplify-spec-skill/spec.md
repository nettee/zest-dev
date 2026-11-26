---
id: 20261126-simplify-spec-skill
name: Simplify Spec Skill
status: implemented
created: '2026-11-26'
---

## Overview

In scope: slim the zest-dev skill/templates around requirement semantics + scope; remove Design Record file, DFU, grilling/lightweight command entrypoints, ralph CLI, and CONTEXT.md. Keep Plan tickets, Documentation Sync reminder, Verification text proof, and the four-state lifecycle.

Out of scope: migrating historical Specs; changing dump/load protocol compatibility for old Specs that still carry `design.md`.

## Requirements

- Specs emphasize requirement semantics and functional boundary; Design is a short implementation approach.
- New Specs create `spec.md` + `implementation.md` only.
- Agents split work into Plan tickets with flexible format and no AFK/HITL labels; Documentation Sync is strongly reminded when docs may change.
- Implementation notes stay minimal; Verification text proof remains required after checks.
- No editor command entrypoints and no Design Approach routes; only the skill + CLI remain.
- `zest-dev ralph` and CONTEXT.md are removed.

## Design

Rewrite Section Guides and templates to the new Main Spec shape (`Overview`, `Requirements`, `Design`, `Plan`, `Progress`, `Implementation`). Stop generating `design.md`. Delete Approach commands, ralph wiring, and CONTEXT. Update README/AGENTS/e2e assertions to match. Leave historical Specs untouched.

## Plan

1. Rewrite skill guides + Spec/implementation templates; stop creating `design.md`.
2. Remove commands/, ralph CLI/module/tests, and CONTEXT.md; update createSpec/docs.
3. Update e2e assertions and README/AGENTS; run `pnpm test:local`.
4. Documentation Sync for README/AGENTS/e2e README.

## Progress

- [x] Rewrite skill guides + templates; stop creating design.md
- [x] Remove commands/ralph/CONTEXT and update CLI/docs
- [x] Update e2e + Documentation Sync

## Implementation

See [implementation.md](./implementation.md).
