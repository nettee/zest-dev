# Create Pull Request (General Version)

## Task

Create a GitHub Pull Request for the changes on the current branch.

## Steps

You need to strictly follow the following steps in order:

### 1. Checkout to a new branch

Create a PR-specific branch from the current branch by checking out a new branch named with the current branch name plus `-pr` as the suffix.

### 2. Identify the main branch name

Run the following command:

```bash
git rev-parse --abbrev-ref origin/HEAD
```

### 3. Update the main branch

Run the following command to sync the local main branch with the remote main branch:

```bash
git fetch origin <main_branch_name>:<main_branch_name>
```

### 4. Generate a commit message

Compare the changes between the current branch and the main branch. Note: Use a three-dot comparison, i.e., compare the changes from the **merge base** (common ancestor) to the current branch.

```bash
git diff <main_branch_name>...HEAD
```

Based on the changes between the current branch and the main branch, summarize the changes and write a proper commit title and commit message.

Commit title notes:

1. Use a single short sentence to describe the overall code changes.
2. Example: `feat: Add workflow generation API`
3. Use English only.

Commit message notes:

1. Summarize the main changes using a list. The number of list items should be adjusted depending on the number of main changes; fewer changes mean a shorter list, more changes mean a longer list.
2. **MUST NOT** include Co-Author information in the commit message.

### 5. Squash into one commit

Run the following commands to squash all changes in the current branch into a single commit:

```bash
# 1. Reset to the fork point with the main branch, keeping all changes staged
git reset --soft $(git merge-base <main_branch_name> HEAD)

# 2. Create a new commit with the combined changes
git commit -m "<commit_message>"
```

### 6. Push the branch to the remote repository

```bash
git push -u origin HEAD
```

### 7. Generate Pull Request Body

Draft the PR body according to the changes in the current branch.

Notes:

1. Write entirely in English.
2. Keep it concise, avoid verbose or complex language, and make it sound like it was written by a human, not a machine.
3. Refer to the following template:

```markdown
## Summary

This PR fixes an issue where action results always recorded the chat model name regardless of the actual execution mode. Now the system correctly records:
- Copilot model name when running in `copilot_agent` mode
- Agent model name when running in `node_agent` mode  
- Chat model name as fallback for other modes

## Changes

- Extracted `ModelConfigMap` as a standalone type for better code organization
- Added `getModelNameForMode()` helper function to select the appropriate model name based on execution mode
- Updated action result creation to use the correct model name instead of always using `chat.modelId`
```

### 8. Create Pull Request

Use the commit title as the PR title and the previously generated PR body. Run the following command to create a PR using the GitHub CLI:

```bash
gh pr create --base <main_branch_name> --title "PR title" --body "PR body"
```

### 9. Wait for PR checks to pass

Run the following command to monitor PR checks (excluding coderabbit):

```bash
gh pr checks --watch --fail-fast --required
```

Note: Wait until all required checks pass (coderabbit check can be ignored).

### 10. Show the Pull Request link

Finally, inform the user of the created PR link so the user can click and access it directly.
