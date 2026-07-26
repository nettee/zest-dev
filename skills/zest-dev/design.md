# Zest Dev Section Guide: Design

## Designed Contract

Designed Status requires mutually consistent content across:

- `spec.md` → `## Design` → `### Summary`;
- `spec.md` → `## Design` → `### E2E Acceptance Gate (EAG)`;
- `design.md` → `## Research Findings`;
- `design.md` → `## Design Decisions`;
- `spec.md` → `## Deferred Follow-Ups (DFU)`.

The contract defines one reviewable implementation boundary and how its user- or system-visible behavior will be verified.

## Design Approaches

### Lightweight Design Approach

Use this approach by default. Gather only the evidence needed for material premises, resolve only consequential choices, and synthesize the complete Designed Contract without an intensive interview.

### Grilling Design Approach

Use the registered `grilling` and `domain-modeling` skills directly. Their rules own the one-question-at-a-time interview, shared-understanding gate, terminology refinement, scenarios, and selective ADR capture.

During the discussion:

- look up discoverable facts instead of asking the user;
- write confirmed Research Findings and Design Decisions incrementally;
- keep unresolved decisions explicit;
- complete Summary and EAG only after shared understanding.

Before finalizing either approach:

- actively test for underspecified scope, edge cases, contracts, compatibility, testing, and rollout concerns;
- resolve only choices that materially affect the implementation boundary;
- synthesize one recommended design by default instead of leaving equivalent alternatives unresolved.

## Research Findings

Research Findings are the descriptive part of the Design Record. Include only findings that materially inform the design:

- Existing System;
- Design Inputs;
- Constraints & Dependencies;
- source conflicts, evidence gaps, and labelled inferences;
- Key References when inline citations would become noisy.

Rules:

- Cite every factual claim inline or immediately adjacent to it.
- Valid sources include code (`path/to/file:line`), database artifacts, documentation paths or sections, and URLs.
- Label inference separately and cite the facts it depends on.
- State source conflicts and missing evidence instead of silently choosing or assuming.
- Use the smallest representative citations and group same-file references.
- Do not rank alternatives or recommend choices in Research Findings.

## Design Decisions

Design Decisions are the normative part of the Design Record. Record decisions that materially affect behavior, contracts, architecture boundaries, compatibility, rollout, or verification.

Content may include:

- decisions with rationale and trade-offs;
- System Structure or Procedure;
- Interfaces / APIs;
- Change Scope with Impact Areas and Planned File Changes;
- Edge Cases;
- Verification Strategy.

Use Change Scope as two complementary views:

- Impact Areas: affected modules, schema or data, architecture boundaries, API contracts, compatibility constraints, generated artifacts, and rollout impact;
- Planned File Changes: concrete files or directories expected to change and the purpose of each change.

For each decision:

- cite the factual premises that materially support it;
- distinguish sourced premises from the normative choice: a source supports the factual premise, not the normative choice itself;
- preserve unresolved evidence gaps or source conflicts;
- prefer Mermaid when structured relationships need a diagram;
- keep execution sequencing in the Plan.

## Main Spec review content

### Summary

Summarize the chosen approach, boundary, and rationale without reproducing the Design Record.

### E2E Acceptance Gate (EAG)

Write:

- Acceptance behavior: the end-to-end user- or system-visible behavior that must be true.
- Verification path: the command, workflow, or automated check that proves it.

Use a small, preferably single, reviewer-facing automated gate. Do not substitute unit tests, a manual checklist, or a broad case list. If no automated end-to-end gate exists, state that there is no EAG.

### Deferred Follow-Ups (DFU)

Write concise deferred items or `None.` Add an item only when the user explicitly defers it or confirms a discovered functional gap. Do not place current-Spec work, Documentation Sync, or Progress items in DFU.
