---
description: Research feature requirements and explore codebase patterns
---

# Research: Understand Requirements & Explore Codebase

Thin entrypoint for the Zest Dev **Research** phase.

**Language rule:** Always respond in the user's language throughout the flow unless the user asks to switch languages.

---

Use the Zest Dev skill as the canonical workflow source for this phase.

**Step 1: Enter the Zest Dev Research phase**

Treat this command as a request to run the skill's **Research** workflow.

**Step 2: Let the skill execute the phase**

Inside the skill, follow the canonical Research workflow to:
- verify the active change spec with `zest-dev status`
- read the active spec from `zest-dev show active`
- clarify missing requirements when necessary
- explore the codebase and read the identified files
- write factual findings into `## Research`
- update status via `zest-dev update active researched`

**Step 3: Keep research factual**

Document facts and available approaches, not recommendations.

**Step 4: Confirm result**

Report what was explored, what files were important, and how to continue into design.

---

## Important Notes

- This command is intentionally thin.
- The workflow source lives in `plugin/skills/zest-dev/SKILL.md`.
