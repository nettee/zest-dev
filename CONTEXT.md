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

**Issue Spec Representation**:
A forge-neutral representation of a Spec stored in an issue body plus issue comments, with protocol metadata sufficient to reconstruct the Spec without relying on an LLM.
_Avoid_: GitHub dump, issue attachment format

**Design Section**:
The conceptual Design area of a Spec. It spans the Main Spec File's Design section for high-frequency review content and `design.md` for lower-frequency Design Detail.
_Avoid_: design file, design-only section

**Design Summary**:
A concise, high-frequency review summary inside the Main Spec File's Design section. It captures the chosen approach without replacing Design Detail.
_Avoid_: full design, design detail

**E2E Acceptance Gate (EAG)**:
A small, preferably single, automated end-to-end acceptance gate in the Main Spec File's Design section. It states both the user- or system-visible behavior to accept and the executable verification path; when no automated end-to-end gate exists, the Spec should say there is no EAG.
_Avoid_: test checklist, unit test plan, acceptance case list, manual acceptance step

**E2E Test Suite**:
The repository's executable end-to-end test harness for verifying real `zest-dev` CLI behavior across local and packaged-install paths. It is broader than a Spec's single E2E Acceptance Gate.
_Avoid_: acceptance gate, unit tests, product runtime

**Design Detail**:
The `## Design Detail` section in `design.md` that carries lower-review-frequency design reasoning, trade-offs, architecture notes, and verification strategy.
_Avoid_: design summary, main design

**Implementation File**:
The `implementation.md` Spec Supporting File that records material deviations between the Spec and implementation reality, the durable attention points future work must preserve, representative verification, and a brief Spec retrospective. It is organized by information value rather than by mirroring every Plan Step. Legacy Specs may use `steps.md` as the same single source of implementation notes.
_Avoid_: step log, change log, verification log

**Spec Template**:
The built-in Markdown skeletons used by the CLI to create a new Spec layout. They define initial sections and required subsections with brief placeholders, not examples or detailed writing guidance.
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

**EAG Validation**:
The Plan Step that comes after the functional implementation steps and before Documentation Sync. It validates the completed change against the Design section's EAG, or explicitly confirms that the Design says there is no EAG and uses the best available Spec-defined validation.
_Avoid_: general test plan, documentation step

**Documentation Sync**:
The final Plan Step, after EAG Validation, that checks whether the current implementation changed documented behavior, usage, commands, setup, or workflows, and updates relevant project documentation when needed. It is part of the current Spec's implementation work, not a Deferred Follow-Up.
_Avoid_: documentation follow-up

**Progress Checklist**:
A thin completion checklist in the Main Spec File, with one checkbox per Plan Step. It tracks implementation completion; it is not the implementation plan itself.
_Avoid_: plan, task list, notes

**Deferred Follow-Ups (DFU)**:
A final Main Spec File section for follow-up items explicitly deferred out of the current Spec during Design because they should be done only after the current Spec is complete. Add DFU only when the user explicitly wants to handle that work later, or when a clear functional gap is discovered and confirmed with the user first. DFU is fixed as part of the Design Phase and is not part of the Plan or Progress Checklist.
_Avoid_: backlog, future tasks, documentation follow-up

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

Developer: "When should the EAG be chosen?"

Maintainer: "During the Design Phase. It is part of the Design Section, and later Plan or Implement work should use it as the end-to-end validation gate."

Developer: "Where does that validation show up in the Plan?"

Maintainer: "As its own EAG Validation step after the functional changes and before Documentation Sync."

Developer: "Where should the short version of the design go?"

Maintainer: "The Design Section spans both files: put Design Summary in the Main Spec File for review, and keep Design Detail in `design.md` for the reasoning and supporting detail."

Developer: "Should the acceptance gate list every test case?"

Maintainer: "No. The EAG should be one small automated end-to-end gate whenever possible: the visible behavior to accept plus the command or path that verifies it. If no automated end-to-end gate exists, say there is no EAG."

Developer: "When is a Spec ready for implementation?"

Maintainer: "When it reaches Planned Status: the Design is decided, and the Plan plus Progress Checklist are ready to execute."

Developer: "Can an agent start Step 2 without me?"

Maintainer: "Only if Step 2 is an AFK Plan Step. If it is a HITL Plan Step, the Plan Phase completion response should tell you what we need to discuss first."

Developer: "Can we send the Progress Checklist to Ralph?"

Maintainer: "Yes. The Progress Checklist records which Plan Steps are complete; `zest-dev ralph` can convert its unchecked items into Ralph Tasks for Ralph Tasks Mode."
