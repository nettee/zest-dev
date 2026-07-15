# Zest Dev Phase: New

Canonical workflow for creating a new change spec.

## When to use
- No active spec exists yet
- The user wants to formalize a new requirement

## Outcome
Create and activate a reviewable change spec whose Overview captures the user's actual requirement without inventing missing detail.

## Success means
- The spec was created through `zest-dev create <slug>` and activated through `zest-dev set-active <spec-id>`.
- `## Overview` states the known problem, desired outcome, and material boundaries.
- Any missing information that prevents a useful Overview is resolved with the smallest targeted question.
- The user receives the spec id, path, active status, and recommended next phase.

## Constraints
- Read the created spec before editing it.
- Derive a human-readable name and kebab-case slug from the request.
- Use only information the user provided or explicitly confirmed.

## Overview content may include
- Problem Statement
- Goals
- Scope
- Constraints
- Success Criteria

Do not invent missing sections.

## Stop or block
- Stop after presenting the created and activated spec; do not begin Research unless requested.
- If the request is too vague to state a meaningful problem or outcome, ask for the smallest missing requirement before filling the Overview.
