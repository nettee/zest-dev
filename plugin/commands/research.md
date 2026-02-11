---
description: Fill research section and advance spec to researched phase
allowed-tools: Read, Edit, Bash(zest-spec:*)
---

Conduct research phase for the current spec and update the Research section.

**Step 1: Verify Current Spec**
Execute: `zest-spec status`

Confirm there is a current spec set. If no current spec:
- Inform user no spec is currently active
- Guide them to use `/new` to create a spec or `zest-spec set-current <id>` to select one

**Step 2: Read Current Spec**
Execute: `zest-spec show <current-spec-id>` to get the spec file path.

Read the spec file to understand:
- The overview and problem statement
- Current status (should be "new")
- Any existing content

**Step 3: Conduct Research**
Guide the user through research by investigating:
- **Existing systems**: Code, patterns, or infrastructure to understand
- **Technical options**: Libraries, frameworks, approaches to evaluate
- **Key decisions**: Choices that need to be made with trade-offs
- **Constraints**: Technical limitations or requirements
- **Dependencies**: What needs to exist or be modified

Ask clarifying questions if needed to understand the problem space.

**Step 4: Fill Research Section**
Edit the spec file to add/update the Research section with:

**Include:**
- Existing code or systems relevant to the task
- Technical options evaluated (2-3 alternatives max)
- Key findings that inform design decisions
- Recommended approach with brief rationale
- Critical questions answered

**Format:**
- Use bullet points and tables for comparisons
- Keep descriptions concise (1-2 sentences per item)
- Focus on actionable findings, not exhaustive documentation
- Highlight the recommended approach

**Content principles:**
- Prioritize brevity: Main findings only, not exhaustive research
- Easy to review: Use tables for comparisons, bullets for lists
- Focus on "why": Document rationale for recommendations

**Step 5: Update Spec Status**
Edit the spec frontmatter to update:
- `status: researched`
- `updated: <current-timestamp>`

**Step 6: Confirm Completion**
Inform the user:
- Research section has been completed
- Spec status updated to "researched"
- Guide them to use `/design` command to continue to design phase

**Example Research Section Structure:**
```markdown
## Research

### Existing System
- [Brief description of current state]

### Options Evaluated
1. **Option A** - [Brief description] (recommended)
2. **Option B** - [Brief description]
3. **Option C** - [Brief description]

### Recommendation
[1-2 sentences on recommended approach and why]

### Key Decisions
- [Decision 1]: [Rationale]
- [Decision 2]: [Rationale]
```

**Important:**
- Keep research focused and scannable
- Don't include implementation code
- Document "why" for key recommendations
- Use comparison tables when evaluating alternatives
