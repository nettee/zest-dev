---
description: Fill implementation plan and advance spec to implemented phase
allowed-tools: Read, Edit, Bash(zest-spec:*)
---

Create the implementation plan for the current spec and update the Implementation section.

**Step 1: Verify Current Spec**
Execute: `zest-spec status`

Confirm there is a current spec set and status is "designed". If:
- No current spec: Guide user to set one
- Status is "new" or "researched": Suggest completing previous phases first
- Status is "implemented": Confirm if user wants to update existing plan

**Step 2: Read Current Spec**
Execute: `zest-spec show <current-spec-id>` to get the spec file path.

Read the spec file to understand:
- Overview and goals
- Research findings
- Design plan and architecture
- Any existing implementation notes

**Step 3: Create Implementation Plan**
Based on the design, create a concrete implementation checklist:

**Implementation plan should include:**
- **Task checklist**: Ordered, actionable tasks with checkboxes
- **File changes**: Specific files to create or modify
- **Testing approach**: How to verify the implementation works
- **Deployment notes**: Any deployment or setup considerations
- **Progress tracking**: Ability to mark tasks as done

Work with the user to:
- Break down design steps into specific implementation tasks
- Identify all files that need creation or modification
- Plan testing strategy
- Consider deployment requirements
- Organize tasks in logical implementation order

**Step 4: Fill Implementation Section**
Edit the spec file to add/update the Implementation section.

**Format guidelines:**
- Use checkbox list `- [ ]` for tasks
- Group related tasks under subheaders
- List specific file paths with brief descriptions
- Include testing tasks in the checklist
- Add notes for design deviations as they occur

**Content principles:**
- Concrete tasks: Each item should be clear and actionable
- Trackable progress: Checkboxes for completion tracking
- File-specific: Name exact files, not just "update backend"
- Testing included: Verification is part of implementation

**Step 5: Update Spec Status**
Execute: `zest-spec update <current-spec-id> implemented`

This updates the spec status using the CLI (do not edit frontmatter manually).

**Step 6: Confirm Completion**
Inform the user:
- Implementation plan has been created
- Spec status updated to "implemented"
- Tasks can be checked off as work progresses
- User can now begin implementation following the plan
- Remind them to update the spec if design changes during implementation

**Example Implementation Section Structure:**
```markdown
## Implementation

### Tasks
**Phase 1: Setup**
- [ ] Create database migration for new tables
- [ ] Install required dependencies (list them)
- [ ] Set up configuration files

**Phase 2: Backend**
- [ ] Implement authentication middleware (src/middleware/auth.js)
- [ ] Create login endpoint (src/routes/auth.js)
- [ ] Add protected route wrapper
- [ ] Write unit tests for auth middleware

**Phase 3: Frontend**
- [ ] Create login form component (client/src/components/LoginForm.jsx)
- [ ] Add authentication context (client/src/contexts/AuthContext.jsx)
- [ ] Implement protected route wrapper
- [ ] Update navigation for logged-in state

**Phase 4: Testing & Deployment**
- [ ] Write integration tests for login flow
- [ ] Manual testing across browsers
- [ ] Update documentation
- [ ] Deploy to staging environment

### Files Modified
- `migrations/003_add_auth.sql` - Add user authentication tables
- `src/middleware/auth.js` - JWT verification middleware
- `src/routes/auth.js` - Login/logout endpoints
- `client/src/components/LoginForm.jsx` - Login UI component
- `client/src/contexts/AuthContext.jsx` - Auth state management

### Design Changes
[Leave blank initially, add notes as implementation reveals adjustments]
- Changed from bcrypt to argon2 (better security)
- Added rate limiting on login endpoint (security requirement)

### Testing
- Unit tests: Auth middleware, password hashing
- Integration tests: Full login/logout flow
- Manual tests: Cross-browser compatibility, error states
```

**Important:**
- Make tasks specific and actionable
- Group tasks logically by phase or component
- Include testing as explicit tasks
- Keep file paths exact and complete
- Leave space to note design changes discovered during coding
