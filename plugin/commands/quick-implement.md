---
description: Run all remaining workflow stages end-to-end for simple tasks with approval checkpoints
argument-hint: <description of feature or requirement>
---

# Quick Implement

Thin bridge entrypoint for running the remaining Zest Dev phases end-to-end.

**Language rule:** Always respond in the user's language throughout the flow unless the user asks to switch languages.

Handles two scenarios:
- **New requirement**: No active change spec — creates a spec, confirms requirements, then runs all stages.
- **Existing spec**: An active change spec is already set — picks up from the appropriate stage based on its status.

**User's description:** $ARGUMENTS

---

## Step 0: Detect the starting point

Run `zest-dev status` to check if there is an active change spec set.

**If an active change spec exists:**
- Run `zest-dev show active` to read its content and status.
- Use the current status only to determine which canonical Zest Dev phases still need to run.
- If status is `implemented`, inform the user and stop.

**If no active change spec exists:**
- Proceed to the [New](#new) section below

---

## New

*Only when no active change spec exists.*

Use the Zest Dev skill's **New** phase to create the spec and fill Overview briefly.

---

## Checkpoint 1: Confirm requirements

If this command created a new spec, confirm the filled Overview with the user before moving into research.

---

## Stage 1: Research

Enter the Zest Dev skill's **Research** phase and let it run the canonical research workflow.

---

## Stage 2: Design

Enter the Zest Dev skill's **Design** phase and let it run the canonical design workflow.

---

## Checkpoint 2: Approve implementation

After design is ready, present a brief summary and get explicit approval before entering the Implement phase.

---

## Stage 3: Implement

Enter the Zest Dev skill's **Implement** phase and let it run the canonical implementation workflow.

---

## Stage 4: Final review

After implementation, review the result, address critical issues, and confirm what status the spec reached.

---

## Important Notes

- This command is intentionally thin.
- It reuses the Zest Dev skill's canonical phase workflows.
- For complex work, prefer the individual stage commands.
