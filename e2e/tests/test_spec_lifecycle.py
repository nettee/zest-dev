import re
from pathlib import Path

import yaml

from conftest import create_dangling_active_symlink, frontmatter, isolated_global_env


def test_create_uses_builtin_split_templates(cli):
    result = cli.yaml("create", "default-template")
    assert result["ok"] is True
    spec_id = result["spec"]["id"]
    assert re.match(r"^\d{8}-default-template$", spec_id)

    spec_dir = cli.project_dir / "specs" / "change" / spec_id
    spec_path = spec_dir / "spec.md"
    design_path = spec_dir / "design.md"
    implementation_path = spec_dir / "implementation.md"
    assert spec_path.exists()
    assert design_path.exists()
    assert implementation_path.exists()

    content = spec_path.read_text(encoding="utf-8")
    design = design_path.read_text(encoding="utf-8")
    implementation = implementation_path.read_text(encoding="utf-8")
    metadata = frontmatter(content, f"specs/change/{spec_id}/spec.md")

    assert re.match(r"^\d{8}-default-template$", metadata["id"])
    assert metadata["name"] == "Default Template"
    assert metadata["status"] == "new"
    assert isinstance(metadata["created"], str)
    assert "## Overview" in content
    assert "## Research" in content
    assert "See [design.md](./design.md)." in content
    assert "## Design" in content
    assert "### Design Summary" in content
    assert "### Design Summary\n\n<!-- Overall design approach and rationale. -->\n\nSee [design.md](./design.md) for design detail." in content
    assert "### E2E Acceptance Gate (EAG)" in content
    assert "Automated end-to-end acceptance behavior and verification path, or state that there is no EAG." in content
    assert "## Plan" in content
    assert "## Progress" in content
    assert "## Implementation" in content
    assert "See [implementation.md](./implementation.md)." in content
    assert "## Deferred Follow-Ups (DFU)" in content
    assert "Follow-up items deferred out of this Spec during Design only when the user explicitly wants them handled later or confirms a discovered functional gap, or None." in content
    assert "Optional completion checklist, created during Plan and updated during Implement." not in content
    assert "Optional implementation step breakdown, created during Plan." in content
    assert "Use markdown checkboxes for all step and substep items" not in content
    assert "Substep 1.1 Implement" not in content
    assert "## Notes" not in content
    assert "## Research" in design
    assert "## Design Detail" in design
    assert "## Design\n" not in design
    assert "# Implementation" in implementation
    assert "## Outcome" in implementation
    assert "## Deviations" in implementation
    assert "Current behavior, Deviation, Attention, and Evidence" in implementation
    assert "## Verification" in implementation
    assert "## Spec Retrospective" in implementation
    assert "High-signal implementation notes" in implementation
    assert "## Step 1" not in implementation
    assert "Phase 3: Test and verify" not in content
    assert "{name}" not in content
    assert "{date}" not in content
    assert "{name}" not in design
    assert "{date}" not in implementation


def test_create_ignores_custom_template_override(cli):
    custom_template = cli.project_dir / ".zest-dev" / "template" / "spec.md"
    custom_template.parent.mkdir(parents=True, exist_ok=True)
    custom_template.write_text(
        """---
name: "{name}"
status: custom
created: "{date}"
---

# Custom Spec

Token: {name}|{date}
""",
        encoding="utf-8",
    )

    result = cli.yaml("create", "custom-template")
    spec_id = result["spec"]["id"]
    assert re.match(r"^\d{8}-custom-template$", spec_id)
    spec_dir = cli.project_dir / "specs" / "change" / spec_id
    content = (spec_dir / "spec.md").read_text(encoding="utf-8")
    metadata = frontmatter(content, f"specs/change/{spec_id}/spec.md")

    assert re.match(r"^\d{8}-custom-template$", metadata["id"])
    assert metadata["name"] == "Custom Template"
    assert metadata["status"] == "new"
    assert "# Custom Spec" not in content
    assert "## Overview" in content
    assert "{name}" not in content
    assert "{date}" not in content
    assert "Token: Custom Template|" not in content
    assert (spec_dir / "design.md").exists()
    assert (spec_dir / "implementation.md").exists()


def test_status_active_and_legacy_spec_behavior(cli):
    env = isolated_global_env(cli.project_dir / "status-env")
    cli.ok("create", "first-spec")
    cli.ok("create", "second-spec")

    status = cli.yaml("status", env=env)
    assert status["specs_count"] == 2
    assert status["active_change"] is None
    assert "agent_hints" not in status

    specs = [p.name for p in (cli.project_dir / "specs" / "change").iterdir() if re.match(r"^\d{8}-", p.name)]
    second = next(name for name in specs if name.endswith("-second-spec"))
    cli.ok("set-active", second)
    status = cli.yaml("status", env=env)
    assert status["specs_count"] == 2
    assert status["active_change"] == {
        "id": second,
        "name": "Second Spec",
        "path": f"specs/change/{second}/spec.md",
        "status": "new",
    }
    assert "agent_hints" not in status
    assert (cli.project_dir / "specs" / "change" / second / "design.md").exists()
    assert (cli.project_dir / "specs" / "change" / second / "implementation.md").exists()

    legacy_id = "20240101-legacy-spec"
    legacy_dir = cli.project_dir / "specs" / "change" / legacy_id
    legacy_dir.mkdir(parents=True)
    legacy_readme = legacy_dir / "README.md"
    legacy_readme.write_text(
        f"""---
id: "{legacy_id}"
name: "Legacy Spec"
status: designed
created: "2024-01-01"
---

## Overview
""",
        encoding="utf-8",
    )
    cli.ok("set-active", legacy_id)
    status = cli.yaml("status")
    assert status["specs_count"] == 3
    assert status["active_change"]["id"] == legacy_id
    assert status["active_change"]["path"] == f"specs/change/{legacy_id}/README.md"
    assert status["active_change"]["status"] == "designed"
    update = cli.yaml("update", legacy_id, "implemented")
    assert update["ok"] is True
    assert update["status"]["from"] == "designed"
    assert update["status"]["to"] == "implemented"
    assert frontmatter(legacy_readme.read_text(encoding="utf-8"), "legacy README")["status"] == "implemented"

    import shutil

    shutil.rmtree(legacy_dir)

    create_dangling_active_symlink(cli.project_dir, "19990101-removed-spec")
    status = cli.yaml("status")
    assert status["active_change"] == {
        "id": "19990101-removed-spec",
        "name": None,
        "path": None,
        "status": None,
    }

    first = next(name for name in specs if name.endswith("-first-spec"))
    create_dangling_active_symlink(cli.project_dir, "19990101-removed-spec")
    cli.ok("set-active", first)
    assert cli.yaml("status")["active_change"]["id"] == first

    active_link = cli.project_dir / "specs" / "change" / "active"
    create_dangling_active_symlink(cli.project_dir, "19990101-removed-spec")
    result = cli.yaml("unset-active")
    assert result["ok"] is True
    assert result["active_change"] is None
    assert not active_link.exists()


