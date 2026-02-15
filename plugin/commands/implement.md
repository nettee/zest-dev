---
description: Build feature following the design
allowed-tools: Read, Edit, Write, Bash, Task, Glob, Grep, TodoWrite
---

# Implement: Build the Feature

Implement the feature following the design and document what was built.

**Step 1: Verify Current Spec**
Execute: `zest-spec status`

Confirm there is a current spec set and status is "designed". If:
- No current spec: Guide user to set one
- Status is "new" or "researched": Suggest completing previous phases first
- Status is "implemented": Confirm if user wants to continue/update implementation

**Step 2: Read Current Spec**
Execute: `zest-spec show <current-spec-id>` to get the spec file path.

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

**Implementation principles:**
- **Simple and elegant**: Prioritize readable, maintainable code
- **No over-engineering**: Only add what's needed for current requirements
- **Follow conventions**: Match existing code style and patterns
- **Security first**: Avoid introducing vulnerabilities
- **Test as you go**: Write tests alongside implementation

**Step 5: Document Implementation**
Edit the spec file to add/update the Implementation section with:

**Include:**
- **Tasks checklist**: Ordered tasks with completion status `[x]` or `[ ]`
- **Files modified**: List all created/modified files with descriptions
- **Testing results**: What tests were written and their status
- **Design deviations**: Any changes from original design with rationale

**Step 6: Update Spec Status**
Execute: `zest-spec update <current-spec-id> implemented`

This updates the spec status using the CLI (do not edit frontmatter manually).

**Step 7: Confirm Completion**
Mark todo items complete and inform user:
- ✅ Implementation complete
- ✅ Spec status updated to "implemented"
- ✅ Implementation documented
