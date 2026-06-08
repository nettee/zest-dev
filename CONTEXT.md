# Zest Dev

Zest Dev is a lightweight, human-interactive workflow for AI-assisted coding. This glossary defines the project-specific language used to discuss its workflow resources and spec lifecycle.

## Language

**Spec**:
A change record for one unit of work, stored as a Spec directory with a concise main Spec file and optional supporting files.
_Avoid_: ticket, task document

**Main Spec File**:
The review-oriented `spec.md` file inside a Spec. It keeps the workflow section order visible, with concise content for high-frequency review sections and links for lower-review-frequency supporting detail.
_Avoid_: full spec, source of truth file

**Spec Supporting File**:
A Markdown file inside a Spec directory that carries lower-review-frequency workflow detail, such as design research or step-by-step implementation records.
_Avoid_: appendix, attachment

**Steps File**:
The `steps.md` Spec Supporting File that records implementation and verification by Plan Step. It does not split implementation and verification into separate global sections.
_Avoid_: implementation log, verification log

**Spec Template**:
The built-in Markdown skeletons used by the CLI to create a new Spec layout. They define initial sections with brief placeholders, not examples, subsection templates, or detailed writing guidance.
_Avoid_: workflow instructions, writing rules

**Skill**:
The agent-facing workflow source for Zest Dev. The main Skill defines the overall flow and routes into phase-specific files; it does not carry concrete section templates or phase-specific writing details.
_Avoid_: command, template

**Phase File**:
A Skill-owned file for one workflow phase, such as New, Research, Design, or Implement. It carries the concrete instructions for writing that phase's Spec content.
_Avoid_: command, CLI template

**Command**:
A user-facing entrypoint that gives a simple prompt and routes intent into the Zest Dev Skill or a related Skill-owned workflow. It does not carry detailed process, rules, or templates.
_Avoid_: workflow source, template, writing guide

**Summarize Command**:
A post-hoc command that captures an existing chat or pull request into a Spec. It is not part of the core Zest Dev workflow phases.
_Avoid_: workflow phase, phase file

**Plan Phase**:
A core workflow phase that turns an approved Design into the Spec's Plan section. It does not produce Design content.
_Avoid_: design step, planning note

**Planned Status**:
A Spec lifecycle milestone meaning the Spec's Design, Plan, and Progress sections are ready for implementation.
_Avoid_: designed, ready

**Plan Step**:
One issue-scale implementation slice inside a Spec's Plan section. A Plan Step has a Type that describes whether the next implementer can proceed independently or needs human input.
_Avoid_: task, ticket

**Progress Checklist**:
A thin completion checklist in the Main Spec File, with one checkbox per Plan Step. It tracks implementation completion; it is not the implementation plan itself.
_Avoid_: plan, task list, notes

**Ralph Task**:
A markdown checkbox item consumed by Ralph Tasks Mode from `.ralph/ralph-tasks.md`. It is generated from a Progress Checklist item when Zest Dev hands planned work to Ralph.
_Avoid_: Plan Step, Progress item

**AFK Plan Step**:
A Plan Step that an agent can implement independently from the written Spec and repository context.
_Avoid_: automatic step, background task

**HITL Plan Step**:
A Plan Step that needs user review, product judgment, or approval before continuing. The Plan Phase completion response should tell the user what needs to be discussed in conversation.
_Avoid_: manual step, blocked step

**CLI**:
The `zest-dev` command-line tool that manages Spec lifecycle operations such as creating, showing, activating, and updating Specs.
_Avoid_: workflow engine, writing guide

## Example Dialogue

Developer: "The Spec Template should only create the empty sections."

Maintainer: "Right. The main Skill routes the workflow, the Phase File explains how to fill the relevant sections, the Command only routes the request, and the CLI creates the Spec layout from the built-in Spec Template."

Developer: "Should the Design Phase also write the implementation checklist?"

Maintainer: "No. The Design Phase records decisions and trade-offs; the Plan Phase turns that Design into a checklist."

Developer: "When is a Spec ready for implementation?"

Maintainer: "When it reaches Planned Status: the Design is decided, and the Plan plus Progress Checklist are ready to execute."

Developer: "Can an agent start Step 2 without me?"

Maintainer: "Only if Step 2 is an AFK Plan Step. If it is a HITL Plan Step, the Plan Phase completion response should tell you what we need to discuss first."

Developer: "Can we send the Progress Checklist to Ralph?"

Maintainer: "Yes. The Progress Checklist records which Plan Steps are complete; `zest-dev ralph` can convert its unchecked items into Ralph Tasks for Ralph Tasks Mode."
