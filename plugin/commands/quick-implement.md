---
description: Run all remaining workflow stages end-to-end for simple tasks with approval checkpoints
argument-hint: <description of feature or requirement>
allowed-tools: Read, Edit, Write, Bash, Task, Glob, Grep, TodoWrite, AskUserQuestion
---

# Quick Implement

Run through all remaining workflow stages — research, design, implement, and final review — in a single command. Suitable for straightforward, well-scoped tasks.

Handles two scenarios:
- **New requirement**: No current spec — creates a spec, confirms requirements, then runs all stages.
- **Existing spec**: A spec is already set as current — picks up from the appropriate stage based on its status.

**User's description:** $ARGUMENTS

---

## Step 0: Detect Starting Point

Run `zest-dev status` to check if there is a current spec set.

**If a current spec exists:**
- Run `zest-dev show current` to read its content and current status
- Skip ahead based on status:
  - `new` → skip "New" and "Checkpoint 1", go directly to [Stage 1: Research](#stage-1-research)
  - `researched` → skip to [Stage 2: Design](#stage-2-design)
  - `designed` → skip to [Checkpoint 2: Approve Implementation](#checkpoint-2-approve-implementation)
  - `implemented` → inform the user the spec is already fully implemented and exit
- Create a task list covering only the remaining stages

**If no current spec exists:**
- Proceed to the [New](#new) section below

---

## New

*Only when no current spec exists.*

**Step 1: Create Spec**

Analyze the user's description and determine:
- **Spec name**: Human-readable name (e.g., "User Authentication System")
- **Spec slug**: URL-friendly identifier in kebab-case (e.g., "user-authentication-system")

Execute: `zest-dev create <spec-slug>`

Then set it as current: `zest-dev set-current <spec-id>`

**Step 2: Fill Overview Section**

Read the created spec file. Edit the Overview section with:
- **Problem Statement**: What problem is being solved and why it matters
- **Goals**: What the feature should accomplish
- **Scope**: What's included and what's explicitly excluded
- **Constraints**: Technical limitations, requirements, or dependencies
- **Success Criteria**: How to measure if the feature is successful

Keep it brief — bullet points, 1-2 sentences each.

**Step 3: Create Task List**

Use TodoWrite to create a task list tracking all four stages:
- [Checkpoint] Confirm requirements with user
- Research codebase
- Design architecture
- [Checkpoint] Await user approval to implement
- Implement feature
- Final review

---

## Checkpoint 1: Confirm Requirements

*Only when a new spec was created in the [New](#new) section above.*

**Step 4: Present Requirements & Ask for Approval**

Present the filled Overview to the user. Identify any gaps or ambiguities:
- Is the problem statement clear?
- Are the goals and scope well-defined?
- Are there constraints or unknowns that need resolving?

Ask the user to confirm the requirements are correct and complete before research begins.

Use AskUserQuestion with options:
- **Requirements look good — start research** — proceed with the research phase
- **Need to clarify first** — ask follow-up questions, update the Overview section, then ask again

Do not proceed until requirements are confirmed.

---

## Stage 1: Research

**Step 5: Explore Codebase**

Launch 1-2 code-explorer agents **in parallel** using the Task tool. Focus on:
- Existing patterns and conventions relevant to the feature
- Files and modules likely to be affected

**Step 6: Read Identified Files**

Read the key files identified by the agents before proceeding.

**Step 7: Document Research**

Edit the spec file's Research section with findings:
- **Existing System**: Current code and patterns relevant to this task
- **Available Approaches**: Technical options (no ranking or recommendations)
- **Constraints**: Hard requirements, compatibility needs
- **Key References**: Important files (`file:line` format)

**Step 8: Update Status**

Execute: `zest-dev update current researched`

---

## Stage 2: Design

**Step 9: Launch Architect Agent**

Launch a single code-architect agent using the Task tool. Instruct it to design a pragmatic, minimal solution that:
- Reuses existing patterns and conventions
- Minimizes new abstractions
- Produces a clear step-by-step implementation plan

**Step 10: Document Design**

Edit the spec file's Design section with the chosen architecture:
- Architecture overview (use ASCII diagrams or flowcharts for clarity)
- Ordered implementation steps
- Pseudocode for non-trivial logic
- Files to create or modify
- Edge cases and error handling

**Step 11: Update Status**

Execute: `zest-dev update current designed`

---

## Checkpoint 2: Approve Implementation

**Step 12: Present Design & Ask for Approval**

Present a brief summary of the design (architecture overview, implementation steps, files affected).

Ask the user:

> Design is ready. Here's what will be implemented:
> [brief summary]
> Proceed with implementation?

Use AskUserQuestion with options:
- **Implement now** — proceed with implementation
- **Stop here** — exit and let the user review the design before continuing manually with `/implement`

---

## Stage 3: Implement

**Step 13: Read All Relevant Files**

Before writing any code, read all files identified in research and referenced in the design.

**Step 14: Implement Following Design**

Implement the feature:
- Follow the architecture from the Design section
- Match existing code conventions and patterns
- Write tests alongside implementation
- Update todos as you progress

**Implementation principles:**
- Simple and minimal — only what's needed for current requirements
- Follow conventions — match existing code style
- Security first — avoid introducing vulnerabilities
- Test as you go

**Step 15: Document Implementation**

Edit the spec file's Implementation section:
- Tasks checklist with completion status (`[x]` or `[ ]`)
- Files created or modified with descriptions
- Testing results
- Any deviations from the design with rationale

**Step 16: Update Status**

Execute: `zest-dev update current implemented`

---

## Stage 4: Final Review

**Step 17: Run Code Reviewer**

Launch a code-reviewer agent using the Task tool to review the changes made during implementation.

Instruct the agent to:
- Review the staged/unstaged changes for this feature
- Check for bugs, logic errors, and security issues
- Verify code follows project conventions

**Step 18: Address Critical Issues**

If the reviewer finds critical or important issues (confidence ≥ 80), fix them before marking complete.

**Step 19: Confirm Completion**

Mark all todo items complete and inform the user:
- Research, design, and implementation are complete
- Spec is documented and status updated to "implemented"
- Any review findings addressed

---

## Important Notes

- **Simple tasks only**: For complex features with many unknowns, use the individual stage commands (`/research`, `/design`, `/implement`) for more thorough handling.
- **Picks up from current status**: If a spec is already in progress, this command continues from where it left off.
