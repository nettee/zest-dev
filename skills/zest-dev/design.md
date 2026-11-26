# Zest Dev Section Guide: Design

## Designed Contract

Designed Status requires mutually consistent content across:

- `spec.md` → `## Overview`;
- `spec.md` → `## Requirements`;
- `spec.md` → `## Design`.

Do not create a separate `design.md` Design Record. Keep the Design section short.

## Design content

Write a brief implementation approach: the chosen shape of the change and any material decisions needed to start planning. Prefer a short prose block or a few bullets.

Resolve ambiguities that materially affect scope, contracts, compatibility, verification, or rollout. Synthesize one recommended approach unless the user asks to preserve alternatives.

Leave detailed research notes, long rationale trees, and file-by-file inventories out of the Spec unless the user asks for them. Put execution sequencing in the Plan.
