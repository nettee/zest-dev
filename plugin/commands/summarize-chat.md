---
description: Capture chat conversation into a spec (for post-hoc documentation)
argument-hint: [optional spec-slug]
allowed-tools: Read, Write, Edit, Bash(zest-dev:*), AskUserQuestion
---

# Summarize Conversation into Spec

Capture the current conversation and development work into a structured feature spec.

**Spec slug (optional):** $ARGUMENTS

This command is designed for capturing "vibe coding" sessions where you've been coding and realized the work is worth documenting.

**Step 1: Analyze Conversation Context**

Review the conversation history to extract:
- **Task/Goal**: What was the user trying to accomplish?
- **Design decisions**: Key architectural and implementation choices discussed
- **Challenges encountered**: Problems discovered and how they were resolved
- **Alternative approaches**: Options that were considered but not chosen, and why
- **File references**: Files that were created, modified, or are relevant (not full code snippets)
- **Implementation status**: Has code been written? Is it working? What phase is it at?

**Step 2: Infer Status**

Based on the conversation, determine the spec status:
- **"new"**: Only discussed the problem and goals, no exploration yet
- **"researched"**: Explored codebase, evaluated options, identified approach
- **"designed"**: Clarified requirements, designed architecture with trade-offs
- **"implemented"**: Actually wrote code, tested it, and reviewed quality

**If status is vague or unclear**, use AskUserQuestion to ask:
- "What status should this spec be in?"
- Options: new, researched, designed, implemented
- Provide brief description:
  - **new**: Problem identified, no exploration
  - **researched**: Codebase explored, options evaluated
  - **designed**: Architecture designed, approach chosen
  - **implemented**: Code written, tested, reviewed

**Step 3: Create Spec via CLI**

Infer a kebab-case slug from the task name
Example: "Plugin deployment script" → "plugin-deployment-script"

Execute: `zest-dev create <spec-slug>`

This will:
- Create the spec file in `specs/` directory
- Generate unique ID and frontmatter
- Initialize empty sections

**Step 4: Fill Spec Sections**

Read the created spec file from the `specs/` directory.

Fill sections based on the status:

**For all statuses - Fill Overview section:**
- **Problem Statement**: What problem was being solved and why it matters
- **Goals**: What the feature should accomplish
- **Scope**: What's included and what's excluded
- **Constraints**: Technical limitations or requirements
- **Success Criteria**: How to measure success

**If status is "researched" or later - Fill Research section:**
- **Existing Systems**: Code, patterns, or infrastructure explored
- **Options Evaluated**: 2-3 alternatives with trade-offs (use table)
- **Recommended Approach**: Chosen direction with rationale
- **Key Findings**: Insights discovered during exploration
- **File References**: Important files found (use `file:line` format)

**If status is "designed" or later - Fill Design section:**
- **Chosen Approach**: Brief description of architecture and why
- **Architecture**: Visual diagram of components and data flow
- **Implementation Steps**: Numbered sequence of what to build
- **Pseudocode**: Logic for non-trivial algorithms
- **Files to Modify**: List of files with descriptions
- **Edge Cases**: How to handle errors and unusual scenarios
- **Design Decisions**: Key decisions with rationale

**If status is "implemented" - Fill Implementation section:**
- **Tasks**: Checklist with completed tasks marked `[x]`
- **Files Modified**: All created/modified files with descriptions and line counts
- **Testing**: What tests were written and their status
- **Design Changes**: Any deviations from original design with rationale
- **Summary**:
  - What was built
  - Key decisions made
  - Files modified (with totals)
  - Testing status
  - Current status and next steps

**Step 5: Update Spec Status**

Use `zest-dev update` for status transitions (do not edit frontmatter manually):
- If inferred status is `new`: skip status update (new spec is already `new`)
- If inferred status is `researched`: execute `zest-dev update current researched`
- If inferred status is `designed`: execute `zest-dev update current designed`
- If inferred status is `implemented`: execute `zest-dev update current implemented`

**Step 6: Add Notes Section**

Add relevant notes:
- Design decisions and their rationale
- Challenges encountered and how they were solved
- Alternative approaches considered and why they weren't chosen
- Future enhancements or improvements
- Links to relevant files (use file:line format)

**Step 7: Confirm and Show Result**

Execute: `zest-dev show current`

Inform the user:
- Spec has been created with ID and name
- Show the spec file location
- Summarize what sections were filled
- Confirm the status
- Tell them they can continue with the next command if needed

**Content Guidelines:**

- **Prioritize brevity**: Write only the main ideas, not detailed code
- **Easy to review**: Use bullets, tables, and clear structure
- **Context preservation**: Save enough detail to understand decisions later
- **File references**: Link to relevant files, don't paste full code
- **Rationale**: Always include "why" for key decisions
- **Challenges**: Document what was hard and how it was solved

**Example Scenario:**

User has been coding a deployment script:
1. Analyzed conversation → Status: "implemented" (code was written and tested)
2. Created spec: `zest-dev create plugin-deployment-script`
3. Filled all sections from Overview through Implementation
4. Marked implementation tasks as `[x]` completed
5. Added Implementation Summary with file changes and test results
6. Set status to "implemented"
7. Added notes about design decisions and future enhancements

**Important:**
- Don't guess at details not in the conversation
- If key information is missing, note it in the spec (e.g., "TODO: Document performance requirements")
- Keep the tone factual and concise
- This captures history, not future work (unless mentioned in conversation)
- The spec should serve as a record of what was built and why
