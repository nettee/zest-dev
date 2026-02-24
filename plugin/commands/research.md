---
description: Research feature requirements and explore codebase patterns
allowed-tools: Read, Edit, Bash(zest-dev:*), Task, Glob, Grep, TodoWrite
---

# Research: Understand Requirements & Explore Codebase

Understand the feature requirements deeply and explore existing codebase patterns before design.

---

## Discovery & Verification

**Step 1: Verify Current Spec**
Execute: `zest-dev status`

Confirm there is a current spec set. If no current spec:
- Inform user no spec is currently active
- Guide them to use `/new` to create a spec or `zest-dev set-current <spec-id>` to select one

**Step 2: Read Current Spec**
Execute: `zest-dev show current` to get the spec file path.

Read the spec file to understand:
- The overview and problem statement
- Current status (should be "new")
- Any existing content

**Step 3: Clarify Requirements**
If the feature description is unclear or vague, ask user for:
- What problem are they solving?
- What should the feature do?
- Any constraints or requirements?
- What's in scope vs out of scope?

Summarize your understanding and confirm with user before proceeding.

**Step 4: Create Task List**
Use TodoWrite to create a task list tracking:
- Clarify requirements
- Launch codebase exploration
- Read identified files
- Document research findings
- Update spec status

---

## Codebase Exploration

**Step 5: Launch Explorer Agents
Launch 2-3 code-explorer agents **in parallel** using the Task tool. Each agent should:
- Trace through the code comprehensively and focus on getting a comprehensive understanding of abstractions, architecture and flow of control
- Target a different aspect of the codebase
- Include a list of 5-10 key files to read

**Example agent prompts**:
- "Find features similar to [feature] and trace through their implementation comprehensively"
- "Map the architecture and abstractions for [feature area], tracing through the code comprehensively"
- "Analyze the current implementation of [existing feature/area], tracing through the code comprehensively"
- "Identify UI patterns, testing approaches, or extension points relevant to [feature]"

**Step 6: Read Identified Files**
**IMPORTANT**: Once the agents return, read all files identified by agents to build deep understanding. Do NOT proceed to design without reading these files.

**Step 7: Document Research Findings**
Edit the spec file to add/update the Research section.

**Research documents FACTS, not decisions.** Leave evaluation, comparison, and selection to the design phase.

**Include:**
- **Existing System**: Current code, patterns, and infrastructure relevant to the task
- **Available Approaches**: Technical options discovered (list them, do NOT rank or recommend)
- **Constraints & Dependencies**: Hard requirements, compatibility needs, existing conventions
- **Key References**: Important files discovered (use `file:line` format)

**Do NOT include:**
- Pros/cons comparisons or trade-off tables (that's design)
- Recommendations or verdicts (that's design)
- "Why" one approach is better than another (that's design)
- Refactoring suggestions or improvement ideas

**Format:**
- Use bullet points for lists
- Keep descriptions concise (1-2 sentences per item)
- Focus on what exists and what's possible, not what should be chosen
- State facts objectively

**Content principles:**
- Prioritize brevity: Main findings only, not exhaustive research
- Facts only: Document what IS, not what SHOULD BE
- Enumerate choices: List available approaches without evaluating them
- Reference code: Point to concrete files and patterns

**Example Structure:**
```markdown
## Research

### Existing System
- [Brief description of current state and relevant code]
- Key files: `src/file1.js:45`, `src/file2.js:120`

### Available Approaches
- **Option A**: [What it is and how it works]
- **Option B**: [What it is and how it works]
- **Option C**: [What it is and how it works]

### Constraints
- [Constraint 1]: [What it means for this feature]
- [Constraint 2]: [Hard requirement or dependency]

### Key References
- `src/file1.js:45` - [What this file does]
- `src/file2.js:120` - [Relevant pattern found here]
```

**Step 8: Update Spec Status**
Execute: `zest-dev update current researched`

This updates the spec status using the CLI (do not edit frontmatter manually).

**Step 9: Present Summary & Next Steps**
Present summary including:
- What was explored
- Key patterns and systems discovered
- Available approaches identified (without recommending one)
- Important files and references

Mark todo items complete and inform user:
- Research phase is complete
- Spec status updated to "researched"
- Guide them to use `/design` command to continue to design phase

---

## Important Notes

- **Read files identified by agents**: This is CRITICAL. Do not skip reading files.
- **Ask clarifying questions early**: Better to ask than assume.
- **Keep research focused**: Document findings, not exhaustive code dumps.
- **Facts, not opinions**: Research discovers what exists and what's possible. Design evaluates and decides.
- **Include file references**: Help future readers find relevant code.
