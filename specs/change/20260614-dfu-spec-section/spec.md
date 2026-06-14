---
id: 20260614-dfu-spec-section
name: Dfu Spec Section
status: implemented
created: '2026-06-14'
---

## Overview

Add a first-class `## Deferred Follow-Ups (DFU)` section to Specs so Design can record follow-up work that is explicitly deferred until after the current Spec is complete.

## Research

See [design.md](./design.md).

## Design

### Design Summary

Add DFU as a final main `spec.md` section after `## Implementation`. The Design Phase owns DFU content and must write concise bullets or `None.`; Plan, Progress, Implement, and Ralph keep DFU outside the current Spec's implementation work.

See [design.md](./design.md) for design detail.

### E2E Acceptance Gate (EAG)

Acceptance behavior: creating a new Spec includes `## Deferred Follow-Ups (DFU)`, deployed workflow guidance documents DFU as Design-owned, and `zest-dev ralph` appends a DFU issue-linking Ralph task.

Verification path: `pnpm test:local` and `pnpm test:package`

## Plan

### Step 1: Add DFU Template And Workflow Guidance

Type: AFK
Goal: Make DFU a canonical main Spec section owned by the Design Phase.
Scope: Update the built-in Spec template, Zest Dev skill guidance, glossary, and deployment assertions.
Depends on: None

### Step 2: Add Ralph DFU Handoff Task

Type: AFK
Goal: Make Ralph handoff include a final reminder to create and link issues for DFU items.
Scope: Update Ralph setup constants and E2E tests for generated tasks.
Depends on: Step 1

### Step 3: Documentation Sync

Type: AFK
Goal: Keep project documentation aligned with the implemented behavior.
Scope: If the implementation changes documented behavior, usage, commands, setup, or workflows, update the relevant project docs.
Depends on: Step 2

## Progress

- [x] Step 1: Add DFU Template And Workflow Guidance
- [x] Step 2: Add Ralph DFU Handoff Task
- [x] Step 3: Documentation Sync

## Implementation

See [steps.md](./steps.md).

## Deferred Follow-Ups (DFU)

None.
