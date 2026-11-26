---
id: 20261126-remove-eag-concept
name: Remove Eag Concept
status: implemented
created: '2026-11-26'
---

## Overview

Problem: The named EAG (E2E Acceptance Gate) concept pushes agents to invent Spec-local acceptance harnesses or one-off e2e scripts. Unsupervised, those scripts usually overfit and add noise.

Outcome: Remove EAG as a workflow concept. Keep only light guidance to do end-to-end verification when user- or system-visible behavior changes, using existing project capability. Keep a template slot for text proof of that verification after it runs.

Scope: Skill Section Guides, Spec templates, CONTEXT glossary/dialogue, and E2E assertions that encode EAG. Do not migrate historical Specs.

Constraints: Do not replace EAG with another named gate or mandatory Validation ticket. Do not require agents to create new e2e/EAG scripts.

Success: New Specs have no EAG subsection or EAG Validation ticket; Implementation File still has a Verification place for text e2e results; docs and deployment tests match.

## Design

### Summary

Delete EAG from the Designed Contract, Main Spec template, Plan contract, and glossary. Replace it with brief end-to-end verification guidance in Implementation (and a light Design Decisions mention of verification strategy when material). Keep `implementation.md` → `## Verification` as the durable text-proof slot agents fill after running verification. Do not migrate existing Specs.

See [design.md](./design.md) for the Design Record.

## Plan

### Ticket 1 (AFK): Remove EAG from skill contracts and templates

Goal: New Specs and Section Guides no longer define or require EAG.
Scope: Update `skills/zest-dev/{SKILL,design,plan,implementation}.md` and `lib/template/{spec,implementation}.md` to drop EAG/EAG Validation, keep brief e2e verification guidance, and clarify Verification as text proof.
Depends on: None

### Ticket 2 (AFK): Sync glossary and E2E assertions

Goal: Project language and package/deployment tests match the EAG-free contract.
Scope: Update `CONTEXT.md`; adjust `e2e/tests/test_spec_lifecycle.py` and `e2e/tests/test_init_deployment.py`; leave historical Specs untouched.
Depends on: Ticket 1

### Ticket 3 (AFK): Documentation Sync

Goal: Reviewer-facing docs no longer teach EAG.
Scope: Re-check README and other exposed docs for EAG wording; update only if needed.
Depends on: Ticket 2

## Progress

- [x] Ticket 1 (AFK): Remove EAG from skill contracts and templates
- [x] Ticket 2 (AFK): Sync glossary and E2E assertions
- [x] Ticket 3 (AFK): Documentation Sync

## Implementation

See [implementation.md](./implementation.md).

## Deferred Follow-Ups (DFU)

None.
