---
description: Fill design section and advance spec to designed phase
allowed-tools: Read, Edit, Bash(zest-spec:*)
---

Create the design plan for the current spec and update the Design section.

**Step 1: Verify Current Spec**
Execute: `zest-spec status`

Confirm there is a current spec set and status is "researched". If:
- No current spec: Guide user to set one
- Status is "new": Suggest completing `/research` first
- Status is "designed" or later: Confirm if user wants to update existing design

**Step 2: Read Current Spec**
Execute: `zest-spec show <current-spec-id>` to get the spec file path.

Read the spec file to understand:
- Overview and problem statement
- Research findings and recommendations
- Any existing design content

**Step 3: Create Design Plan**
Based on the research findings, create a clear implementation plan:

**Design should include:**
- **Architecture overview**: Components, data flow, system structure
- **Implementation steps**: Ordered sequence of what to build
- **Pseudocode**: Logic for non-trivial algorithms or processes
- **File structure**: Files to create or modify
- **Interfaces/APIs**: Contracts between components
- **Edge cases**: How to handle errors and unusual scenarios

Guide the user through design by:
- Proposing architecture based on research
- Breaking down implementation into logical steps
- Creating pseudocode for complex logic
- Identifying all files that need changes
- Discussing edge cases and error handling

**Step 4: Fill Design Section**
Edit the spec file to add/update the Design section.

**Format guidelines:**
- Use visual diagrams (ASCII art, flowcharts) for architecture
- Number implementation steps in logical order
- Write pseudocode, NOT actual code
- Use bullet points for file lists
- Keep descriptions brief (1-2 lines per item)

**Content principles:**
- Prioritize brevity: Main flow and key ideas, not every detail
- Easy to review: Structure, not implementation specifics
- Use pseudocode: Show logic, not language syntax
- Flowcharts: For complex processes with branches

**Step 5: Update Spec Status**
Execute: `zest-spec update <current-spec-id> designed`

This updates the spec status using the CLI (do not edit frontmatter manually).

**Step 6: Confirm Completion**
Inform the user:
- Design section has been completed
- Spec status updated to "designed"
- Guide them to use `/implement` command to create implementation plan

**Example Design Section Structure:**
```markdown
## Design

### Architecture
```
[Component A] → [Component B] → [Component C]
     ↓              ↓              ↓
[Database]     [Cache]        [API]
```

### Implementation Steps
1. **[Step 1 name]** - [Brief description]
2. **[Step 2 name]** - [Brief description]
3. **[Step 3 name]** - [Brief description]

### Pseudocode: [Key Algorithm]
```
Function name(params):
  Initialize state
  For each item:
    If condition:
      Process item
    Else:
      Skip item
  Return result
```

### Files to Modify
- `path/to/file1.ext` - [What changes]
- `path/to/file2.ext` - [What changes]

### Edge Cases
- [Case 1]: [How to handle]
- [Case 2]: [How to handle]
```

**Important:**
- Use pseudocode, not production code
- Show structure and flow, not implementation details
- Keep it scannable with clear headers and bullets
- Focus on main path, note edge cases separately
