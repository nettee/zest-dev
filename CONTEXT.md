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
A Markdown file inside a Spec directory that carries lower-review-frequency workflow detail, such as design research or implementation records.
_Avoid_: appendix, attachment

**Issue Spec Representation**:
A forge-neutral representation of a Spec stored in an issue body plus issue comments, with protocol metadata sufficient to reconstruct the Spec without relying on an LLM.
_Avoid_: GitHub dump, issue attachment format

**Design Section**:
The high-frequency review area in the Main Spec File that summarizes the chosen design and its E2E Acceptance Gate. Its supporting evidence and reasoning live in the Design Record.
_Avoid_: Design Record, design file

**Design Summary**:
A concise, high-frequency review summary inside the Main Spec File's Design section. It captures the chosen approach without replacing the Design Record.
_Avoid_: Design Record, Design Decisions

**E2E Acceptance Gate (EAG)**:
A small, preferably single, automated end-to-end acceptance gate in the Main Spec File's Design section. It states both the user- or system-visible behavior to accept and the executable verification path; when no automated end-to-end gate exists, the Spec should say there is no EAG.
_Avoid_: test checklist, unit test plan, acceptance case list, manual acceptance step

**E2E Test Suite**:
The repository's executable end-to-end test harness for verifying real `zest-dev` CLI behavior across local and packaged-install paths. It is broader than a Spec's single E2E Acceptance Gate.
_Avoid_: acceptance gate, unit tests, product runtime

**Design Record**:
The `design.md` Spec Supporting File that records how a Spec reached Designed Status. It contains Research Findings and Design Decisions while the Main Spec File keeps the concise Design Summary and E2E Acceptance Gate.
_Avoid_: Design Detail, Design Section

**Research Findings**:
The descriptive part of the Design Record: source-backed facts, constraints, conflicts, evidence gaps, references, and explicitly labelled inferences that inform design.
_Avoid_: Research Phase, Research Status

**Design Decisions**:
The normative part of the Design Record: chosen behavior and structure, rationale, trade-offs, boundaries, edge cases, and verification strategy.
_Avoid_: Research Findings, Design Detail

**Implementation File**:
The `implementation.md` Spec Supporting File that records material deviations between the Spec and implementation reality, the durable attention points future work must preserve, representative verification, and a brief Spec retrospective. It is organized by information value rather than by mirroring every Plan Ticket.
_Avoid_: step log, change log, verification log

**Spec Template**:
The built-in Markdown skeletons used by the CLI to create a new Spec layout. They define initial sections and required subsections with brief placeholders, not examples or detailed writing guidance.
_Avoid_: workflow instructions, writing rules

**Skill**:
The agent-facing workflow source for Zest Dev. The main Skill owns lifecycle and shared recording invariants and routes into content-specific Section Guides.
_Avoid_: command, template

**Section Guide**:
A Skill-owned file named after the Spec content it governs, such as Overview, Design, Plan, or Implementation. It defines that content's contract and relevant workflow rules without representing an activity or Spec Status.
_Avoid_: Phase File, status guide, command

**Command**:
A user-facing entrypoint that selects a Design Approach for creating a new Spec and routes the requirement into the Zest Dev Skill. It does not carry detailed process, rules, or templates.
_Avoid_: workflow source, template, writing guide

**Plan Section**:
The Main Spec File area that records the implementation ticket breakdown produced from an approved Design. It does not contain Design Decisions.
_Avoid_: Plan Phase, design step

**Spec Status**:
A persisted lifecycle milestone that states how far a Spec's required record has matured. It describes artifact readiness, not the activities used to reach it.
_Avoid_: action, command

**Workflow Activity**:
An action used to advance or refine a Spec, such as research, grilling, or design synthesis. An activity may contribute to more than one Spec section and does not necessarily have its own Spec Status.
_Avoid_: status, lifecycle milestone

**Design Approach**:
The decision-making route used to reach `designed`. A Design Approach may be lightweight or grilling-based, but it must satisfy the same Design Section contract.
_Avoid_: phase, status

**Lightweight Design Approach**:
The default Design Approach for work whose consequential choices can be resolved without an intensive interview. It performs only the research and discussion needed to satisfy Designed Status.
_Avoid_: Research Phase, simple status

**Grilling Design Approach**:
A user-selected Design Approach that interleaves fact-finding with a one-question-at-a-time decision interview until shared understanding is reached. It produces the same Design Record and Designed Status as the Lightweight Design Approach.
_Avoid_: Grilling Phase, Grilling Status

