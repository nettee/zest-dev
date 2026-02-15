---
description: Create a new feature spec from description
argument-hint: <description of feature or requirement>
allowed-tools: Read, Write, Edit, Bash(zest-spec:*), AskUserQuestion
---

# Create New Feature Spec

Create a new feature specification from the user's description and prepare for development.

**User's description:** $ARGUMENTS

---

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

**Step 4: Understand the Feature**

Read the created spec file from `specs/` directory.

Evaluate the user's description:
- **If comprehensive** (clear problem, scope, and context):
  - Proceed to fill Overview section

- **If vague or unclear**:
  - Use AskUserQuestion or direct questions to clarify:
    - What specific problem needs solving?
    - What is the expected outcome or user value?
    - Are there any constraints or requirements?
    - What is in scope vs out of scope?
    - Any performance, security, or compatibility requirements?

**Step 5: Fill Overview Section**

Edit the spec file to add/update the Overview section with:

**Include:**
- **Problem Statement**: What problem is being solved and why it matters
- **Goals**: What should the feature accomplish
- **Scope**: What's included and what's explicitly excluded
- **Constraints**: Technical limitations, requirements, or dependencies
- **Success Criteria**: How to measure if the feature is successful

**Format:**
- Use bullet points for clarity
- Keep descriptions brief (1-2 sentences per item)
- Focus on "what" and "why", not "how" (implementation comes later)

**Example Structure:**
```markdown
## Overview

### Problem Statement
- Users currently cannot [problem]
- This causes [impact] and prevents [desired outcome]

### Goals
- Enable users to [capability 1]
- Improve [metric/experience] by [amount/description]
- Support [use case or requirement]

### Scope
**In scope:**
- [Feature component 1]
- [Feature component 2]
- [Related change or requirement]

**Out of scope:**
- [Related feature to defer]
- [Future enhancement]

### Constraints
- Must maintain backward compatibility with [system/API]
- Performance: [requirement]
- Security: [requirement]
- Timeline: [consideration]

### Success Criteria
- [ ] Users can successfully [action]
- [ ] [Metric] improves by [amount]
- [ ] Zero high-severity bugs in production
- [ ] Documentation updated
```

**Step 6: Confirm and Guide Next Steps**

Inform the user:
- ✅ Spec created with ID `<spec-id>` and name `<spec-name>`
- ✅ Spec file location: `specs/<spec-slug>.md`
- ✅ Set as current working spec
- ✅ Overview section completed

**Next steps:**
- Use `/research` command to start discovery and codebase exploration
- Or manually explore the spec with `zest-spec show <spec-id>`

---

**Important Notes**

- **Keep overview brief**: Focus on problem and goals, not solution
- **Clarify early**: Better to ask questions now than assume later
- **Use bullet points**: Makes the spec scannable and reviewable
- **No implementation details**: Overview describes "what" and "why", not "how"
