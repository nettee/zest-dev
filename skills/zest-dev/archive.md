# Zest Dev Workflow: Archive

Canonical workflow for merging an implemented active change spec into `specs/current/`.

## When to use
- The active change spec should become durable current-state documentation
- A thin `archive` command routes here

## Workflow
1. Run `zest-dev status` and verify an active change spec exists.
2. Run `zest-dev show active` and verify the active spec status is `implemented`.
3. If no active spec exists or the status is not `implemented`, stop and tell the user what is missing.
4. Read the active spec and inspect the existing `specs/current/` files before editing.
5. Merge the active spec's durable knowledge into the appropriate `specs/current/` files.
6. Prefer updating existing current-spec files when they already cover the topic; create a new current-spec file only when the topic does not fit the existing structure.
7. Keep `specs/current/` concise and coherent; do not copy speculative implementation notes that do not belong in current-state docs.
8. After the merge is complete, run `zest-dev unset-active`.
9. Report the active spec id, the `specs/current/` files you updated, and whether `zest-dev unset-active` succeeded.
