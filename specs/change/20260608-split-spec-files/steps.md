# Steps

## Step 1: Generate Split Spec Layout

- Updated `zest-dev create` to always use built-in templates and create `spec.md`, `design.md`, and `steps.md`.
- Replaced the main Spec template with a review-oriented entrypoint that preserves workflow section order and links to supporting files.
- Added built-in `design.md` and `steps.md` templates.
- Removed the repository custom template override at `.zest-dev/template/spec.md`.
- Updated this follow-up to rename the implementation supporting file to `steps.md`, make main-file references read as natural prose, and make the supporting file step-oriented instead of split into global implementation and verification sections.
- Verification: covered by create/template integration assertions and the local/package test runs recorded below.

## Step 2: Route Workflow Content To Split Files

- Updated Research, Design, Plan, Implement, and summarize workflow guidance for the split layout.
- Updated Implement and summarize guidance so `steps.md` records one section per Plan step, combining implementation and verification notes.
- Verification: covered by prompt/deployed-content assertions and the local/package test runs recorded below.

## Step 3: Update Progress Consumers

- Updated Ralph setup to parse top-level `## Progress` from the main Spec file.
- Verification: covered by Ralph integration tests and the local/package test runs recorded below.

## Step 4: Refresh Documentation And Regression Coverage

- Updated README, glossary language, and integration tests for the new layout and removal of the Notes section name.
- Ran `pnpm test:local` successfully.
- Ran `pnpm test:package` successfully.
