# Zest Dev Workflow: Summarize Chat

Canonical workflow for turning the current conversation or coding session into a post-hoc spec.

## When to use
- The user wants to capture the current chat, vibe-coding session, or completed work into a spec
- A thin `summarize-chat` or `summarize` command routes here

## Workflow
1. Review the conversation and worklog before writing.
2. Extract only supported facts:
   - the original task or goal
   - design decisions and rejected alternatives
   - challenges encountered and how they were resolved
   - relevant files touched or discussed
   - whether any code was actually written, tested, or validated
3. Infer the highest justified spec status from the evidence in the conversation:
   - `new`: problem and goals are identified, but no real exploration happened
   - `researched`: codebase facts, options, or constraints were investigated
   - `designed`: a concrete implementation approach and tradeoffs were chosen
   - `planned`: issue-scale implementation steps were defined
   - `implemented`: code was completed and the relevant tests or validation actually ran successfully
4. If the highest justified status is ambiguous, ask the user to choose the intended status instead of guessing.
5. Resolve a concise kebab-case slug from the command argument or the task being documented.
6. Run `zest-dev create <slug>` and capture the returned spec id.
7. Run `zest-dev set-active <spec-id>`.
8. Read the created spec file before writing.
9. Fill only the sections justified by the inferred status:
   - `## Overview` for every status
   - `## Research` only for `researched` or later, using conversation-backed facts only
   - `## Design` only for `designed` or later, including the chosen approach and tradeoffs
   - `## Plan` only for `planned` or later, using issue-scale `Step 1`, `Step 2`, and so on
   - `## Notes` only when the conversation provides meaningful implementation, progress, verification, or follow-up detail
10. Keep every section concise and factual; omit unsupported subsections instead of padding with guesses.
11. Use `zest-dev update active <status>` for status transitions above `new`.
12. Run `zest-dev show active` and report the created spec id, path, filled sections, and final status.
