---
description: Crystallize a discussion into a spec, then proceed step by step
argument-hint: [optional spec-slug]
---

# Draft: Discussion → Spec → Guided Next Steps

Bridge entrypoint into the Zest Dev skill.

**Language rule:** Always respond in the user's language throughout the flow unless the user asks to switch languages.

**Spec slug (optional):** $ARGUMENTS

This command is for when you've been chatting and brainstorming with the user and want to formalize the ideas into a spec before implementation. Unlike `/new` (brief description) or `/summarize-chat` (post-hoc capture), `/draft` captures an active discussion in progress and then routes into the appropriate Zest Dev phase.

---

## Step 1: Capture the current discussion into a spec

Use this command as a lightweight bridge:
- extract the core goal, context, constraints, open questions, and scope signals from the conversation
- infer or confirm a slug from `$ARGUMENTS`
- create the spec with `zest-dev create <slug>`
- set it active with `zest-dev set-active <spec-id>`
- fill `## Overview` briefly using only conversation-backed information
- infer the highest status genuinely reached by the conversation

If the conversation already reached research or design depth, fill those sections briefly using the same canonical rules from the Zest Dev skill.

## Step 2: Route into the next Zest Dev phase

After the spec is created and status set, present next-step options **based on the current status**:

**If status is `new`:**
```
1. Research — Explore the codebase and identify available approaches
2. Design — Jump straight to architecture (skip research if not needed)
3. Research then Design — Do both in sequence
4. Stop here — I'll continue manually when ready
```

**If status is `researched`:**
```
1. Design — Design the architecture based on research findings
2. Stop here — I'll continue manually when ready
```

**If status is `designed`:**
```
1. Implement — Start building the feature
2. Stop here — I'll continue manually when ready
```

Use the question tool with these options, or proceed directly if the conversation makes the answer obvious.

## Step 3: Reuse the canonical skill workflow

Based on the user's choice:

- **Research**: enter the Zest Dev skill's Research phase
- **Design**: enter the Zest Dev skill's Design phase
- **Research then Design**: run the skill's Research phase, then its Design phase
- **Implement**: guide the user to `/implement` or enter the skill's Implement phase only if they explicitly want to proceed now
- **Stop here**: confirm the spec is saved and point to the next command

## Step 4: Confirm completion

Inform the user:
- Spec id and name
- Spec file location: `specs/change/<spec-id>/spec.md`
- What sections were filled in Overview
- Current status and what was run (if research/design was executed)
- Next command to use when they're ready to continue

---

## Important Notes

- This command is intentionally thin.
- Preserve open questions instead of resolving them silently.
- The workflow source lives in `plugin/skills/zest-dev/SKILL.md`.
