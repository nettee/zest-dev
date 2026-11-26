# Zest Dev Section Guide: Design

## Designed Contract

Designed Status requires mutually consistent content across:

- `spec.md` → `## Design` → `### Summary`;
- `design.md` → `## Research Findings`;
- `design.md` → `## Design Decisions`;
- `spec.md` → `## Deferred Follow-Ups (DFU)`.

Together these define one reviewable implementation boundary.

## Design Approaches

### Lightweight Design Approach

Use this by default. Gather evidence for material premises and resolve consequential choices without an intensive interview.

### Grilling Design Approach

Use the registered `grilling` and `domain-modeling` skills for the interview, shared-understanding gate, terminology, scenarios, and selective ADR capture. Record confirmed findings and decisions as they emerge; complete Summary after shared understanding.

Before marking either approach designed, resolve ambiguities that materially affect scope, contracts, compatibility, verification, or rollout, and synthesize one recommended design unless the user asks to preserve alternatives.

## Research Findings

Research Findings are the descriptive part of the Design Record. Include only material facts about:

- Existing System;
- Design Inputs;
- Constraints & Dependencies;
- conflicts, evidence gaps, and labelled inferences.

Cite factual claims with representative code locations, artifacts, documentation, or URLs. Label inferences and their supporting facts. Keep recommendations and alternative ranking out of Research Findings.

## Design Decisions

Design Decisions are the normative part of the Design Record. Record material choices about:

- system structure or procedure;
- interfaces and APIs;
- change scope, edge cases, rollout, and verification.

Use Change Scope as two complementary views:

- Impact Areas: affected modules, schema or data, architecture boundaries, API contracts, compatibility constraints, generated artifacts, and rollout impact;
- Planned File Changes: concrete files or directories expected to change and the purpose of each change.

Give each decision its rationale and trade-offs, citing the factual premises that support it. A source supports a premise, not the normative choice itself. Preserve unresolved evidence gaps or conflicts, and keep execution sequencing in the Plan.

## Main Spec review content

### Summary

Summarize the chosen approach, boundary, and rationale without reproducing the Design Record.

### Deferred Follow-Ups (DFU)

Write concise deferred items or `None.` Add an item only when the user explicitly defers it or confirms a discovered functional gap. Exclude current-Spec work, Documentation Sync, and Progress items.
