---
description: Create a new spec from natural language description
argument-hint: <description of task or requirement>
allowed-tools: Read, Write, Edit, Bash(zest-spec:*)
---

Create a new spec from the user's description: $ARGUMENTS

**Step 1: Extract Spec Information**
Analyze the user's description and determine:
- **Spec name**: Human-readable name (e.g., "User Authentication System")
- **Spec slug**: URL-friendly identifier in kebab-case (e.g., "user-authentication-system")

**Step 2: Create Spec via CLI**
Execute: `zest-spec create <spec-slug>`

This will:
- Create the spec file in `specs/` directory
- Generate unique ID and frontmatter
- Initialize empty sections

**Step 3: Set as Current Spec**
Execute: `zest-spec set-current <spec-id>`

Use the ID from the created spec (check CLI output or run `zest-spec status` to find it).

**Step 4: Fill Overview Section**
Read the created spec file from `specs/` directory.

Evaluate the user's description:
- **If comprehensive** (clear problem, scope, and context): Fill the Overview section with:
  - What problem is being solved
  - Why it matters
  - High-level scope
  - Any constraints mentioned

- **If vague or unclear**: Ask the user to clarify:
  - What specific problem needs solving?
  - What is the expected outcome?
  - Are there any constraints or requirements?
  - What is in scope vs out of scope?

Edit the spec file to add/update the Overview section.

**Step 5: Confirm and Guide Next Step**
- Confirm spec creation with name and ID
- Show the spec file location
- **If overview filled**: Inform user to proceed with `/research` command to continue
- **If clarification needed**: Wait for user input before proceeding

**Important:**
- Keep the overview brief and focused
- Use bullet points for clarity
- Don't write implementation details in overview
- Follow spec content principles: prioritize brevity, easy to review
