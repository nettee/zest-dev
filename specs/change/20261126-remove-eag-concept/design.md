# Design Record

## Research Findings

- Designed Contract currently requires `spec.md` → `## Design` → `### E2E Acceptance Gate (EAG)` (`skills/zest-dev/design.md`).
- Plan contract requires an EAG Validation ticket after functional work (`skills/zest-dev/plan.md`).
- Implementation contract requires Design EAG pass and temporary EAG artifact cleanup (`skills/zest-dev/implementation.md`).
- Main Spec template ships an EAG subsection (`lib/template/spec.md`); Implementation template already has `## Verification` for final gates/results (`lib/template/implementation.md`).
- `CONTEXT.md` defines EAG, EAG Validation, and example dialogue around choosing/running EAG; it separately defines the repository E2E Test Suite.
- E2E tests assert EAG headings/wording in templates and deployed guides (`e2e/tests/test_spec_lifecycle.py`, `e2e/tests/test_init_deployment.py`).
- Historical Specs under `specs/change/` still contain EAG content; lifecycle rules say not to migrate unsupported/old structures for this change's purpose—leave them as historical records.
- Inference: Agents treat the named gate + mandatory Validation ticket as a signal to invent Spec-local automated harnesses; unsupervised results overfit. A results-only Verification slot is lower risk than a Design-time named gate.

## Design Decisions

- Remove the EAG concept entirely from agent-facing workflow sources (Section Guides, template Design section, glossary terms EAG / EAG Validation, and related dialogue). Rationale: named gate + required Validation ticket steers agents toward unnecessary Spec-local e2e/EAG scripts.
- Do not introduce a replacement named acceptance-gate construct or a mandatory post-functional Validation ticket. Rationale: user asked to drop the concept, not rename it.
- Keep end-to-end verification as ordinary guidance: when user- or system-visible behavior changes, prefer an end-to-end check using existing project tests/commands; do not invent one-off harnesses unless the user requests a reusable capability. Place the brief mention primarily in Implementation guidance; Design Decisions may still record verification strategy when material, without a dedicated EAG subsection. Rationale: preserve the useful concept without a ritual artifact.
- Keep and clarify `implementation.md` → `## Verification` in the Spec template as the place agents write text proof of end-to-end verification results after running them (commands + outcomes; not screenshots/images). Rationale: user wants a durable results slot without Design-time gate ceremony.
- Soften the main skill invariant from “acceptance behavior” toward durable verification/results language so it does not reintroduce EAG. Rationale: avoid leftover terminology pressure.
- Update CONTEXT and E2E assertions to match; do not rewrite historical Specs. Rationale: forward-only contract change; archives remain evidence of prior practice.
- Impact Areas: skill Section Guides, Spec templates, CONTEXT glossary, deployment/lifecycle E2E assertions.
- Planned File Changes:
  - `skills/zest-dev/SKILL.md` — drop acceptance-gate wording from invariants.
  - `skills/zest-dev/design.md` — remove EAG from Designed Contract and writing rules.
  - `skills/zest-dev/plan.md` — remove EAG Validation ticket requirement.
  - `skills/zest-dev/implementation.md` — replace EAG pass/cleanup rules with light e2e verification + text Verification recording.
  - `lib/template/spec.md` — remove EAG subsection.
  - `lib/template/implementation.md` — clarify Verification as text e2e proof.
  - `CONTEXT.md` — remove EAG/EAG Validation terms and dialogue; keep E2E Test Suite as repo harness language.
  - `e2e/tests/test_spec_lifecycle.py`, `e2e/tests/test_init_deployment.py` — assert the new contract.
