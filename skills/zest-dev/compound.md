# Zest Dev Workflow: Compound

Canonical workflow for turning useful session knowledge into a durable spec document.

## When to use
- The user wants to preserve decisions, findings, or lessons from the current session
- A thin `compound` command routes here

## Workflow
1. Run `zest-dev status` to inspect whether there is an active change spec and which historical specs already exist.
2. Use that status to decide the storage choices to offer the user:
   - Always offer `specs/solutions/` for knowledge that should live outside any single change spec.
   - If an active change spec exists, offer `specs/change/<active-spec-directory>/` for knowledge tied directly to current work.
   - If historical specs exist, allow the user to name one explicitly and verify it with `zest-dev show <spec-id>` before writing.
3. If the right destination is ambiguous, ask the user where this knowledge should live before writing anything.
4. Extract only durable, non-obvious knowledge from the current conversation, using the optional topic hint to focus the write-up when it helps.
5. Capture only information the conversation genuinely supports:
   - the context that led to the work
   - key findings or root causes
   - the solution or decision that proved useful
   - lessons learned or future guidance worth preserving
6. Choose a concise slug-style filename that describes the topic.
7. Write a single markdown document at the chosen destination:
   - standalone knowledge goes in `specs/solutions/<filename>.md`
   - active-spec knowledge goes in `specs/change/<active-spec-directory>/<filename>.md`
   - historical-spec knowledge goes in `specs/change/<historical-spec-directory>/<filename>.md`
8. If the destination directory does not exist, create it before writing.
9. Use a compact markdown structure with only meaningful sections:
   - frontmatter with `title` and `date`
   - `## Context`
   - `## Key Findings`
   - `## Solution / Outcome`
   - `## Lessons Learned`
   - `## Prevention / Future Guidance`
10. Omit empty sections instead of padding the document with guesses.
11. Report the file path you wrote and a one-sentence summary of the knowledge captured.
