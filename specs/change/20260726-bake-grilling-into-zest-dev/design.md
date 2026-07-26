# Design Record

## Research Findings

### Existing System

- Zest Dev currently names five ordered lifecycle statuses: `new`, `researched`, `designed`, `planned`, and `implemented`. The CLI persists and validates exactly those values. Source: `skills/zest-dev/SKILL.md:31-40`; `lib/spec-manager.js:12-19`.
- The main skill describes those same values as five core phases and routes each phase to a file that both prescribes an activity and advances the corresponding status. Source: `skills/zest-dev/SKILL.md:13,28-29,59-67`.
- The Research workflow gathers factual evidence into `design.md` and advances an eligible `new` spec to `researched`. Source: `skills/zest-dev/research.md:8-15,17-31,39-45`.
- The Design workflow resolves consequential questions, produces the complete Design Section, and advances the spec to `designed`; it already permits starting from `new` when direct understanding is sufficient. Source: `skills/zest-dev/design.md:5-16,18-23,25-67`.
- The thin `research` and `design` commands are explicitly phrased as advancing to their matching statuses, reinforcing the coupling between user-invoked activity and lifecycle transition. Source: `commands/research.md:1-6`; `commands/design.md:1-6`.
- New Specs are generated from three built-in templates: the Main Spec File, `design.md`, and `implementation.md`. The current templates create a standalone Research link and a Design supporting file split into Research and Design Detail. Source: `lib/spec-manager.js:9-11,614-653`; `lib/template/spec.md:8-40`; `lib/template/design.md:1-9`.
- OpenCode deployment currently enumerates and publishes every Markdown file under `commands/`, while skill deployment recursively copies the Zest Dev skill directory. Source: `lib/plugin-deployer.js:266-320,388-425`.
- The CLI exposes `zest-dev prompt` through `lib/prompt-generator.js`, and Ralph setup calls `generatePrompt('implement')` to create `task.md`. Source: `bin/zest-dev.js:21-23,329-357`; `lib/prompt-generator.js:4-54`; `lib/ralph-setup.js:1-8,120-147`.

### Design Inputs

- The registered `grilling` skill owns the intensive decision process: it walks one decision-tree branch at a time, researches discoverable facts instead of asking the user, and waits for shared understanding before action. Source: `/Users/william/.agents/skills/grilling/SKILL.md:2-12`.
- `grill-with-docs` is a thin composition of `grilling` and `domain-modeling`, rather than an alternative Spec schema or lifecycle. Source: `/Users/william/.agents/skills/grill-with-docs/SKILL.md:1-7`.
- `domain-modeling` owns live glossary refinement and selective ADR capture during design discussion. Source: `/Users/william/.agents/skills/domain-modeling/SKILL.md:6-8,42-72`.

### Constraints & Dependencies

- Both the lightweight and grilling approaches must write the same Spec sections and converge at `designed`; Plan and Implement remain common downstream workflows. Source: confirmed maintainer requirement in this Spec discussion.
- Research performed during grilling must remain source-backed and land in Research Findings, without becoming a separate step or status. Source: confirmed maintainer requirement in this Spec discussion.
- Zest Dev should own lifecycle records and milestone contracts without duplicating the interview behavior already owned by `grilling` or the glossary/ADR behavior owned by `domain-modeling`. Source: confirmed maintainer decision in this Spec discussion.
- `researched` is present throughout the current CLI, skill, commands, documentation, and tests, so removing it is a lifecycle migration rather than only a prompt edit. Source: `lib/spec-manager.js:12-19`; `skills/zest-dev/SKILL.md:13,31-40,59-67`; `commands/research.md:1-6`.

## Design Decisions

### Separate lifecycle status from decision-making approach

Treat grilling as an optional approach for reaching `designed`, not as a Zest Dev phase or persisted status. Zest Dev owns the Spec lifecycle, required artifacts, and readiness criteria; specialized skills own how facts and decisions are elicited. The lightweight and grilling approaches may execute different activities, but they satisfy the same `designed` contract and share all downstream behavior.

