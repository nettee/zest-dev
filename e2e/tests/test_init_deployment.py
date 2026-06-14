from pathlib import Path

from conftest import (
    CODEX_SUBAGENTS,
    EXPECTED_COMMANDS,
    SKILL_PHASE_FILES,
    THIN_COMMANDS,
    assert_plugin_resource_symlink_at,
    frontmatter,
    isolated_global_env,
)


def test_plugin_resource_directories_are_compatibility_symlinks():
    repo_root = Path(__file__).resolve().parents[2]
    for name in ["commands", "skills", "agents"]:
        assert_plugin_resource_symlink_at(repo_root, name)


def test_packaged_plugin_resource_directories_are_compatibility_symlinks(cli):
    if not cli.is_packaged:
        import pytest

        pytest.skip("packaged CLI root is only available in package E2E runs")

    for name in ["commands", "skills", "agents"]:
        assert_plugin_resource_symlink_at(cli.packaged_cli_root, name)


def test_default_global_init_deploys_expected_artifacts(cli):
    env = isolated_global_env(cli.project_dir)
    fake_home = Path(env["HOME"])
    fake_xdg = Path(env["XDG_CONFIG_HOME"])
    global_open_code = fake_xdg / "opencode"
    output = cli.yaml("init", env=env)

    assert output["ok"] is True
    assert output["scope"] == "global"
    assert output["target"] == "all"
    assert "cursor" not in output
    assert output["opencode"]["baseDir"] == str(global_open_code)
    assert output["codex"]["baseDir"] == str(fake_home)
    assert output["codex"]["commands"] == []
    assert output["opencode"]["agents"] == []
    assert output["opencode"]["commands"] == EXPECTED_COMMANDS
    assert output["codex"]["agents"] == CODEX_SUBAGENTS

    commands_dir = global_open_code / "commands"
    skills_dir = global_open_code / "skills"
    codex_skill_dir = fake_home / ".agents" / "skills" / "zest-dev"
    codex_agents_dir = fake_home / ".codex" / "agents"
    assert commands_dir.exists()
    assert skills_dir.exists()
    assert codex_skill_dir.exists()
    assert codex_agents_dir.exists()
    assert not (cli.project_dir / ".cursor").exists()
    assert not (cli.project_dir / "AGENTS.md").exists()

    for filename in EXPECTED_COMMANDS:
        assert (commands_dir / filename).exists()

    assert sorted(p.name for p in codex_agents_dir.iterdir()) == CODEX_SUBAGENTS
    assert not (codex_skill_dir / "commands").exists()

    for filename in EXPECTED_COMMANDS:
        assert (commands_dir / filename).read_text(encoding="utf-8").startswith("---\n")

    new_command = commands_dir / "zest-dev-new.md"
    metadata = frontmatter(new_command.read_text(encoding="utf-8"), "zest-dev-new.md")
    assert metadata.get("description")
    assert "argument-hint" not in metadata
    assert "allowed-tools" not in metadata
    assert list(metadata) == ["description"]

    for filename in [
        "zest-dev-new.md",
        "zest-dev-research.md",
        "zest-dev-design.md",
        "zest-dev-plan.md",
        "zest-dev-implement.md",
    ]:
        assert "$ARGUMENTS" in (commands_dir / filename).read_text(encoding="utf-8")

    for filename in THIN_COMMANDS:
        assert "**Step 1:" not in (commands_dir / filename).read_text(encoding="utf-8")

    skill_content = (skills_dir / "zest-dev" / "SKILL.md").read_text(encoding="utf-8")
    assert "This skill defines the workflow for planned feature work" in skill_content
    assert "always include a final Documentation Sync step" in skill_content
    for filename in SKILL_PHASE_FILES:
        assert (skills_dir / "zest-dev" / filename).exists()

    research_phase = (skills_dir / "zest-dev" / "research.md").read_text(encoding="utf-8")
    assert "Summarize your understanding of the request and confirm it with the user" in research_phase

    design_phase = (skills_dir / "zest-dev" / "design.md").read_text(encoding="utf-8")
    assert "If the status is `designed`, `planned`, or `implemented`, confirm that the user wants to revise the existing design before continuing." in design_phase
    assert "Fill the Design Section:" in design_phase
    assert "### E2E Acceptance Gate (EAG)" in design_phase
    assert "The EAG is the Design Section's automated end-to-end acceptance gate, not a general test plan." in design_phase
    assert "`### E2E Acceptance Gate (EAG)`" in design_phase
    assert "small, preferably single, reviewer-facing handle" in design_phase
    assert "If no automated end-to-end gate exists, state that there is no EAG." in design_phase
    assert "## Deferred Follow-Ups (DFU)" in design_phase
    assert "write `None.` when the Design defers no follow-up work" in design_phase

    plan_phase = (skills_dir / "zest-dev" / "plan.md").read_text(encoding="utf-8")
    assert "If the spec started as `designed`, run `zest-dev update active planned`." in plan_phase
    assert "Use the slicing spirit of Matt Pocock's registered `to-issues` skill as a reference for scale and sequencing." in plan_phase
    assert "Do not create GitHub issues or external issue-tracker entries unless the user explicitly asks for that." in plan_phase
    assert "Do not use markdown checkboxes in `## Plan`." in plan_phase
    assert "Add or update `spec.md` → `## Progress` with a thin progress checklist:" in plan_phase
    assert "### Step 3: Documentation Sync" in plan_phase
    assert "Report every Plan step's `Type` as `AFK` or `HITL`." in plan_phase
    assert "For each `HITL` step, tell the user what needs to be discussed, reviewed, judged, or approved in conversation before implementation continues." in plan_phase

    implement_phase = (skills_dir / "zest-dev" / "implement.md").read_text(encoding="utf-8")
    assert "try to use the registered `tdd` skill" in implement_phase
    assert "judge applicability from the spec, plan step, and files being changed" in implement_phase
    assert "mark the corresponding `spec.md` → `## Progress` checkbox as `[x]`" in implement_phase
    assert "DFU is fixed during the Design Phase" in implement_phase
    assert "mark the corresponding `## Plan` checkbox" not in implement_phase

    codex_skill = (codex_skill_dir / "SKILL.md").read_text(encoding="utf-8")
    assert "This skill defines the workflow for planned feature work" in codex_skill
    for subagent in CODEX_SUBAGENTS:
        content = (codex_agents_dir / subagent).read_text(encoding="utf-8")
        assert "name = " in content
        assert "developer_instructions = " in content