def test_status_agent_hints(cli):
    status_env = isolated_global_env(cli.project_dir / "status-env")
    cli.ok("create", "first-spec")
    cli.ok("create", "second-spec")

    cursor_commands = cli.project_dir / ".cursor" / "commands"
    cursor_commands.mkdir(parents=True)
    (cursor_commands / "zest-dev-new.md").write_text("# test", encoding="utf-8")
    update_hint = "Run `zest-dev init` to update deployed commands and skills."
    assert cli.yaml("status", env=status_env)["agent_hints"] == [update_hint]

    global_env = isolated_global_env(cli.project_dir / "global-hint-env")
    (cursor_commands / "zest-dev-new.md").unlink()
    global_commands = Path(global_env["XDG_CONFIG_HOME"]) / "opencode" / "commands"
    global_commands.mkdir(parents=True)
    (global_commands / "zest-dev-new.md").write_text("# test", encoding="utf-8")
    assert cli.yaml("status", env=global_env)["agent_hints"] == [update_hint]

    status = cli.yaml("status", env={"HOME": "", "XDG_CONFIG_HOME": "relative-config"})
    assert status["specs_count"] == 2

    other_commands = cli.project_dir / ".opencode" / "commands"
    other_commands.mkdir(parents=True)
    (other_commands / "pr.md").write_text("# unrelated", encoding="utf-8")
    (global_commands / "zest-dev-new.md").unlink()
    assert "agent_hints" not in cli.yaml("status", env=status_env)

    local_codex_skill = cli.project_dir / ".agents" / "skills" / "zest-dev"
    local_codex_skill.mkdir(parents=True)
    (local_codex_skill / "SKILL.md").write_text("# deployed skill", encoding="utf-8")
    assert cli.yaml("status", env=status_env)["agent_hints"] == [update_hint]


def test_update_and_active_alias(cli):
    first = cli.yaml("create", "first-spec")["spec"]["id"]

    result = cli.yaml("update", first, "researched")
    assert result["ok"] is True
    assert result["spec"]["status"] == "researched"
    assert result["status"] == {"from": "new", "to": "researched", "changed": True}
    assert cli.yaml("show", first)["status"] == "researched"

    result = cli.yaml("update", first, "implemented")
    assert result["ok"] is True
    assert result["spec"]["status"] == "implemented"
    assert result["status"]["from"] == "researched"
    assert result["status"]["to"] == "implemented"

    assert 'Status is already "implemented" for spec' in cli.fail("update", first, "implemented")
    assert "Invalid transition implemented -> designed" in cli.fail("update", first, "designed")
    assert 'Invalid status "ready". Valid: new, researched, designed, planned, implemented' in cli.fail("update", first, "ready")

    alias = cli.yaml("create", "alias-spec")["spec"]["id"]
    cli.ok("set-active", alias)
    assert cli.yaml("show", "active")["id"] == alias
    update = cli.yaml("update", "active", "implemented")
    assert update["spec"]["id"] == alias
    assert update["spec"]["status"] == "implemented"

    planned = cli.yaml("create", "planned-spec")["spec"]["id"]
    planned_result = cli.yaml("update", planned, "planned")
    assert planned_result["spec"]["status"] == "planned"
    assert planned_result["status"]["from"] == "new"
    assert planned_result["status"]["to"] == "planned"
    implemented = cli.yaml("update", planned, "implemented")
    assert implemented["status"]["from"] == "planned"
    assert implemented["status"]["to"] == "implemented"


def test_spec_commands_accept_path_identifiers(cli):
    spec_id = cli.yaml("create", "path-identifier")["spec"]["id"]
    spec_dir = f"specs/change/{spec_id}"
    spec_file = f"{spec_dir}/spec.md"

    assert cli.yaml("show", spec_dir)["id"] == spec_id
    assert cli.yaml("show", f"{spec_dir}/")["id"] == spec_id
    assert cli.yaml("show", spec_file)["id"] == spec_id

    cli.ok("set-active", spec_dir)
    assert cli.yaml("show", "active")["id"] == spec_id

    update = cli.yaml("update", spec_file, "researched")
    assert update["spec"]["id"] == spec_id
    assert update["spec"]["status"] == "researched"