This preserves a finite readiness model while removing the assumption that every meaningful activity maps one-to-one to a status transition. The decision is supported by the existing finite status model and the fact that grilling spans both factual research and normative design work. Source: `lib/spec-manager.js:12-19`; `/Users/william/.agents/skills/grilling/SKILL.md:6-12`.

### Make `designed` the first substantive readiness milestone

Remove `researched` from the lifecycle. A Spec remains `new` while evidence is gathered and choices are resolved, then advances to `designed` only when the combined Research Findings and Design Decisions contract is satisfied. Research remains an activity whose durable output is part of the Design Record, but it is neither a separate required step nor a persisted maturity state.

This makes the lifecycle represent reviewable delivery boundaries rather than a transcript of which activity ran. Both Design Approaches therefore share the same state transition while differing only in orchestration:

```text
Lightweight: new -- research activity -- design synthesis --> designed
Grilling:    new -- grilling (research + decisions) --------> designed
```

The trade-off is reduced visibility of an intermediate research checkpoint. That progress remains observable in Research Findings rather than in frontmatter. Source: confirmed maintainer decision in this Spec discussion; the current Research section contract is defined at `skills/zest-dev/research.md:17-31`.

### Replace phase commands with approach entrypoints

Delete the current thin command prompts instead of adapting them. Their one-command-to-one-status wording encodes the coupling this design is removing. Add exactly two creation entrypoints:

- `/zest-dev:lightweight <requirement>` creates and activates a new Spec, establishes its Overview, and satisfies the Designed Contract through the Lightweight Design Approach.
- `/zest-dev:grilling <requirement>` creates and activates a new Spec, establishes its Overview, and satisfies the Designed Contract through the Grilling Design Approach.

Both commands end at Designed Status, the point where the two approaches converge. Plan remains a shared downstream content contract reached only when requested separately.

Do not restore standalone Overview, Research, Design, Plan, or Implementation commands. Research remains available within either Design Approach, not as a lifecycle transition or command surface. Source: confirmed maintainer decision in this Spec discussion; current command coupling is visible at `commands/research.md:1-6` and `commands/design.md:1-6`.

### Route explicitly between lightweight and grilling approaches

Use the Lightweight Design Approach by default. Enter the Grilling Design Approach when the user explicitly requests grilling or `grill-with-docs`, or when the agent identifies multiple consequential, dependent decisions, recommends grilling, and the user accepts. Never start grilling silently based on an inferred complexity score because it commits the user to an intensive interactive process.

Both approaches update the same Design Record. During grilling, write confirmed Research Findings and Design Decisions incrementally; treat those writes as part of the decision record, not as implementation. Complete the Design Summary and EAG and advance to `designed` only after the user confirms shared understanding.

Source: confirmed maintainer decision in this Spec discussion; the interaction and completion constraints come from `/Users/william/.agents/skills/grilling/SKILL.md:6-12`.

### Compose the specialized skills directly

Implement the Grilling Design Approach by composing the registered `grilling` and `domain-modeling` skills directly. Do not copy their interview, glossary, scenario-testing, or ADR rules into Zest Dev. Keep `grill-with-docs` compatible as a user-invoked convenience wrapper whose intent selects the same approach, but do not make Zest Dev depend on that wrapper.

The responsibility boundary is:

- Zest Dev owns the Design Record contract, incremental persistence, source requirements, and status transition.
- `grilling` owns the one-question-at-a-time interview and shared-understanding gate.
- `domain-modeling` owns active terminology refinement and selective ADR capture.

This avoids depending on a wrapper marked for manual invocation while preserving the behavior the maintainer currently requests through `grill-with-docs`. Source: confirmed maintainer decision in this Spec discussion; `/Users/william/.agents/skills/grill-with-docs/SKILL.md:1-7`; `/Users/william/.agents/skills/domain-modeling/SKILL.md:42-72`.

### Organize skill guidance by Spec content

Name the supporting skill guides after the Spec content they govern, not after an activity or destination status:

```text
overview.md
design.md
plan.md
implementation.md
```

Each Section Guide defines the content contract and relevant writing or execution rules for its area. The main skill owns lifecycle interpretation and performs a status transition only when the corresponding content contract is complete:

