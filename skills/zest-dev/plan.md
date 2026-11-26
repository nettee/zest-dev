# Zest Dev Section Guide: Plan

## Planned Contract

Planned Status requires:

- a `## Plan` that splits the work into ticket-scale implementation slices;
- a `## Progress` checklist that tracks those slices;
- a strong Documentation Sync reminder whenever documented behavior, usage, setup, commands, or workflows may change.

## Ticket slicing

- When available, use the registered `to-tickets` skill as the reference for scale and sequencing.
- Write Spec-local Plan tickets. Do not create GitHub issues or external issue-tracker entries unless the user explicitly asks for that.
- Prefer independently meaningful, verifiable tracer-bullet slices that fit one focused agent session. Split around visible workflows, integration boundaries, migrations, rollout, or stabilization instead of technical layers unless one layer is the entire change.
- Record genuine blocking dependencies when they matter.
- Ticket format is flexible. Do not require AFK/HITL labels, fixed field templates, or checkbox syntax inside `## Plan`.

## Documentation Sync

Strongly include a final Documentation Sync ticket when implementation may affect documented behavior or workflows. Name the areas to re-evaluate after behavior is final. Treat this as current-Spec work, not an optional afterthought.

## Progress

Keep `## Progress` as a thin completion checklist aligned with the Plan slices. Exact formatting may stay lightweight; titles should remain recognizable against the Plan.
