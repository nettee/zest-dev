---
id: 20260726-bake-grilling-into-zest-dev
name: Bake Grilling Into Zest Dev
status: implemented
created: '2026-07-26'
---

## Overview

Zest Dev currently supports a direct workflow from an initial requirement through Research and Design, while the maintainer separately invokes Matt Pocock's `grill-with-docs` workflow for complex decisions. This separation leaves overlapping guidance about research, discussion, and design, and requires a custom prompt to coordinate the two skills.

This change will make Zest Dev compatible with two ways of reaching the same `designed` milestone:

- a lightweight path for straightforward work, using focused research and design;
- a grilling path for complex work, using an intensive decision process that may perform research while it resolves choices.

Both paths should produce the same Spec structure and converge at `designed`; `researched` should no longer be a lifecycle status because Research is an input to the designed milestone rather than a separately required maturity boundary. Plan and Implement should remain shared. Zest Dev should become lighter about how design discussion is conducted, complement rather than conflict with the registered grilling/domain-modeling skills, preserve source-backed facts gathered by either path, and keep the Spec as the durable record of process-relevant facts and resulting decisions.

This is an intentionally breaking workflow refactor for newly created Specs. Existing Specs are not migrated or made compatible with the new lifecycle and structure.

## Design

### Summary

Refocus Zest Dev on Spec content contracts and lifecycle maturity. Newly created Specs progress through `new → designed → planned → implemented`; Research is neither a status nor a standalone step, but source-backed Research Findings inside the Design Record. The Design Section Guide supports a lightweight route and a grilling route composed from `grilling` and `domain-modeling`, both producing the same Design contract. Section Guides are named for Overview, Design, Plan, and Implementation content. Replace the old phase-oriented commands with two approach-oriented creation entrypoints, while removing general CLI prompt generation.

See [design.md](./design.md) for the Design Record.

### E2E Acceptance Gate (EAG)

Acceptance behavior: A fresh project can enter either Design Approach through its dedicated creation command, create and progress a new-format Spec through the four-state lifecycle, deploy the content-oriented Zest Dev skill and its two approach entrypoints, and set up Ralph with its dedicated internal instruction.

Verification path: `pnpm test:local`

## Plan

### Ticket 1 (AFK): Establish the four-state Spec schema and lifecycle

Goal: Newly created Specs use the Design Record structure and progress through only `new`, `designed`, `planned`, and `implemented`.
Scope: Update the built-in Main Spec and Design Record templates, remove `researched` from CLI validation and ordering, preserve forward-only transitions, and update lifecycle/template E2E coverage. Do not migrate or support old Specs.
Depends on: None

### Ticket 2 (AFK): Replace phase workflows with content-oriented Section Guides

Goal: The deployed Zest Dev skill governs Overview, Design, Plan, and Implementation content while supporting lightweight and grilling routes to the same Designed Contract.
Scope: Rewrite the main skill around lifecycle and content contracts; replace `new.md`, `research.md`, and `implement.md` with `overview.md` and `implementation.md`; consolidate source-backed Research Findings and Design Decisions in `design.md`; directly compose `grilling` plus `domain-modeling`; retain the Spec-local `to-tickets` planning boundary; remove fixed stops, next-step suggestions, and action-oriented phase language; update skill deployment tests.
Depends on: Ticket 1

### Ticket 3 (AFK): Publish two Design Approach commands and decouple Ralph

Goal: Editor users can create a new Spec through either `/zest-dev:lightweight` or `/zest-dev:grilling`, while Ralph remains functional without the general prompt generator.
Scope: Replace the five existing command prompts with the two approach entrypoints; remove `zest-dev prompt` and `lib/prompt-generator.js`; give Ralph a dedicated internal task instruction; update command deployment, stale managed-command cleanup, package resources, plugin compatibility resources, CLI help, and relevant E2E tests without deleting unrelated user commands.
Depends on: Ticket 2

### Ticket 4 (AFK): Validate the refactored workflow end to end

Goal: Prove that the completed refactor satisfies the Design section's E2E Acceptance Gate and remains valid when installed from the package artifact.
Scope: Run `pnpm test:local` as the EAG verification path, then run `pnpm test:package` for packaged-resource coverage. Fix failures caused by the refactor and confirm that old-Spec migration or compatibility behavior was not introduced.
Depends on: Ticket 1, Ticket 2, Ticket 3

### Ticket 5 (AFK): Synchronize workflow documentation and domain language

Goal: Project documentation consistently explains the content-contract model, four-state lifecycle, two Design Approaches, and remaining CLI/editor surfaces.
Scope: Re-evaluate and update `README.md`, `plugin/README.md`, `CONTEXT.md`, repository guidance, and any other documentation exposed by the final implementation. Remove stale Research Phase, five-command, prompt-generation, Design Detail, and action-oriented phase terminology while retaining accurate `to-tickets`, TDD, Ralph, and archival guidance.
Depends on: Ticket 4

## Progress

- [x] Ticket 1 (AFK): Establish the four-state Spec schema and lifecycle
- [x] Ticket 2 (AFK): Replace phase workflows with content-oriented Section Guides
- [x] Ticket 3 (AFK): Publish two Design Approach commands and decouple Ralph
- [x] Ticket 4 (AFK): Validate the refactored workflow end to end
- [x] Ticket 5 (AFK): Synchronize workflow documentation and domain language

## Implementation

See [implementation.md](./implementation.md).

## Deferred Follow-Ups (DFU)

- Vendor the integrated `grilling`, `domain-modeling`, and `to-tickets` skills into Zest Dev so their composition contracts are versioned together and cannot drift into semantic conflicts.
