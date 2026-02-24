---
description: Document knowledge and experience from the current session into a permanent record
argument-hint: "[optional: brief topic hint]"
allowed-tools: Read, Write, Bash(zest-dev:*), AskUserQuestion
---

# Compound: Knowledge Documentation

Capture knowledge, decisions, and hard-won experience from the current conversation into a permanent, searchable document.

**Topic hint (if provided):** $ARGUMENTS

---

## Why Compound?

Every solved problem, key decision, or discovered pattern exists only in the current conversation. Once this session ends, that context is gone. Compound fixes this — turning ephemeral conversation into durable team knowledge.

---

## Step 1: Check Project State

Run `zest-dev status` to determine:
- Whether there is a current spec set
- The list of existing specs (for historical placement)

---

## Step 2: Ask Where to Save

Present the user with storage options using AskUserQuestion. Build the options dynamically based on the output of Step 1:

**Always include:**
- `specs/solutions/` — standalone solutions folder, for general knowledge not tied to a specific spec

**Include if a current spec is set:**
- Current spec folder: `specs/<current-spec-directory>/` — knowledge directly related to the work in progress

**Include if historical specs exist:**
- A historical spec — let the user type the spec id directly (e.g. `20260224-my-feature`), then resolve details by running `zest-dev show <spec-id>`

---

## Step 3: Extract Knowledge from Conversation

Analyze the conversation history and extract the following. Use the topic hint from $ARGUMENTS if provided to focus the extraction.

**What to capture:**

- **Situation / Context**: What was being worked on? What triggered this?
- **Key Findings**: What was discovered? What was the root cause or insight?
- **Solution / Outcome**: What worked? What was decided or implemented?
- **Lessons Learned**: What would you do differently? What should others know?
- **Prevention / Guidance**: How to avoid the same issue or apply the same insight in the future?

**Scope is broad** — this is not limited to bug fixes. Document any of:
- A technical problem solved
- An architectural decision made with its rationale
- A research finding worth preserving
- A process or workflow insight
- A pattern discovered in the codebase

Capture only what is genuinely valuable and non-obvious. Be concise.

---

## Step 4: Generate Filename

Create a slug-style filename that describes the content:

- Use lowercase, hyphen-separated words
- Describe the core topic (not the date or category)
- Keep it short but descriptive
- Examples: `redis-connection-timeout-fix.md`, `why-we-chose-event-sourcing.md`, `api-rate-limit-handling.md`

---

## Step 5: Write the Document

Determine the final path based on the user's choice in Step 2:
- Standalone: `specs/solutions/<filename>.md`
- Current spec: `specs/<current-spec-directory>/<filename>.md`
- Historical spec: `specs/<historical-spec-directory>/<filename>.md`

Create the directory if it does not exist (`mkdir -p`).

Write a single markdown file with this structure:

```markdown
---
title: "<descriptive title of what was learned or solved>"
date: "<YYYY-MM-DD>"
---

## Context

[What was being worked on. What triggered this situation.]

## Key Findings

[The core insight, root cause, or discovery.]

## Solution / Outcome

[What worked. Concrete steps, decisions, or code if relevant. Keep it brief and direct.]

## Lessons Learned

[What to take away. What would you do differently. Non-obvious things others should know.]

## Prevention / Future Guidance

[How to avoid the problem or apply this knowledge proactively next time.]
```

Only include sections that have meaningful content. If a section has nothing useful to say, omit it.

---

## Step 6: Confirm

Tell the user:
- The file has been written and its path
- A one-sentence summary of what was captured

Offer a simple follow-up:
- Continue working
- View the document just created
