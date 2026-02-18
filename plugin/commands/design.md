---
description: Clarify requirements and design architecture
allowed-tools: Read, Edit, Bash(zest-dev:*), Task, AskUserQuestion, TodoWrite
---

# Design: Clarify Requirements & Design Architecture

Resolve ambiguities and design implementation approaches with trade-offs before coding.

## Clarifying Questions

**CRITICAL**: This is one of the most important steps. DO NOT SKIP.

**Step 1: Verify Current Spec**
Execute: `zest-dev status`

Confirm there is a current spec set and status is "researched". If:
- No current spec: Guide user to set one
- Status is "new": Suggest completing `/research` first
- Status is "designed" or later: Confirm if user wants to update existing design

**Step 2: Read Current Spec**
Execute: `zest-dev show <current-spec-id>` to get the spec file path.

Read the spec file to understand:
- Overview and problem statement
- Research findings and recommendations
- Any existing design content

**Step 3: Create Task List**
Use TodoWrite to create a task list tracking:
- Identify and ask clarifying questions
- Launch architecture design agents
- Present options to user
- Document chosen design
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
**Present all questions to the user in a clear, organized list** using AskUserQuestion when multiple choice, or direct questions for open-ended queries.

**Wait for answers before proceeding to architecture design.**

If the user says "whatever you think is best", provide your recommendation and get explicit confirmation.

## Architecture Design

**Step 6: Launch Architect Agents**
Launch 2-3 code-architect agents **in parallel** using the Task tool with different focuses:
- **Minimal changes**: Smallest change, maximum reuse of existing code
- **Clean architecture**: Maintainability, elegant abstractions, long-term quality
- **Pragmatic balance**: Speed + quality, practical trade-offs

Each agent should provide:
- Architecture overview with components
- Implementation approach
- Trade-offs (pros/cons)
- Files to create or modify

**Step 7: Review Approaches & Form Opinion**
Review all approaches and form your opinion on which fits best for this specific task.

Consider:
- Is this a small fix or large feature?
- Urgency vs quality trade-offs
- Team context and existing patterns
- Complexity and maintenance burden

**Step 8: Present Options to User**
Present to user:
- **Brief summary of each approach** (2-3 sentences)
- **Trade-offs comparison** (use table format)
- **Your recommendation with reasoning**
- **Concrete implementation differences**

**Ask user which approach they prefer.**

Wait for user decision before documenting the design.

**Step 9: Document Design**
Edit the spec file to add/update the Design section based on chosen approach.

**Include:**
- **Architecture overview**: Components, data flow, system structure
- **Implementation steps**: Ordered sequence of what to build
- **Pseudocode**: Logic for non-trivial algorithms or processes
- **File structure**: Files to create or modify
- **Interfaces/APIs**: Contracts between components
- **Edge cases**: How to handle errors and unusual scenarios

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

**Step 10: Update Spec Status**
Execute: `zest-dev update <current-spec-id> designed`

This updates the spec status using the CLI (do not edit frontmatter manually).

**Step 11: Confirm Completion**
Mark todo items complete and inform user:
- Design section has been completed
- Spec status updated to "designed"
- Clarifying questions resolved
- Architecture approach documented
- Guide them to use `/implement` command to build the feature
