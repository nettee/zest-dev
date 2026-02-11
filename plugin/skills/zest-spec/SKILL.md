---
name: Zest Spec
description: This skill should be used when the user asks to "create a spec", "write a spec", mentions "zest spec", "spec-driven development", workflow phases like "research phase", "design phase", "implement phase", or asks "how do I write a spec", "what's the spec process", "spec methodology", or needs guidance on specification planning and development workflows.
version: 0.1.0
---

# Zest Spec: Spec-Driven Development

## Overview

Zest Spec is a lightweight workflow that emphasizes planning before coding through structured specification documents. The methodology guides development through sequential phases ensuring clarity before implementation.

**Core principle:** Plan with clarity → Implement with confidence

## When to Use Specs

**Use specs for:**
- New features requiring research and design
- Significant changes affecting multiple components
- Unclear requirements or approach
- Team collaboration and design review

**Skip specs for:**
- Trivial changes (typos, simple bug fixes)
- Experimental prototypes
- Well-understood, obvious tasks

## Workflow Phases

Specs progress through sequential phases:

```
new → researched → designed → implemented → delivered
```

### Phase 1: New (Creation)

Capture the initial requirement with:
- Problem statement
- Why it matters
- High-level scope
- Critical constraints

Keep it brief—details come later.

### Phase 2: Research

Gather information for informed decisions:
- Investigate existing code/systems
- Evaluate technical options (2-3 alternatives)
- Document key findings
- Recommend approach with rationale

**Format:**
```markdown
## Research

### Existing System
- [Current state]

### Options Evaluated
1. **Option A** - [Description] (recommended)
2. **Option B** - [Description]

### Recommendation
[1-2 sentences on approach and why]
```

### Phase 3: Design

Create implementation plan with:
- Architecture overview (components, data flow)
- Implementation steps (ordered sequence)
- Pseudocode for complex logic
- Files to create/modify
- Edge case handling

**Format:**
```markdown
## Design

### Architecture
[Component A] → [Component B] → [Component C]

### Implementation Steps
1. **Step 1** - [Description]
2. **Step 2** - [Description]

### Pseudocode: [Key Algorithm]
Function name(params):
  Initialize state
  Process items
  Return result

### Files to Modify
- `path/to/file.ext` - [What changes]
```

### Phase 4: Implement

Create concrete implementation plan:
- Task checklist with checkboxes
- Specific files to change
- Testing approach
- Progress tracking

**Format:**
```markdown
## Implementation

### Tasks
- [ ] Task 1
- [ ] Task 2
- [ ] Write tests
- [ ] Deploy

### Files Modified
- `file1.ext` - [Change description]
- `file2.ext` - [Change description]
```

## Content Principles

### 1. Prioritize Brevity

Write main flow and key ideas, not full implementation. Use bullet points over paragraphs.

**Good:** Auth options: Passport.js (recommended), custom JWT, Auth0. Choosing Passport.js: battle-tested, minimal setup.

**Bad:** For authentication, there are several options available. First, Passport.js which is mature... [continues for paragraphs]

### 2. Easy to Review

Structure for quick understanding:
- Use clear headers
- Put key decisions up front
- Use tables for comparisons
- Make it scannable in 2-3 minutes

### 3. Pseudocode Over Code

Show logic without implementation details:

**Good:**
```
Load user preferences
For each preference:
  If enabled: Apply to session
Return session
```

**Bad:**
```javascript
async function loadUserPreferences(userId) {
  try {
    const prefs = await db.query('SELECT...');
    // [30 lines of implementation]
  } catch (error) { ... }
}
```

### 4. Use Flowcharts for Complex Logic

For multi-step processes with branches:
```
User Request → Check Cache → Found?
                               ↓ Yes → Return Cached
                               ↓ No → Query DB → Cache → Return
```

## Working with Specs

### CLI Commands

```bash
zest-spec create <spec-slug>     # Create new spec
zest-spec status                 # View all specs
zest-spec show <spec-id>         # View specific spec
zest-spec set-current <spec-id>  # Set current spec
zest-spec unset-current          # Unset current
```

**Important:** Never manually create spec files or edit frontmatter. Always use CLI.

### Current Spec Context

The "current spec" is the active specification. Plugin commands automatically operate on the current spec.

**Workflow:**
1. Create spec (auto-sets as current)
2. Work through phases with plugin commands
3. Switch specs via `zest-spec set-current <id>`

## Best Practices

### Do's

✅ Start with clear problem statement and success criteria
✅ Research before designing—understand options
✅ Use pseudocode for logic—focus on algorithm, not syntax
✅ Keep specs as living documents—update during implementation
✅ Review design before implementing—validate approach

### Don'ts

❌ Don't write production code in specs—use pseudocode
❌ Don't create exhaustive documentation—write what's needed
❌ Don't skip phases—each builds on the previous
❌ Don't let specs become stale—update as you learn
❌ Don't over-engineer—solve the immediate problem

## Spec Structure

```markdown
---
id: 001
name: Spec Name
slug: spec-slug
status: new
created: 2026-02-10
updated: 2026-02-10
---

## Overview
[Problem, scope, constraints]

## Research
[Findings, options, recommendations]

## Design
[Architecture, steps, pseudocode, files]

## Implementation
[Task checklist, files, testing, progress]
```

## Adapting the Workflow

The workflow is flexible:

**Simple features:**
- Minimal research (quick investigation)
- Brief design (just key steps)
- Fast implementation checklist

**Complex features:**
- Thorough research with options
- Detailed design with architecture
- Comprehensive implementation plan

**Goal:** Provide enough clarity to implement confidently, not to document exhaustively.

## Integration with Development

Specs complement other practices:

**Specs + Agile:** Spec per story, research in planning, design in refinement
**Specs + TDD:** Design defines test cases, pseudocode becomes test scenarios
**Specs + Code Review:** Reference spec in PR, compare to design
**Specs + Docs:** Specs inform user docs, capture architecture decisions

## Troubleshooting

**Spec too long?** → Focus on main flow, cut obvious details, use bullets
**Don't know what to research?** → Ask: What don't I understand? What are my options?
**Design feels like code?** → Use pseudocode, show structure not implementation
**Spec became outdated?** → Update implementation section—specs are living docs
**Unsure which phase?** → Check status, move forward—you can return

## Summary

Zest Spec workflow:

1. **Create** - Capture the problem
2. **Research** - Understand options
3. **Design** - Plan the approach
4. **Implement** - Build with clarity
5. **Deliver** - Ship with confidence

Write specs that are **brief**, **easy to review**, and use **pseudocode**. Adapt the workflow to your needs. Keep specs as living documents that evolve with your code.

**Remember:** The goal is clarity and alignment, not documentation for its own sake. Write enough to implement confidently, then build.