def test_global_init_reruns_clean_only_managed_files(cli):
    env = isolated_global_env(cli.project_dir)
    cli.yaml("init", env=env)
    global_open_code = Path(env["XDG_CONFIG_HOME"]) / "opencode"

    explicit = cli.yaml("init", "--global", env=env)
    assert explicit["scope"] == "global"
    assert explicit["target"] == "all"
    assert sorted(p.name for p in (global_open_code / "commands").iterdir()) == EXPECTED_COMMANDS

    agents_dir = global_open_code / "agents"
    nested_dir = agents_dir / "nested-dir"
    nested_dir.mkdir(parents=True, exist_ok=True)
    stale_legacy = agents_dir / "code-explorer.md"
    user_agent = agents_dir / "my-custom-agent.md"
    stale_legacy.write_text("# stale legacy agent", encoding="utf-8")
    user_agent.write_text("# user agent", encoding="utf-8")

    assert cli.yaml("init", env=env)["ok"] is True
    assert not stale_legacy.exists()
    assert user_agent.exists()
    assert agents_dir.exists()
    assert nested_dir.exists()

    commands_dir = global_open_code / "commands"
    stale_managed = commands_dir / "zest-dev-archive.md"
    user_command = commands_dir / "my-command.md"
    stale_managed.write_text("# stale managed command", encoding="utf-8")
    user_command.write_text("# user command", encoding="utf-8")

    assert cli.yaml("init", env=env)["ok"] is True
    assert not stale_managed.exists()
    assert user_command.exists()
    assert sorted(p.name for p in commands_dir.iterdir()) == sorted([*EXPECTED_COMMANDS, "my-command.md"])
    user_command.unlink()

    assert cli.yaml("init", env=env)["ok"] is True
    assert len(list((global_open_code / "commands").iterdir())) == len(EXPECTED_COMMANDS)
    assert sorted(p.name for p in (Path(env["HOME"]) / ".codex" / "agents").iterdir()) == CODEX_SUBAGENTS


