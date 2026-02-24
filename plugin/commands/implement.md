---
description: Build feature following the design
allowed-tools: Read, Edit, Write, Bash, Task, Glob, Grep, TodoWrite
---

# Implement: Build the Feature

Implement the feature following the design and document what was built.

**Step 1: Verify Current Spec**
Execute: `zest-dev status`

Confirm there is a current spec set and status is "designed". If:
- No current spec: Guide user to set one
- Status is "new" or "researched": Suggest completing previous phases first
- Status is "implemented": Confirm if user wants to continue/update implementation

**Step 2: Read Current Spec**
Execute: `zest-dev show current` to get the spec file path.

**IMPORTANT**: Read all research and design content before coding.

Do not start implementation until you have comprehensive understanding of:
- Existing code patterns
- Architecture and abstractions
- Conventions and style
- Testing approaches

**Step 3: Create Task List**
Use TodoWrite to create a task list tracking:
- Read all relevant files
- Get user approval
- Implement features following design
- Document implementation in spec
- Update spec status

**Step 4: Implement Following Design**
Once approved, implement the feature:
- Follow the architecture designed in previous phase
- Adhere to codebase conventions strictly
- Write clean, well-documented code
- Follow existing patterns discovered in research
- Update todos as you progress
- **After each phase/task completes, immediately mark the corresponding Plan section item as `[x]`** in the spec file

**Implementation principles:**
- **Simple and elegant**: Prioritize readable, maintainable code
- **No over-engineering**: Only add what's needed for current requirements
- **Follow conventions**: Match existing code style and patterns
- **Security first**: Avoid introducing vulnerabilities
- **Test as you go**: Write tests alongside implementation

**Step 5: Verify Plan Checkboxes**
Before moving on, confirm all completed items in the spec's Plan section are marked `[x]`. Any item left as `[ ]` must either be completed or explicitly noted as skipped with a reason.

**Step 6: Document in Notes**
Edit the spec file to fill the `### Implementation` and `### Verification` subsections under Notes.

**Implementation** — what was actually built:
- Files created or modified (with one-line description each)
- Decisions made during coding that weren't in the design
- Deviations from original design with rationale

**Verification** — how it was validated:
- Tests written and their results
- Manual testing steps and outcomes
- Any known limitations or follow-up items

Keep both sections brief. Use bullet points. Skip a subsection entirely if there's nothing worth noting.

**Step 7: Update Spec Status**
Execute: `zest-dev update current implemented`

This updates the spec status using the CLI (do not edit frontmatter manually).

**Step 8: Confirm Completion**
Mark todo items complete and inform user:
- ✅ Implementation complete
- ✅ Spec status updated to "implemented"
- ✅ Implementation documented
