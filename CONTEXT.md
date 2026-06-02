# Zest Dev

Zest Dev is a lightweight, human-interactive workflow for AI-assisted coding. This glossary defines the project-specific language used to discuss its workflow resources and spec lifecycle.

## Language

**Spec**:
A change document that records the overview, research, design, optional plan, and implementation notes for one unit of work.
_Avoid_: ticket, task document

**Spec Template**:
The Markdown skeleton used by the CLI to create a new Spec. It defines the initial top-level sections with brief placeholders, not examples, subsection templates, or detailed writing guidance.
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

**CLI**:
The `zest-dev` command-line tool that manages Spec lifecycle operations such as creating, showing, activating, and updating Specs.
_Avoid_: workflow engine, writing guide

## Example Dialogue

Developer: "The Spec Template should only create the empty sections."

Maintainer: "Right. The main Skill routes the workflow, the Phase File explains how to fill the relevant sections, the Command only routes the request, and the CLI creates the Spec from the Spec Template."
