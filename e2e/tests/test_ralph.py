from pathlib import Path

from conftest import (
    FINAL_RALPH_TASK,
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

- [ ] Step 1: Parse active Progress into task text
- [x] Step 2: Already complete
- [ ] Step 3: Write implement prompt file

## Implementation

See [steps.md](./steps.md).

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
        "Step 1: Parse active Progress into task text",
        "Step 3: Write implement prompt file",
        FINAL_RALPH_TASK,
    ]
    assert output["tasks_added"] == tasks
    assert "ralph_results" not in output
    assert not stale_file.exists()
    prompt = cli.ok("prompt", "implement")
    assert output["task_md"] == {"path": "task.md", "content": prompt}
    assert (cli.project_dir / "task.md").read_text(encoding="utf-8") == prompt


def test_ralph_falls_back_to_legacy_notes_progress(cli):
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

- [ ] Step 1: Preserve legacy Ralph handoff
- [x] Step 2: Already complete
- [ ] Step 3: Keep split layout support

### Decisions

- Use the split spec layout for new specs.
""",
    )
    output = cli.yaml("ralph", env=fake_ralph_env(cli.project_dir))
    tasks = read_fake_ralph_tasks(cli.project_dir)
    assert output["ok"] is True
    assert tasks == [
        "Step 1: Preserve legacy Ralph handoff",
        "Step 3: Keep split layout support",
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

- [x] Step 1: Done
- [X] Step 2: Also done
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

See [steps.md](./steps.md).

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

- [/] Step 1: In progress is not supported
""",
    )
    failed = cli.fail("ralph", env=fake_ralph_env(project))
    assert "Unsupported Progress line: - [/] Step 1: In progress is not supported" in failed
    assert not (project / ".ralph").exists()
    assert not (project / "task.md").exists()
