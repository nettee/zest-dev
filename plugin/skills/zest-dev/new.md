# Zest Dev Phase: New

Canonical workflow for creating a new change spec.

## When to use
- No active spec exists yet
- The user wants to formalize a new requirement
- A thin `new` command routes here

## Workflow
1. Extract a human-readable name and kebab-case slug.
2. Run `zest-dev create <slug>`.
3. Set the created spec active with `zest-dev set-active <spec-id>`.
4. Read the created spec file.
5. Fill `## Overview` using only information the user actually provided.
6. Ask clarifying questions only when the requirement is too vague to produce a useful overview.
7. Confirm spec id, path, active status, and next step.

## Overview content may include
- Problem Statement
- Goals
- Scope
- Constraints
- Success Criteria

Do not invent missing sections.
