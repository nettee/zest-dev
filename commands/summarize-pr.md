---
description: Summarize a GitHub PR into a spec (for post-hoc documentation)
argument-hint: [pr-number]
---

# Summarize GitHub PR into Spec

**Language rule:** Always respond in the user's language throughout the flow unless the user asks to switch languages.

**Arguments:** $ARGUMENTS
- PR number (optional, defaults to current branch's PR)

**Step 1: Fetch PR data**

```
gh pr view [<pr-number>] --json title,body,state,files,commits
```

**Step 2: Create spec**

Infer a kebab-case slug from the PR title and run:

```
zest-dev create <spec-slug>
```

**Step 3: Fill split spec files**

Read the created `spec.md`, `design.md`, and `implementation.md` files and fill sections. Keep content concise — omit subsections where there's insufficient context rather than padding with guesses.

- **`spec.md` → Overview**: What the PR does and why (from title + body). Skip subsections with no data.
- **`design.md` → Design**: Key approach and files changed. Only if design context is available in the PR.
- **`spec.md` → Progress**: Tasks as completed checkboxes.
- **`implementation.md` → Implementation**: Files modified with line counts and implementation notes. Always fill this for real PRs.
- **`implementation.md` → Verification**: Testing notes from the PR.

**Step 4: Update status**

```
zest-dev update active implemented
```

**Step 5: Show result**

```
zest-dev show active
```

**Guidelines:**
- Write only what the PR data supports — don't invent details
- Prefer leaving a subsection empty over filling it with guesses
- Files modified: list from `gh pr view --json files`, not from the diff
