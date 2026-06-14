# Design

## Research

- Issue #89 asks for a separate Spec section at the end for follow-up items deferred out of the current Spec, because those items become accurately describable only after the current Spec is complete. Source: https://github.com/nettee/zest-dev/issues/89
- The current built-in main Spec template ends with `## Progress` and `## Implementation`, with implementation detail linked to `steps.md`. Source: `lib/template/spec.md`
- The Design Phase currently owns Design Summary and EAG content, while Plan owns Plan/Progress and Implement owns Progress/steps updates. Source: `skills/zest-dev/design.md`; `skills/zest-dev/plan.md`; `skills/zest-dev/implement.md`
- `zest-dev ralph` currently converts unfinished Progress checkboxes into Ralph tasks and appends one fixed PR task. Source: `lib/ralph-setup.js`

## Design Detail

### Design Decisions

- Decision: Add `## Deferred Follow-Ups (DFU)` after `## Implementation` in the main Spec template so it is visibly last and belongs to the whole Spec lifecycle. Source: user decision; `lib/template/spec.md`
- Decision: DFU is fixed during the Design Phase. The Design workflow must write concise bullets or `None.`, and Implement must not silently append DFU items. Source: user decision; `skills/zest-dev/design.md`; `skills/zest-dev/implement.md`
- Decision: Keep DFU outside Plan and Progress. `Documentation Follow-Up` is renamed to `Documentation Sync` to preserve the current final documentation step without confusing it with DFU. Source: user decision; `skills/zest-dev/plan.md`; `CONTEXT.md`
- Decision: `zest-dev ralph` should stay simple and append one additional fixed Ralph task for DFU issue creation/linking after the existing PR task. Source: user decision; `lib/ralph-setup.js`

### Change Scope

Impact Areas:
- Built-in Spec template gains a final DFU section.
- Zest Dev skill guidance defines Design ownership, Plan exclusion, Implement immutability, and Documentation Sync naming.
- Ralph setup appends a DFU handoff task.
- E2E tests assert template, deployment, and Ralph task behavior.

Planned File Changes:
- `CONTEXT.md`: add glossary terms for DFU and Documentation Sync.
- `lib/template/spec.md`: add `## Deferred Follow-Ups (DFU)` after `## Implementation`.
- `skills/zest-dev/SKILL.md`: route DFU to Design and rename the final documentation step to Documentation Sync.
- `skills/zest-dev/design.md`: require DFU bullets or `None.` during Design.
- `skills/zest-dev/plan.md`: rename the final documentation step and keep DFU out of Progress.
- `skills/zest-dev/implement.md`: prohibit adding DFU during implementation without revising Design.
- `lib/ralph-setup.js`: append the DFU Ralph task.
- `e2e/tests/*`: update assertions for new template, deployed skill text, and Ralph tasks.

### Verification Strategy

- Run `pnpm test:local` and `pnpm test:package` to cover local and packaged CLI lifecycle, deployment artifacts, and Ralph task generation.
