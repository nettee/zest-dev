---
description: Create a new feature spec from description
argument-hint: <description of feature or requirement>
---

# Create New Feature Spec

Thin entrypoint for the Zest Dev **New** phase.

**Language rule:** Always respond in the user's language throughout the flow unless the user asks to switch languages.

**User's description:** $ARGUMENTS

---

Use the Zest Dev skill as the canonical workflow source for this phase.

**Step 1: Enter the Zest Dev New phase**

Treat this command as a request to run the skill's **New** workflow.

**Step 2: Pass along the user description**

Use the description below as the source requirement when creating the spec:

`$ARGUMENTS`

**Step 3: Let the skill execute the phase**

Inside the skill, follow the canonical New workflow to:
- determine name and slug
- run `zest-dev create <slug>`
- run `zest-dev set-active <spec-id>`
- read the created spec file
- fill `## Overview` using only information the user actually provided
- ask clarification questions only if the request is too vague

**Step 4: Confirm result**

Report the new spec id, path, active status, and the recommended next phase.

---

**Important Notes**

- This command is intentionally thin.
- The workflow source lives in `plugin/skills/zest-dev/SKILL.md`.