- a created Spec with a useful Overview remains `new` while Design is incomplete;
- a complete Design Section and Design Record produce `designed`;
- a complete Plan and matching Progress Checklist produce `planned`;
- completed implementation, Progress, and Implementation File produce `implemented`.

Delete the standalone Research guide because Research Findings are part of the Design Record contract. Rename `new.md` to `overview.md` and `implement.md` to `implementation.md`; retain `design.md` and `plan.md` because their names now refer to Spec content rather than actions.

Source: confirmed maintainer decision in this Spec discussion. The current action/status coupling is documented at `skills/zest-dev/SKILL.md:59-67`.

### Make the new Spec model intentionally breaking

Apply the refactored lifecycle, templates, and skill guidance only to Specs created under the new model. Do not migrate, rewrite, or preserve compatibility for existing Specs that use `researched` or the old content structure. Leave old Spec directories untouched.

The refactored CLI and skill must create the new structure correctly and support the new workflow end to end. If an old Spec is explicitly used with code that no longer understands its status or structure, fail observably rather than silently translating it or maintaining legacy branches.

Source: confirmed maintainer decision in this Spec discussion.

### Keep Section Guides free of sequencing behavior

Section Guides define only the content contract for Overview, Design, Plan, and Implementation. Remove mandatory stop points, next-step suggestions, phase hand-offs, and other instructions that imply a fixed action sequence. The main skill may fill multiple content areas continuously when that is required by the user's stated outcome.

Do not add any mandatory workflow barrier, including before implementation. Reaching a status ends the workflow only when it satisfies the user's requested outcome; otherwise work may continue into the next content contract within the authorization already provided by the request.

Source: confirmed maintainer decision in this Spec discussion. The current Overview guide's mandatory stop is at `skills/zest-dev/new.md:33`, and the current Design guide's mandatory stop before Plan is at `skills/zest-dev/design.md:62-64`.

### Keep `to-tickets` as a planning-method reference

Preserve the current boundary after Designed Status: the Plan Section Guide applies the tracer-bullet slicing, scale, sequencing, and blocking-edge principles associated with the registered `to-tickets` skill, but writes Spec-local Plan Tickets and the Progress Checklist. It does not invoke the skill's tracker publication workflow by default.

External ticket creation remains a separate, explicitly requested operation. Planned Status means the Spec-local Plan contract is complete; it does not require tracker issues to exist.

Source: confirmed maintainer decision in this Spec discussion; current Zest boundary at `skills/zest-dev/plan.md:24-31`; full `to-tickets` publication behavior at `/Users/william/.agents/skills/to-tickets/SKILL.md:46-73`.

### Remove general prompt generation while preserving commands and Ralph

Delete the five current command source files and replace them with the two approach entrypoints. Keep packaging and publishing those two editor commands, and let initialization remove stale managed Zest Dev command prompts that are no longer part of the expected set without touching unrelated user commands.

Delete the user-facing `zest-dev prompt` command and `lib/prompt-generator.js`. Keep `zest-dev ralph`, but decouple it from the removed prompt generator. Ralph setup should write a dedicated minimal internal instruction that tells its runner to use the Zest Dev skill with the active planned Spec. This internal runner instruction is not a public command or a Section Guide.

This preserves the two useful editor entrypoints and Ralph behavior without retaining a general CLI prompt-generation abstraction. Source: confirmed maintainer decision in this Spec discussion; current dependency chain at `bin/zest-dev.js:21-23,329-357`; `lib/prompt-generator.js:4-54`; `lib/ralph-setup.js:1-8,120-147`.

## System Structure

```text
Zest Dev skill
├── shared lifecycle and recording invariants
├── overview.md       → Overview content contract
├── design.md         → Design Section + Design Record contract
│   ├── Lightweight Design Approach (default)
│   └── Grilling Design Approach
│       ├── grilling
│       └── domain-modeling
├── plan.md           → Plan + Progress contract
│   └── to-tickets method reference; no default publication
└── implementation.md → Implementation content contract

Spec lifecycle
new → designed → planned → implemented
```

## Change Scope

### Impact Areas

