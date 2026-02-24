---
description: Summarize a GitHub PR into a spec (for post-hoc documentation)
argument-hint: [pr-number]
allowed-tools: Read, Write, Edit, Bash(gh:*), Bash(zest-dev:*), AskUserQuestion
---

# Summarize GitHub PR into Spec

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

**Step 3: Fill spec**

Read the created file and fill sections. Keep content concise — omit subsections where there's insufficient context rather than padding with guesses.

- **Overview**: What the PR does and why (from title + body). Skip subsections with no data.
- **Design**: Key approach and files changed. Only if design context is available in the PR.
- **Implementation**: Tasks (all `[x]`), files modified with line counts, testing notes. Always fill this for real PRs.

**Step 4: Update status**

```
zest-dev update current implemented
```

**Step 5: Show result**

```
zest-dev show current
```

**Guidelines:**
- Write only what the PR data supports — don't invent details
- Prefer leaving a subsection empty over filling it with guesses
- Files modified: list from `gh pr view --json files`, not from the diff
