---
description: Crystallize a discussion into a spec, then proceed step by step
argument-hint: [optional spec-slug]
allowed-tools: Read, Write, Edit, Bash(zest-dev:*), AskUserQuestion
---

# Draft: Discussion → Spec → Guided Next Steps

Synthesize the current conversation into a well-formed spec, then decide how to continue.

**Spec slug (optional):** $ARGUMENTS

This command is for when you've been chatting and brainstorming with the user and want to formalize the ideas into a spec before implementation. Unlike `/new` (brief description) or `/summarize-chat` (post-hoc capture), `/draft` captures an active discussion in progress and guides the next development steps.

---

## Step 1: Analyze Conversation

Review the conversation history to extract:
- **Core goal**: What the user ultimately wants to build or solve
- **Problem context**: Why this matters and what pain it addresses
- **Ideas discussed**: Approaches, options, constraints mentioned
- **Open questions**: Things still undecided or unclear
- **Scope signals**: What's in vs out, even if stated informally

If the conversation is too early or vague to draft a spec, use AskUserQuestion to ask:
- "What's the core thing you're trying to build?"
- "What problem does this solve?"

## Step 2: Infer or Confirm Spec Slug

If `$ARGUMENTS` is provided, use it as the spec slug.

Otherwise, infer a kebab-case slug from the main goal.
Example: "Add webhook support for notifications" → `webhook-notifications`

If unsure, confirm with the user before proceeding.

## Step 3: Create Spec via CLI

Execute: `zest-dev create <spec-slug>`

Then set it as active: `zest-dev set-active <spec-id>`

## Step 4: Fill Overview Section

Read the created spec file from `specs/change/`.

Write the Overview based on the conversation. **Only include sections for information that actually came up** — do not invent or assume details.

**Possible sections (include only if discussed):**
- **Problem Statement**: What problem is being solved and why it matters
- **Goals**: What the feature should accomplish
- **Scope**: What's included vs explicitly excluded
- **Constraints**: Technical limitations, requirements, or dependencies
- **Ideas & Approaches**: Options discussed (without picking one — that's for design)
- **Open Questions**: Things not yet decided
- **Success Criteria**: How to measure if the feature is successful

**Format:**
- Use bullet points for clarity
- Keep descriptions brief (1-2 sentences per item)
- Focus on "what" and "why", not "how" (implementation comes later)
- Capture the spirit of the discussion, not a transcript

**Example with discussion context:**

```markdown
## Overview

### Problem Statement
- Users lose context when switching between tasks mid-conversation
- No way to bookmark a discussion state for later

### Goals
- Let users save and restore conversation checkpoints
- Support tagging checkpoints for easy retrieval

### Ideas & Approaches
- Store checkpoints as local files vs remote database (not yet decided)
- Could piggyback on existing export functionality

### Open Questions
- Should checkpoints be project-scoped or global?
- What's the retention policy?

### Constraints
- Must not break existing conversation flow
- No changes to backend schema in this phase
```

## Step 5: Determine Spec Status

Evaluate the conversation to determine the appropriate starting status. Assess each stage in sequence:

**`new`** — the default. The discussion identified the problem and goals but did not explore the codebase or settle on an architecture.

**`researched`** — advance to this if the conversation included genuine codebase exploration: files were read, existing patterns were identified, and available approaches were surfaced. Casual mention of an idea does not count.

**`designed`** — advance to this if the conversation went further and produced a concrete architectural decision: components, data flow, implementation steps, and key trade-offs were resolved and agreed upon.

Apply the highest status the conversation genuinely reached, then execute the CLI command:
- Status is `new`: no update needed (spec is already `new`)
- Status is `researched`: fill the Research section from conversation context, then run `zest-dev update active researched`
- Status is `designed`: fill both Research and Design sections from conversation context, then run `zest-dev update active designed`

When filling sections from conversation context, follow the same content rules as `/research` and `/design` respectively — facts in Research, decisions and architecture in Design.

## Step 6: Ask How to Proceed

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

Use AskUserQuestion with these options, or proceed directly if the conversation makes the answer obvious.

## Step 7: Execute Chosen Path

Based on the user's choice:

- **Research**: Proceed as `/research` would — clarify requirements, launch explorer agents, document findings, update status to `researched`
- **Design**: Proceed as `/design` would — identify underspecified aspects, ask clarifying questions, launch architect agents, document chosen design, update status to `designed`
- **Research then Design**: Run research phase fully, then run design phase
- **Implement**: Guide user to `/implement` (do not run it inline — implementation is long-running)
- **Stop here**: Confirm the spec is saved and guide them to the appropriate next command

## Step 8: Confirm Completion

Inform the user:
- Spec id and name
- Spec file location: `specs/change/<spec-id>/spec.md`
- What sections were filled in Overview
- Current status and what was run (if research/design was executed)
- Next command to use when they're ready to continue

---

## Important Notes

- **This is a discussion → spec bridge**: The goal is to capture what was talked about, not to start fresh
- **Preserve open questions**: If something was undecided in conversation, record it as an open question — don't resolve it silently
- **Don't fill in gaps**: If the user didn't discuss scope, don't invent scope
- **Ideas ≠ Design**: Capture brainstormed approaches in "Ideas & Approaches" — leave evaluation for the design phase
- **Lean toward asking**: When unsure whether to proceed with research or design, ask
