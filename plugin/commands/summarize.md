---
description: Summarize conversation into a new spec (captures vibe coding sessions)
argument-hint: [optional spec-slug]
allowed-tools: Read, Write, Edit, Bash(zest-spec:*), AskUserQuestion
---

Summarize the current conversation into a new spec document: $ARGUMENTS

This command is designed for capturing "vibe coding" sessions where you've been coding and realized the task is worth documenting.

**Step 1: Analyze Conversation Context**

Review the conversation history to extract:
- **Task/Goal**: What was the user trying to accomplish?
- **Design decisions**: Key architectural and implementation choices discussed
- **Challenges encountered**: Problems discovered and how they were resolved
- **Alternative approaches**: Options that were considered but not chosen, and why
- **File references**: Files that were created, modified, or are relevant (not full code snippets)
- **Implementation status**: Has code been written? Is it working? What phase is it at?

**Step 2: Infer Phase**

Based on the conversation, determine the spec phase:
- **"new"**: Only discussed the problem, no research or design yet
- **"researched"**: Explored options, evaluated alternatives, identified approach
- **"designed"**: Created detailed architecture/design plan
- **"implemented"**: Actually wrote code and tested it

**If phase is vague or unclear**, use AskUserQuestion to ask:
- "What phase should this spec be in?"
- Options: new, researched, designed, implemented
- Include brief description of what each phase means

**Step 3: Create Spec via CLI**

Infer a kebab-case slug from the task name
Example: "Plugin deployment script" → "plugin-deployment-script"

Execute: `zest-spec create <spec-slug>`

This will:
- Create the spec file in `specs/` directory
- Generate unique ID and frontmatter
- Initialize empty sections

**Step 4: Fill Spec Sections**

Read the created spec file from the `specs/` directory.

Fill sections based on the phase:

**For all phases - Fill Overview section:**
- What problem was being solved
- Why it matters
- High-level scope and goals
- Any constraints mentioned

**If phase is "researched" or later - Fill Research section:**
- Existing code or systems explored
- Technical options evaluated (2-3 alternatives)
- Recommended approach with rationale
- Key findings and decisions
- What was learned during exploration

**If phase is "designed" or later - Fill Design section:**
- Technical approach and architecture
- Key components and their responsibilities
- Data structures or API design
- Error handling strategy
- Critical design decisions with rationale

**If phase is "implemented" - Fill Plan section:**
- Implementation checklist with completed tasks marked `[x]`
- Files created or modified (list with descriptions)
- Testing approach and results
- What worked well, what was challenging

Add an **Implementation Summary** subsection under Plan:
- List files created/modified with line counts
- Key functions or components implemented
- Test results and verification
- Current status (working, needs refinement, etc.)

**Step 5: Update Spec Status**

Use `zest-spec update` for status transitions (do not edit frontmatter manually):
- If inferred phase is `new`: skip status update (new spec is already `new`)
- If inferred phase is `researched`: execute `zest-spec update <spec-id> researched`
- If inferred phase is `designed`: execute `zest-spec update <spec-id> designed`
- If inferred phase is `implemented`: execute `zest-spec update <spec-id> implemented`

**Step 6: Add Notes Section**

Add relevant notes:
- Design decisions and their rationale
- Challenges encountered and how they were solved
- Alternative approaches considered and why they weren't chosen
- Future enhancements or improvements
- Links to relevant files (use file:line format)

**Step 7: Confirm and Show Result**

Execute: `zest-spec show <spec-id>`

Inform the user:
- Spec has been created with ID and name
- Show the spec file location
- Summarize what sections were filled
- Confirm the phase status
- Tell them they can continue with the next phase command if needed

**Content Guidelines:**

- **Prioritize brevity**: Write only the main ideas, not detailed code
- **Easy to review**: Use bullets, tables, and clear structure
- **Context preservation**: Save enough detail to understand decisions later
- **File references**: Link to relevant files, don't paste full code
- **Rationale**: Always include "why" for key decisions
- **Challenges**: Document what was hard and how it was solved

**Example Scenario:**

User has been coding a deployment script:
1. Analyzed conversation → Phase: "implemented" (code was written and tested)
2. Created spec: `zest-spec create plugin-deployment-script`
3. Filled all sections from Overview through Plan
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
