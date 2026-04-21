---
description: Clarify requirements and design architecture
---

# Design: Clarify Requirements & Design Architecture

Thin entrypoint for the Zest Dev **Design** phase.

**Language rule:** Always respond in the user's language throughout the flow unless the user asks to switch languages.

Use the Zest Dev skill as the canonical workflow source for this phase.

**Step 1: Enter the Zest Dev Design phase**

Treat this command as a request to run the skill's **Design** workflow.

**Step 2: Let the skill execute the phase**

Inside the skill, follow the canonical Design workflow to:
- verify the active change spec and its readiness
- read the active spec and relevant repository files
- identify underspecified decisions
- ask clarifying questions when needed
- synthesize one recommended architecture by default
- write the Design section and, when needed, a coarse multi-phase Plan
- update status via `zest-dev update active designed`

**Step 3: Keep design opinionated**

Design should capture the recommended approach, trade-offs, implementation steps, and edge cases.

**Step 4: Stop for implementation approval**

After the design is documented, summarize it briefly and wait for approval before coding.

**Important Notes**

- This command is intentionally thin.
- The workflow source lives in `plugin/skills/zest-dev/SKILL.md`.