def test_local_and_target_specific_init_layouts(cli):
    env = isolated_global_env(cli.project_dir / "global-env")
    local_output = cli.yaml("init", "--local", env=env)
    assert local_output["scope"] == "local"
    assert local_output["target"] == "opencode"
    assert local_output["opencode"]["baseDir"] == str(cli.project_dir)
    assert local_output["codex"]["baseDir"] == str(cli.project_dir)
    assert (cli.project_dir / ".opencode" / "commands").exists()
    assert (cli.project_dir / ".opencode" / "skills").exists()
    assert not (cli.project_dir / ".agents" / "skills" / "zest-dev").exists()
    assert not (cli.project_dir / ".codex" / "agents").exists()

    codex_output = cli.yaml("init", "--local", "--target", "codex", env=env)
    assert codex_output["scope"] == "local"
    assert codex_output["target"] == "codex"
    assert codex_output["opencode"]["commands"] == []
    assert (cli.project_dir / ".agents" / "skills" / "zest-dev").exists()
    assert (cli.project_dir / ".codex" / "agents").exists()
    assert sorted(p.name for p in (cli.project_dir / ".codex" / "agents").iterdir()) == CODEX_SUBAGENTS
    assert not (cli.project_dir / ".agents" / "skills" / "zest-dev" / "commands").exists()

    legacy_commands = cli.project_dir / ".agents" / "skills" / "zest-dev" / "commands"
    legacy_commands.mkdir(parents=True, exist_ok=True)
    legacy_zest = legacy_commands / "zest-dev-new.md"
    user_command = legacy_commands / "my-command.md"
    legacy_zest.write_text("# legacy zest command", encoding="utf-8")
    user_command.write_text("# user command", encoding="utf-8")
    assert cli.yaml("init", "--local", "--target", "codex", env=env)["ok"] is True
    assert not legacy_zest.exists()
    assert user_command.exists()

    local_all_dir = cli.project_dir / "local-all"
    local_all_dir.mkdir()
    local_all_env = isolated_global_env(local_all_dir)
    local_all = cli.yaml("init", "--local", "--target", "all", cwd=local_all_dir, env=local_all_env)
    assert local_all["scope"] == "local"
    assert local_all["target"] == "all"
    assert (local_all_dir / ".opencode" / "commands").exists()
    assert (local_all_dir / ".opencode" / "skills").exists()
    assert (local_all_dir / ".agents" / "skills" / "zest-dev").exists()
    assert (local_all_dir / ".codex" / "agents").exists()
    assert not (local_all_dir / ".agents" / "skills" / "zest-dev" / "commands").exists()

    opencode_only = cli.project_dir / "opencode-only"
    opencode_only.mkdir()
    opencode_env = isolated_global_env(opencode_only)
    opencode_result = cli.yaml("init", "--target", "opencode", cwd=opencode_only, env=opencode_env)
    assert opencode_result["target"] == "opencode"
    assert opencode_result["codex"]["baseDir"] is None
    assert (Path(opencode_env["XDG_CONFIG_HOME"]) / "opencode" / "commands").exists()
    assert not (Path(opencode_env["HOME"]) / ".codex" / "agents").exists()

    codex_only = cli.project_dir / "codex-only"
    codex_only.mkdir()
    codex_env = isolated_global_env(codex_only)
    codex_result = cli.yaml("init", "--target", "codex", cwd=codex_only, env=codex_env)
    assert codex_result["target"] == "codex"
    assert codex_result["opencode"]["baseDir"] is None
    assert (Path(codex_env["HOME"]) / ".codex" / "agents").exists()
    assert not (Path(codex_env["XDG_CONFIG_HOME"]) / "opencode" / "commands").exists()

    no_home_dir = cli.project_dir / "opencode-without-home"
    no_home_dir.mkdir()
    no_home_env = {"HOME": "", "XDG_CONFIG_HOME": str(no_home_dir / "xdg-config")}
    no_home = cli.yaml("init", "--target", "opencode", cwd=no_home_dir, env=no_home_env)
    assert no_home["target"] == "opencode"
    assert (Path(no_home_env["XDG_CONFIG_HOME"]) / "opencode" / "commands").exists()

    relative_xdg_dir = cli.project_dir / "codex-with-relative-xdg"
    relative_xdg_dir.mkdir()
    relative_env = {"HOME": str(relative_xdg_dir / "home"), "XDG_CONFIG_HOME": "relative-config"}
    Path(relative_env["HOME"]).mkdir()
    relative_result = cli.yaml("init", "--target", "codex", cwd=relative_xdg_dir, env=relative_env)
    assert relative_result["target"] == "codex"
    assert (Path(relative_env["HOME"]) / ".codex" / "agents").exists()
    assert not (relative_xdg_dir / "relative-config").exists()


def test_init_failures_write_nothing(cli):
    invalid_dir = cli.project_dir / "invalid-target"
    invalid_dir.mkdir()
    invalid_env = isolated_global_env(invalid_dir)
    failed = cli.fail("init", "--target", "invalid", cwd=invalid_dir, env=invalid_env)
    assert "Invalid target: invalid. Expected one of: all, opencode, codex" in failed
    assert not (Path(invalid_env["XDG_CONFIG_HOME"]) / "opencode").exists()
    assert not (Path(invalid_env["HOME"]) / ".codex").exists()

    conflicting_dir = cli.project_dir / "conflicting-scope"
    conflicting_dir.mkdir()
    conflicting_env = isolated_global_env(conflicting_dir)
    failed = cli.fail("init", "--global", "--local", cwd=conflicting_dir, env=conflicting_env)
    assert "Cannot specify both --global and --local" in failed
    assert not (conflicting_dir / ".opencode").exists()
    assert not (Path(conflicting_env["XDG_CONFIG_HOME"]) / "opencode").exists()

    relative_dir = cli.project_dir / "relative-env"
    relative_dir.mkdir()
    failed = cli.fail("init", cwd=relative_dir, env={"HOME": str(relative_dir / "home"), "XDG_CONFIG_HOME": "relative-config"})
    assert "XDG_CONFIG_HOME must be an absolute path: relative-config" in failed
    assert not (relative_dir / "relative-config").exists()

    failed = cli.fail("init", cwd=relative_dir, env={"HOME": "relative-home", "XDG_CONFIG_HOME": ""})
    assert "HOME must be an absolute path: relative-home" in failed
    assert not (relative_dir / "relative-home").exists()
