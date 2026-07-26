# Zest Dev Section Guide: Plan

## Planned Contract

Planned Status requires:

- a `## Plan` containing a compact sequence of ticket-scale implementation slices;
- a `## Progress` checklist whose titles exactly mirror the Plan Tickets;
- an EAG Validation ticket after functional implementation;
- a final Documentation Sync ticket when documented behavior, usage, setup, commands, or workflows may change.

## Ticket slicing

- Use the slicing spirit of Matt Pocock's registered `to-tickets` skill as a reference for scale and sequencing.
- Write Spec-local Plan Tickets. Do not create GitHub issues or external issue-tracker entries unless the user explicitly asks for that.
- Prefer thin tracer-bullet vertical slices that are independently meaningful and verifiable.
- Avoid horizontal splits by schema, backend, UI, docs, or tests unless that layer is genuinely the whole change.
- Keep each ticket within one focused coding-agent session.
- Capture genuine blocking dependencies.
- Use `AFK` when an agent can complete the ticket from the Spec and repository context.
- Use `HITL` only when continuing requires human judgment, human-only or dangerous execution, or human validation.

## Plan Ticket format

Do not use markdown checkboxes in `## Plan`.

```markdown
### Ticket N (AFK|HITL): Title

Goal: <meaningful outcome>
Scope: <bounded implementation and validation scope>
Depends on: <Ticket N or None>
```

Add acceptance criteria only when needed to remove ambiguity.

## EAG Validation

- Place this ticket after functional work and before Documentation Sync.
- Reuse the Design Section's acceptance behavior and verification path without redefining them.
- When the Design says there is no EAG, confirm that fact and use the best Spec-defined validation.

## Documentation Sync

- Include this final ticket when implementation may affect documented behavior or workflows.
- Name the documentation areas to re-evaluate after behavior is final.
- Do not automatically add glossary or ADR work unless the change genuinely requires it.

## Progress Checklist

Add or update `spec.md` → `## Progress` with a thin progress checklist:

```markdown
- [ ] Ticket N (AFK|HITL): Title
```

- Mirror Plan Ticket titles exactly.
- Keep each item to the title only.
- Exclude DFU items.