**Designed Status**:
The first substantive Spec readiness milestone. It means the Research Findings, Design Decisions, Design Summary, and E2E Acceptance Gate are complete, regardless of which Design Approach produced them.
_Avoid_: research complete, discussion complete

**Planned Status**:
A Spec lifecycle milestone meaning the Spec's Design, Plan, and Progress sections are complete and ready for implementation.
_Avoid_: designed, ready

**Plan Ticket**:
One tracer-bullet implementation slice inside a Spec's Plan section, sized for one focused implementation session and linked to its blocking tickets. A Plan Ticket has a Type that describes whether the next implementer can proceed independently or needs human input.
_Avoid_: task, step, issue

**EAG Validation**:
The Plan Ticket that comes after the functional implementation tickets and before Documentation Sync. It validates the completed change against the Design section's EAG, or explicitly confirms that the Design says there is no EAG and uses the best available Spec-defined validation.
_Avoid_: general test plan, documentation ticket

**Documentation Sync**:
The final Plan Ticket, after EAG Validation, that checks whether the current implementation changed documented behavior, usage, commands, setup, or workflows, and updates relevant project documentation when needed. It is part of the current Spec's implementation work, not a Deferred Follow-Up.
_Avoid_: documentation follow-up

**Progress Checklist**:
A thin completion checklist in the Main Spec File, with one checkbox per Plan Ticket. It tracks implementation completion; it is not the implementation plan itself.
_Avoid_: plan, task list, notes

**Deferred Follow-Ups (DFU)**:
A final Main Spec File section for follow-up items explicitly deferred while completing the Designed Contract because they should be done only after the current Spec is complete. Add DFU only when the user explicitly wants to handle that work later, or when a clear functional gap is discovered and confirmed with the user first. DFU is fixed by Designed Status and is not part of the Plan or Progress Checklist.
_Avoid_: backlog, future tasks, documentation follow-up

**Ralph Task**:
A markdown checkbox item consumed by Ralph Tasks Mode from `.ralph/ralph-tasks.md`. It is generated from a Progress Checklist item when Zest Dev hands planned work to Ralph.
_Avoid_: Plan Ticket, Progress item

**AFK Plan Ticket**:
A Plan Ticket that an agent can implement independently from the written Spec and repository context.
_Avoid_: automatic ticket, background task

**HITL Plan Ticket**:
A Plan Ticket that needs user review, product judgment, or approval before it can be completed. Its Scope should make the required human input explicit.
_Avoid_: manual ticket, blocked ticket

**CLI**:
The `zest-dev` command-line tool that manages Spec lifecycle operations such as creating, showing, activating, and updating Specs.
_Avoid_: workflow engine, writing guide

## Example Dialogue

Developer: "The Spec Template should only create the empty sections."

Maintainer: "Right. The main Skill owns lifecycle invariants, each Section Guide defines one content contract, a Command selects the Design Approach, and the CLI creates the built-in Spec layout."

Developer: "Should the Design Section Guide also write the implementation checklist?"

Maintainer: "No. The Designed Contract records findings and decisions; the Plan Section turns that Design into a checklist."

Developer: "When should the EAG be chosen?"

Maintainer: "While completing the Designed Contract. It is part of the Design Section, and later Plan or Implementation work should use it as the end-to-end validation gate."

Developer: "Where does that validation show up in the Plan?"

Maintainer: "As its own EAG Validation ticket after the functional changes and before Documentation Sync."

Developer: "Where should the short version of the design go?"

Maintainer: "Put the Design Summary in the Main Spec File for review, and keep Research Findings plus Design Decisions in the Design Record."

Developer: "Should the acceptance gate list every test case?"

Maintainer: "No. The EAG should be one small automated end-to-end gate whenever possible: the visible behavior to accept plus the command or path that verifies it. If no automated end-to-end gate exists, say there is no EAG."

Developer: "When is a Spec ready for implementation?"

Maintainer: "When it reaches Planned Status: the Design is decided, and the Plan plus Progress Checklist are ready to execute."

Developer: "Can an agent start Ticket 2 without me?"

Maintainer: "Only if Ticket 2 is an AFK Plan Ticket. A HITL Plan Ticket must state the human input required before it can be completed."

Developer: "Can we send the Progress Checklist to Ralph?"

Maintainer: "Yes. The Progress Checklist records which Plan Tickets are complete; `zest-dev ralph` can convert its unchecked items into Ralph Tasks for Ralph Tasks Mode."