- Lifecycle: remove `researched` from valid states and transitions with no legacy migration or compatibility path.
- Spec schema: make Design Record the home of Research Findings and Design Decisions; remove the standalone Main Spec Research area.
- Skill architecture: replace action-oriented phase routing with content-oriented Section Guides and compose grilling/domain-modeling without duplicating their behavior.
- Prompt surface: replace five phase-oriented editor commands with two approach-oriented creation commands; remove general CLI prompt generation while preserving Ralph through a dedicated internal instruction.
- Deployment and packaging: publish only the two expected Zest Dev commands and clean stale managed Zest Dev command files.
- Documentation and tests: update workflow vocabulary, resource layout, status expectations, templates, deployment coverage, Ralph coverage, and E2E lifecycle assertions.

### Planned File Changes

- `skills/zest-dev/SKILL.md`: describe the four-state lifecycle, shared record rules, target-driven continuation, and Section Guide routing.
- `skills/zest-dev/overview.md`: replace `new.md` with the Overview content contract and no mandatory hand-off behavior.
- `skills/zest-dev/design.md`: merge source discipline with the Design contract, define both Design Approaches, and directly compose `grilling` plus `domain-modeling` for the grilling route.
- `skills/zest-dev/plan.md`: retain the Spec-local `to-tickets` method boundary and remove fixed phase-stop language.
- `skills/zest-dev/implementation.md`: replace `implement.md` with the Implementation content contract and remove phase terminology.
- `skills/zest-dev/new.md`, `skills/zest-dev/research.md`, `skills/zest-dev/implement.md`: remove the superseded Section Guide sources.
- `lib/template/spec.md`, `lib/template/design.md`: create the new Main Spec and Design Record structure.
- `lib/template/implementation.md`: align terminology with Research Findings, Design Decisions, and content-oriented guides.
- `lib/spec-manager.js`: remove `researched` from valid statuses and ordering; retain forward-only transitions among the four new states.
- `commands/`: replace the five current prompts with two Design Approach creation entrypoints.
- `lib/prompt-generator.js`: remove the general command-to-prompt generator.
- `bin/zest-dev.js`: remove the `prompt` subcommand, generator import, and command-based deployment-hint discovery.
- `lib/ralph-setup.js`: generate Ralph's dedicated internal task instruction without a command file.
- `lib/plugin-deployer.js`, `package.json`, plugin compatibility resources: deploy and package only the two new commands while cleaning stale managed Zest Dev prompts safely.
- `README.md`, `plugin/README.md`, `CONTEXT.md`: document the content-contract model, new lifecycle, Design Approaches, and resource layout.
- `e2e/tests/`: replace command, phase-file, template, status, deployment, and Ralph assertions with coverage of the new model.

## Edge Cases

- An old Spec with `status: researched` or the former schema is not migrated. New lifecycle operations fail observably when they require a status or structure that is no longer valid.
- A partially completed Design Record remains `new`; partial Findings or Decisions do not imply Designed Status.
- Grilling may be interrupted and resumed without a special status. Confirmed Findings and Decisions remain in the Design Record, while Summary and EAG stay incomplete until shared understanding.
- A simple change may reach `designed` with minimal Research Findings, but required factual premises still need representative sources; absence of evidence must remain explicit.
- Replacing managed Zest Dev command prompts must remove obsolete Zest Dev prompts without removing unrelated user-created command files.
- Ralph must fail observably when its normal prerequisites are absent; its dedicated internal prompt must not become a hidden replacement for the removed public prompt system.
- External tickets are not required for Planned Status and are created only on explicit request.

## Verification Strategy

- Update E2E template tests to assert the new Main Spec and Design Record headings created by `zest-dev create`.
- Update lifecycle tests to accept only `new`, `designed`, `planned`, and `implemented`, including forward skips and rejection of `researched`.
- Update init/deployment tests to assert the four Section Guides and two approach commands are deployed, stale managed prompts are cleaned, and unrelated commands survive.
- Remove prompt-generator tests and update CLI help/command coverage to show that `zest-dev prompt` no longer exists while the two editor commands remain deployable.
- Update Ralph tests to verify its tasks and dedicated `task.md` instruction without command sources.
- Run the complete local E2E suite and the packaged-install suite because package contents and deployment behavior both change.
