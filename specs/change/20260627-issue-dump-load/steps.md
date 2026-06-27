# Steps

## Step 1 (AFK): Protocol Document And Core Local Representation

### Implementation

Added the Issue Spec Representation core in `lib/spec-manager.js`: Spec directory Markdown walking, protocol header rendering/parsing, strict path/spec-id validation, duplicate detection, and local reconstruction into a new Spec directory.

### Verification

Covered by the new E2E round-trip test that dumps a Spec with top-level and nested Markdown files, loads it into a fresh directory, and compares exact Markdown paths and file contents.

## Step 2 (AFK): CLI Local Mode

### Implementation

Added public `zest-dev dump <spec|active> --dry-run` and `zest-dev load --from-file <path>` commands in `bin/zest-dev.js`, preserving YAML output and leaving the active Spec unchanged on load.

### Verification

Verified through E2E CLI calls using `dump active --dry-run` and `load --from-file`, including package-install coverage.

## Step 3 (AFK): GitHub Transport

### Implementation

Added GitHub transport through `gh`: remote dump creates a new issue and protocol comments, remote load reads issue body/comments, Forgejo inference fails clearly until a future adapter exists, and partial comment failure reports the created issue URL.

### Verification

Covered by an E2E fake-`gh` adapter test for issue creation, comment creation, remote load, and partial comment failure reporting.

## Step 4 (AFK): EAG Validation

### Implementation

Ran the local representation EAG and fail-fast cases for missing `spec.md`, non-Markdown files, missing protocol header, invalid `spec-id`, mismatched comment `spec-id`, duplicate paths, and existing target directory.

### Verification

Passed `pnpm test:local` and `pnpm test:package`.

## Step 5 (AFK): Documentation Sync

### Implementation

Updated `README.md` CLI reference with `dump` and `load`. The existing protocol document already matched the implemented behavior.

### Verification

Documentation changes were included in the passing local and package E2E runs.
