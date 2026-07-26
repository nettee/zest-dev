# Zest Dev Section Guide: Overview

## Overview content contract

The Main Spec File's `## Overview` makes the requested change reviewable without inventing missing detail.

It captures the known:

- problem and motivation;
- desired outcome;
- material scope and exclusions;
- constraints;
- success criteria.

Include only sections that add information.

## New Spec requirements

- Create the Spec with `zest-dev create <slug>` and activate it with `zest-dev set-active <spec-id>`.
- Derive a concise human-readable name and kebab-case slug from the requirement.
- Read the generated Spec before editing it.
- Use only information provided by the user or explicitly confirmed.
- Resolve only missing information that prevents a meaningful Overview.

New Status means the Overview exists but the complete Designed Contract has not yet been satisfied.
