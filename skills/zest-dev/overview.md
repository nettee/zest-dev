# Zest Dev Section Guide: Overview

## Overview content contract

The Main Spec File's `## Overview` makes the requested change reviewable without inventing missing detail. Capture the known:

- problem and motivation;
- desired outcome;
- material scope and exclusions;
- constraints;
- success criteria.

Include only content that adds information.

## New Spec requirements

- Derive a concise human-readable name and kebab-case slug, then run `zest-dev create <slug>` and `zest-dev set-active <spec-id>`.
- Read the generated Spec and use only provided, discovered, or explicitly confirmed information.
- Resolve only missing information that prevents a meaningful Overview.

New Status means the Overview exists but the complete Designed Contract has not yet been satisfied.
