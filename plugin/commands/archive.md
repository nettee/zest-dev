---
description: Merge implemented active change spec into current specs and unset active
allowed-tools: Read, Edit, Write, Bash(zest-dev:*), Glob, Grep
---

# Archive Active Change Spec

Merge the implemented active change spec into `specs/current/` files, then unset the active change spec.

## Step 1: Verify active change spec is ready

1. Run `zest-dev status` and confirm there is an active change spec.
2. Run `zest-dev show active` and confirm status is `implemented`.

If not implemented, stop and tell the user to run implementation and set status first.

## Step 2: Inspect existing `specs/current/`

Inspect `specs/current/` files to understand current organization and topics before editing.

## Step 3: Decide merge targets and shape

Read the active change spec and decide how its knowledge should be merged into `specs/current/`.

- Prefer semantic placement over rigid heading-to-file rules.
- Update existing topic files when appropriate.
- Create new topic files when needed.
- Keep `specs/current/` concise and coherent.

If merge target or structure is unclear, ask the user a short clarifying question before editing.

## Step 4: Perform the merge directly in files

Apply the chosen edits directly to `specs/current/` markdown files.

## Step 5: Unset active change spec

After merge edits are complete, run:

`zest-dev unset-active`

## Step 6: Report result

Provide a concise summary including:
- active change spec id
- updated `specs/current/` files
- whether a clarification was needed
- confirmation that `zest-dev unset-active` succeeded
