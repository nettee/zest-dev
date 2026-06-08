# Zest Dev Workflow: Summarize PR

Canonical workflow for turning a GitHub PR into a post-hoc implemented spec.

## When to use
- The user wants to document an already-completed GitHub PR as a spec
- A thin `summarize-pr` command routes here

## Workflow
1. Resolve the target PR number from the command argument or the current branch PR.
2. Fetch the PR data with `gh pr view <pr-number> --json title,body,state,files,commits`.
3. If the PR cannot be fetched, stop and surface the `gh` failure instead of guessing.
4. Infer a concise kebab-case slug from the PR title.
5. Run `zest-dev create <slug>` and capture the returned spec id.
6. Run `zest-dev set-active <spec-id>`.
7. Read the created spec file before writing.
8. Fill the spec using only information supported by the PR metadata:
   - `## Overview`: what changed and why, based on the title and body
   - `## Design`: the approach and affected areas, only when the PR metadata supports that level of detail
   - `## Plan` and `## Notes`: represent the completed implementation concisely, with all work recorded as already done
9. List modified files from `gh pr view --json files`; do not invent details that the PR data does not support.
10. After the spec content is complete, run `zest-dev update active implemented`.
11. Run `zest-dev show active` and report the created spec id and path.
