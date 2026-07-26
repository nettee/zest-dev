from pathlib import Path

from conftest import (
    DFU_RALPH_TASK,
    FINAL_RALPH_TASK,
    RALPH_TASK_PROMPT,
    create_active_spec_with_body,
    fake_ralph_env,
    read_fake_ralph_tasks,
)


def test_ralph_converts_unfinished_progress_to_tasks_and_task_md(cli):
    spec_id, _ = create_active_spec_with_body(
        cli,
        "ralph-progress",
        """---
id: test-ralph-progress
name: Ralph Progress
status: planned
created: '2026-06-04'
---

## Overview

Test spec.

## Progress

- [ ] Ticket 1: Parse active Progress into task text
- [x] Ticket 2: Already complete
- [ ] Ticket 3: Write implement prompt file

## Implementation

See [implementation.md](./implementation.md).

""",
    )
    stale_file = cli.project_dir / ".ralph" / "stale.txt"
    stale_file.parent.mkdir(parents=True)
    stale_file.write_text("stale", encoding="utf-8")

    output = cli.yaml("ralph", env=fake_ralph_env(cli.project_dir))
    tasks = read_fake_ralph_tasks(cli.project_dir)

    assert output["ok"] is True
    assert output["spec"]["id"] == spec_id
    assert tasks == [
        "Ticket 1: Parse active Progress into task text",
        "Ticket 3: Write implement prompt file",
        DFU_RALPH_TASK,
        FINAL_RALPH_TASK,
    ]
    assert output["tasks_added"] == tasks
    assert "ralph_results" not in output
    assert not stale_file.exists()
    assert output["task_md"] == {"path": "task.md", "content": RALPH_TASK_PROMPT}
    assert (cli.project_dir / "task.md").read_text(encoding="utf-8") == RALPH_TASK_PROMPT


def test_ralph_rejects_legacy_notes_progress(cli):
    create_active_spec_with_body(
        cli,
        "ralph-legacy-progress",
        """---
id: test-ralph-legacy-progress
name: Ralph Legacy Progress
status: planned
created: '2026-06-04'
---

## Overview

Legacy spec.

## Notes

### Progress

- [ ] Ticket 1: Preserve legacy Ralph handoff
- [x] Ticket 2: Already complete
- [ ] Ticket 3: Keep split layout support

### Decisions

- Use the split spec layout for new specs.
""",
    )
    failed = cli.fail("ralph", env=fake_ralph_env(cli.project_dir))
    assert "Active spec is missing ## Progress" in failed
    assert not (cli.project_dir / "task.md").exists()


def test_ralph_only_adds_leading_afk_progress_tasks(cli):
    create_active_spec_with_body(
        cli,
        "ralph-leading-afk-progress",
        """---
id: test-ralph-leading-afk-progress
name: Ralph Leading AFK Progress
status: planned
created: '2026-06-04'
---

## Overview

Test spec.

## Progress

- [ ] Ticket 1 (AFK): AMR API Admin Grant
- [ ] Ticket 2 (AFK): Admin Grant Workflow
- [ ] Ticket 3 (AFK): Wallet Source Copy
- [ ] Ticket 4 (HITL): Test/Production Secret Setup
- [ ] Ticket 5 (AFK): Should not enter Ralph after HITL

""",
    )
    output = cli.yaml("ralph", env=fake_ralph_env(cli.project_dir))
    tasks = read_fake_ralph_tasks(cli.project_dir)

    assert tasks == [
        "Ticket 1 (AFK): AMR API Admin Grant",
        "Ticket 2 (AFK): Admin Grant Workflow",
        "Ticket 3 (AFK): Wallet Source Copy",
        DFU_RALPH_TASK,
        FINAL_RALPH_TASK,
    ]
    assert output["tasks_added"] == tasks


def test_ralph_failure_cases_do_not_write_outputs(cli):
    create_active_spec_with_body(
        cli,
        "ralph-complete-progress",
        """---
id: test-ralph-complete-progress
name: Ralph Complete Progress
status: planned
created: '2026-06-04'
---

## Progress

- [x] Ticket 1: Done
- [X] Ticket 2: Also done
""",
    )
    failed = cli.fail("ralph", env=fake_ralph_env(cli.project_dir))
    assert "Active spec Progress section has no unfinished checkbox items" in failed
    assert not (cli.project_dir / ".ralph").exists()
    assert not (cli.project_dir / "task.md").exists()

    project = cli.project_dir
    import shutil

    shutil.rmtree(project / "specs")
    failed = cli.fail("ralph")
    assert "No active change spec set" in failed
    assert not (project / "task.md").exists()

    create_active_spec_with_body(
        cli,
        "ralph-missing-progress",
        """---
id: test-ralph-missing-progress
name: Ralph Missing Progress
status: planned
created: '2026-06-04'
---

## Implementation

See [implementation.md](./implementation.md).

""",
    )
    failed = cli.fail("ralph", env=fake_ralph_env(project))
    assert "Active spec is missing ## Progress" in failed
    assert not (project / ".ralph").exists()
    assert not (project / "task.md").exists()

    create_active_spec_with_body(
        cli,
        "ralph-malformed-progress",
        """---
id: test-ralph-malformed-progress
name: Ralph Malformed Progress
status: planned
created: '2026-06-04'
---

## Progress

- [/] Ticket 1: In progress is not supported
""",
    )
    failed = cli.fail("ralph", env=fake_ralph_env(project))
    assert "Unsupported Progress line: - [/] Ticket 1: In progress is not supported" in failed
    assert not (project / ".ralph").exists()
    assert not (project / "task.md").exists()

    create_active_spec_with_body(
        cli,
        "ralph-old-step-label",
        """---
id: test-ralph-old-step-label
name: Ralph Old Step Label
status: planned
created: '2026-06-04'
---

## Progress

- [ ] Step 1 (AFK): Old labels are not supported
""",
    )
    failed = cli.fail("ralph", env=fake_ralph_env(project))
    assert "Unsupported Progress line: - [ ] Step 1 (AFK): Old labels are not supported" in failed
    assert not (project / ".ralph").exists()
    assert not (project / "task.md").exists()

    create_active_spec_with_body(
        cli,
        "ralph-mixed-progress-labels",
        """---
id: test-ralph-mixed-progress-labels
name: Ralph Mixed Progress Labels
status: planned
created: '2026-06-04'
---

## Progress

- [ ] Ticket 1 (AFK): Annotated
- [ ] Ticket 2: Plain mixed into annotated Progress
""",
    )
    failed = cli.fail("ralph", env=fake_ralph_env(project))
    assert "Unsupported Progress line: - [ ] Ticket 2: Plain mixed into annotated Progress" in failed
    assert not (project / ".ralph").exists()
    assert not (project / "task.md").exists()


def test_ralph_rejects_active_specs_that_are_not_planned(cli):
    create_active_spec_with_body(
        cli,
        "ralph-designed-spec",
        """---
id: test-ralph-designed-spec
name: Ralph Designed Spec
status: designed
created: '2026-06-04'
---

## Progress

- [ ] Ticket 1: Should not reach Ralph from designed status
""",
    )
    failed = cli.fail("ralph", env=fake_ralph_env(cli.project_dir))
    assert 'Active spec must have status "planned" to set up Ralph (found "designed")' in failed
    assert not (cli.project_dir / ".ralph").exists()
    assert not (cli.project_dir / "task.md").exists()
