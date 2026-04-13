---
description: Clarify requirements and design architecture
---

# Design: Clarify Requirements & Design Architecture

Resolve ambiguities and design implementation approaches with trade-offs before coding.

**Language rule:** Always respond in the user's language throughout the flow unless the user asks to switch languages.

## Clarifying Questions

**CRITICAL**: This is one of the most important steps. DO NOT SKIP.

**Step 1: Verify Active Change Spec**
Execute: `zest-dev status`

Confirm there is an active change spec set and status is "researched". If:
- No active change spec: Guide user to set one
- Status is "new": Suggest completing `/research` first
- Status is "designed" or later: Confirm if user wants to update existing design

**Step 2: Read Active Change Spec**
Execute: `zest-dev show active` to get the spec file path.

Read the spec file to understand:
- Overview and problem statement
- Research findings and recommendations
- Any existing design content

**Step 3: Create Task List**
Use TodoWrite to create a task list tracking:
- Identify and ask clarifying questions
- Launch architecture design agents
- Synthesize recommended architecture
- Decide whether user choice is actually needed
- Document final design
- Update spec status

**Step 4: Identify Underspecified Aspects**
Review the codebase findings and original feature request to identify:
- **Edge cases**: How to handle errors, empty states, invalid input
- **Integration points**: How components interact, API contracts
- **Scope boundaries**: What's in scope vs out of scope
- **Design preferences**: UI/UX choices, naming conventions, patterns to follow
- **Backward compatibility**: Breaking changes, migration needs
- **Performance needs**: Scalability requirements, optimization priorities
- **Testing strategy**: What needs tests, testing approach

**Step 5: Ask Clarifying Questions**
**Present all questions to the user in a clear, organized list**. Use the question tool for multiple-choice checkpoints, or ask directly for open-ended input.

**Wait for answers before proceeding to architecture design.**

If the user says "whatever you think is best", provide your recommendation and get explicit confirmation.

## Architecture Design

**Step 6: Develop the Architecture Recommendation**
Form the architecture recommendation yourself, using repository evidence first.

When extra design validation is useful, delegate selectively:
- Use explorer subagents to verify existing patterns or affected modules
- Use architect subagents to generate candidate directions or pressure-test the design
- Use reviewer subagents for high-value critique, trade-off analysis, or synthesis feedback

Treat delegated findings as **inputs**, not as user-facing option generators.

The design pass should produce:
- A recommended architecture
- Architecture overview with components
- Implementation approach
- Key trade-offs
- Files to create or modify
- Which differences are truly architectural vs mere tuning
- Any ideas that can be safely combined

**Step 7: Synthesize Findings & Form Opinion**
Review all subagent outputs and synthesize them into a single recommended architecture by default.

The main agent should:
- Extract shared recommendations and constraints
- Merge compatible strengths from different agents
- Discard clearly inferior, redundant, or theatrical extreme proposals
- Decide whether one delegated recommendation is already clearly correct as-is
- Form a strong opinion on the best fit for this specific task and repository

Consider:
- Is this a small fix or large feature?
- Urgency vs quality trade-offs
- Team context and existing patterns
- Complexity and maintenance burden
- Backward compatibility and migration implications
- Whether differences are strategic or merely implementation tuning

**Default rule:** the main agent should make the architectural decision and present one synthesized recommendation.

**Step 8: Decide Whether User Choice Is Actually Needed**
Only ask the user to choose when there are **2-3 genuinely viable and materially different architectural directions**.

Ask the user to choose only if one or more of these is true:
- The approaches imply different product behavior or UX semantics
- The approaches imply different compatibility, migration, or rollout strategies
- The approaches create meaningfully different module boundaries, contracts, or system shape
- The approaches have materially different long-term cost profiles and there is no clear winner
- Two or more directions are genuinely viable and depend on user/team preference rather than technical correctness

Do **not** ask the user to choose when:
- One direction is clearly best for the issue and repository
- One delegated recommendation is clearly correct and the others are weaker variations
- Differences are only about abstraction level, naming, file split, sequencing, or other implementation tuning
- The alternatives are artificial extremes (for example: too minimal, too overengineered, and one obvious middle ground)

If user choice is **not** needed:
- Present one recommended architecture
- Briefly explain what was synthesized from the delegated findings
- Proceed directly to documenting the design

If user choice **is** needed:
- Present only the 2-3 genuinely viable directions
- Summarize the real trade-offs briefly
- State your recommendation with reasoning
- Ask the user which direction they prefer

Wait for user decision **only** when this decision gate determines that user input is actually needed.

**Step 9: Document Design**
Edit the spec file to add/update the Design section based on the synthesized recommendation or the user-chosen direction when a real decision fork exists.

**Include:**
- **Architecture overview**: Components, data flow, system structure
- **Why this design**: Why this is the recommended direction, including what was synthesized or intentionally rejected
- **Implementation steps**: Ordered sequence of what to build
- **Pseudocode**: Logic for non-trivial algorithms or processes
- **File structure**: Files to create or modify
- **Interfaces/APIs**: Contracts between components
- **Edge cases**: How to handle errors and unusual scenarios

If alternatives were considered but not surfaced to the user, summarize them briefly only when helpful for future reviewers.

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

**Step 9.5: Assess Implementation Complexity & Fill Plan**
Assess whether implementation needs to be split into multiple phases:

- **Single phase** (most features): Leave the `### Plan` subsection empty.
- **Multi-phase** (complex features): Fill `### Plan` with a coarse phase breakdown.

When filling Plan, keep it high-level — name what each phase covers, not individual tasks:

```
- [ ] Phase 1: [brief description of scope]
- [ ] Phase 2: [brief description of scope]
```

2-3 phases maximum. Do not nest sub-tasks under phases. These boxes will be checked off during the Implement stage.

**Step 10: Update Spec Status**
Execute: `zest-dev update active designed`

This updates the spec status using the CLI (do not edit frontmatter manually).

**Step 11: Confirm Completion**
Mark todo items complete and inform user:
- Design section has been completed
- Spec status updated to "designed"
- Clarifying questions resolved
- Architecture approach documented
- Guide them to use `/implement` command to build the feature
