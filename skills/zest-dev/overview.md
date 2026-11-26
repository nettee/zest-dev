# Zest Dev Section Guide: Overview & Requirements

## Overview content contract

`spec.md` → `## Overview` captures the functional boundary:

- in scope and out of scope;
- constraints that bound the change;
- any rollout or compatibility boundary that affects what is in scope.

Include only content that adds information. Do not invent missing requirements.

## Requirements content contract

`spec.md` → `## Requirements` captures requirement semantics:

- the problem and motivation when not already obvious from Overview;
- desired behaviors and outcomes in user- or system-visible terms;
- success criteria.

Keep this about meaning and acceptance, not file-level implementation.

## Designed Status input

Designed Status requires Overview, Requirements, and a short Design to be mutually consistent. Overview owns boundary; Requirements owns semantics; Design owns the brief approach.

## New Spec requirements

- Derive a concise human-readable name and kebab-case slug, then run `zest-dev create <slug>` and `zest-dev set-active <spec-id>`.
- Read the generated Spec and use only provided, discovered, or explicitly confirmed information.
- Resolve only missing information that prevents a meaningful Overview and Requirements.

New Status means Overview/Requirements may still be incomplete and Designed Status has not yet been reached.
