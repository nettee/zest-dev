# Zest Dev Section Guide: Plan

## Planned Contract

Planned Status requires:

- a `## Plan` containing a compact sequence of ticket-scale implementation slices;
- a `## Progress` checklist whose titles exactly mirror the Plan Tickets;
- an EAG Validation ticket after functional implementation;
- a final Documentation Sync ticket when documented behavior, usage, setup, commands, or workflows may change.

## Ticket slicing

- When available, use the registered `to-tickets` skill as the reference for scale and sequencing.
- Write Spec-local Plan Tickets. Do not create GitHub issues or external issue-tracker entries unless the user explicitly asks for that.
- Prefer independently meaningful, verifiable tracer-bullet slices that fit one focused agent session. Split around visible workflows, integration boundaries, migrations, rollout, or stabilization instead of technical layers unless one layer is the entire change.
- Record genuine blocking dependencies.
- Use `AFK` when the Spec and repository provide enough context. Use `HITL` only for required human judgment, human-only or dangerous execution, or human validation; documentation alone is not HITL.

## Plan Ticket format

Do not use markdown checkboxes in `## Plan`.

```markdown
### Ticket N (AFK|HITL): Title

Goal: <meaningful outcome>
Scope: <bounded implementation and validation scope>
Depends on: <Ticket N or None>
```

Add acceptance criteria only to remove material ambiguity.

## EAG Validation

Place this ticket after functional work and before Documentation Sync. Reuse the Design Section's acceptance behavior and verification path; if there is no EAG, confirm that fact and use the best Spec-defined validation.

## Documentation Sync

Include this final ticket when implementation may affect documented behavior or workflows. Name the areas to re-evaluate after behavior is final; add glossary or ADR work only when the change requires it.

## Progress Checklist

Add or update `spec.md` → `## Progress` with a thin progress checklist:

```markdown
- [ ] Ticket N (AFK|HITL): Title
```

Mirror Plan Ticket titles exactly, keep each item to the title, and exclude DFU items.
