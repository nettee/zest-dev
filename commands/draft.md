---
description: Capture the current discussion into a Zest Dev spec
argument-hint: [optional spec-slug]
---

Bridge entrypoint into the Zest Dev skill.

**Language rule:** Always respond in the user's language throughout the flow unless the user asks to switch languages.

Spec slug hint: $ARGUMENTS

Capture the current conversation into a spec, using `zest-dev` CLI for lifecycle operations. Infer the highest status genuinely reached by the discussion, fill the corresponding spec sections according to the canonical Zest Dev phase rules, persist the status, and report the spec id, path, current status, and next recommended step.

If the highest reached status is `researched`, run `zest-dev update active researched`.

If the highest reached status is `designed`, run `zest-dev update active designed`.

If the spec is already `designed`, guide the user to `/implement` as the next explicit step.
