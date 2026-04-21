---
description: Build feature following the design
---

# Implement: Build the Feature

Thin entrypoint for the Zest Dev **Implement** phase.

**Language rule:** Always respond in the user's language throughout the flow unless the user asks to switch languages.

Use the Zest Dev skill as the canonical workflow source for this phase.

**Step 1: Enter the Zest Dev Implement phase**

Treat this command as a request to run the skill's **Implement** workflow.

**Step 2: Let the skill execute the phase**

Inside the skill, follow the canonical Implement workflow to:
- verify the active change spec with `zest-dev status`
- read the active spec from `zest-dev show active`
- read all relevant implementation files before coding
- create a task list
- get explicit user approval before writing code
- implement according to the design and repository conventions
- write or update tests alongside the change
- mark completed `## Plan` items as `[x]`
- document `### Implementation` and `### Verification` under `## Notes`

**Step 3: Respect incremental delivery**

If only part of the plan is complete, do not mark the spec `implemented` yet.
Only when the full spec is complete, execute: `zest-dev update active implemented`

**Step 7: Update Spec Status (Only When Fully Complete)**

- If only part of the spec is implemented, keep the current in-progress status.
- Only when the full spec is complete, execute: `zest-dev update active implemented`

**Step 4: Confirm result**

Report implemented scope, verification, spec notes, and whether the status advanced.

**Important Notes**

- This command is intentionally thin.
- The workflow source lives in `plugin/skills/zest-dev/SKILL.md`.
