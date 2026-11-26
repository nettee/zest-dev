from pathlib import Path

from conftest import (
    EXPECTED_SKILLS,
    SKILL_SECTION_FILES,
    isolated_global_env,
)


def test_default_global_init_installs_all_packaged_skills(cli):
    env = isolated_global_env(cli.project_dir)
    fake_home = Path(env["HOME"])
    output = cli.yaml("init", env=env)

    assert output["ok"] is True
    assert output["skillsDir"] == str(fake_home / ".agents" / "skills")
    assert output["skills"] == [f"{name}/" for name in EXPECTED_SKILLS]
    assert "opencode" not in output
    assert "codex" not in output
    assert "scope" not in output
    assert "target" not in output
    assert not (cli.project_dir / ".opencode").exists()
    assert not (cli.project_dir / ".codex").exists()
    assert not (cli.project_dir / ".cursor").exists()
    assert not (cli.project_dir / "AGENTS.md").exists()
    assert not (Path(env["XDG_CONFIG_HOME"]) / "opencode").exists()
    assert not (fake_home / ".codex").exists()

    skills_dir = fake_home / ".agents" / "skills"
    assert skills_dir.exists()
    assert sorted(p.name for p in skills_dir.iterdir() if p.is_dir()) == EXPECTED_SKILLS

    source_root = cli.packaged_cli_root if cli.is_packaged else Path(__file__).resolve().parents[2]

    for skill_name in EXPECTED_SKILLS:
        skill_dir = skills_dir / skill_name
        assert (skill_dir / "SKILL.md").exists()
        source_skill = (source_root / "skills" / skill_name / "SKILL.md").read_text(encoding="utf-8")
        assert (skill_dir / "SKILL.md").read_text(encoding="utf-8") == source_skill

    zest_dev_dir = skills_dir / "zest-dev"
    for filename in SKILL_SECTION_FILES:
        assert (zest_dev_dir / filename).exists()
        expected = (source_root / "skills" / "zest-dev" / filename).read_text(encoding="utf-8")
        assert (zest_dev_dir / filename).read_text(encoding="utf-8") == expected

    skill_content = (zest_dev_dir / "SKILL.md").read_text(encoding="utf-8")
    assert "new → designed → planned → implemented" in skill_content
    assert "Statuses describe content maturity" in skill_content
    assert "Section Guide routing" in skill_content
    assert "Do not stop at an intermediate status" not in skill_content
    assert "Make reasonable reversible assumptions" in skill_content
    assert "grilling" not in skill_content
    assert "Lightweight Design Approach" not in skill_content

    overview_guide = (zest_dev_dir / "overview.md").read_text(encoding="utf-8")
    assert "Overview content contract" in overview_guide
    assert "Requirements content contract" in overview_guide
    assert "recommended next" not in overview_guide

    design_guide = (zest_dev_dir / "design.md").read_text(encoding="utf-8")
    assert "short Design" in design_guide or "Keep the Design section short" in design_guide
    assert "Do not create a separate `design.md` Design Record" in design_guide
    assert "Research Findings" not in design_guide
    assert "Design Decisions" not in design_guide
    assert "grilling" not in design_guide
    assert "Lightweight Design Approach" not in design_guide
    assert "## Deferred Follow-Ups (DFU)" not in design_guide
    assert "EAG" not in design_guide

    plan_guide = (zest_dev_dir / "plan.md").read_text(encoding="utf-8")
    assert "`to-tickets`" in plan_guide
    assert "Do not create GitHub issues or external issue-tracker entries unless the user explicitly asks for that." in plan_guide
    assert "Ticket format is flexible" in plan_guide
    assert "AFK/HITL" in plan_guide
    assert "Documentation Sync" in plan_guide
    assert "Strongly include" in plan_guide
    assert "EAG Validation" not in plan_guide

    implementation_guide = (zest_dev_dir / "implementation.md").read_text(encoding="utf-8")
    assert "`tdd`" not in implementation_guide
    assert "end-to-end check" in implementation_guide
    assert "text proof" in implementation_guide
    assert "## Verification" in implementation_guide
    assert "Keep `implementation.md` minimal" in implementation_guide
    assert "EAG" not in implementation_guide
    assert "Design Phase" not in implementation_guide

    assert (skills_dir / "t3-task" / "SKILL.md").exists()


def test_init_reruns_clean_only_removed_zest_dev_files(cli):
    env = isolated_global_env(cli.project_dir)
    cli.yaml("init", env=env)

    skill_dir = Path(env["HOME"]) / ".agents" / "skills" / "zest-dev"
    for legacy_name in ["new.md", "research.md", "implement.md"]:
        (skill_dir / legacy_name).write_text("# stale section guide", encoding="utf-8")
    (skill_dir / "my-notes.md").write_text("# user file", encoding="utf-8")

    output = cli.yaml("init", env=env)
    assert output["ok"] is True
    assert output["skills"] == [f"{name}/" for name in EXPECTED_SKILLS]

    for legacy_name in ["new.md", "research.md", "implement.md"]:
        assert not (skill_dir / legacy_name).exists()
    assert (skill_dir / "my-notes.md").exists()


def test_init_rejects_removed_flags(cli):
    env = isolated_global_env(cli.project_dir)
    for args in [("--local",), ("--global",), ("--target", "opencode"), ("--target", "codex")]:
        failed = cli.fail("init", *args, env=env)
        assert "unknown option" in failed.lower() or "unknown command" in failed.lower() or "error:" in failed.lower()
        assert not (Path(env["HOME"]) / ".agents" / "skills").exists()
        assert not (cli.project_dir / ".opencode").exists()
        assert not (cli.project_dir / ".codex").exists()


def test_init_failures_write_nothing(cli):
    relative_dir = cli.project_dir / "relative-env"
    relative_dir.mkdir()

    failed = cli.fail("init", cwd=relative_dir, env={"HOME": "relative-home", "USERPROFILE": ""})
    assert "HOME must be an absolute path: relative-home" in failed
    assert not (relative_dir / "relative-home").exists()

    failed = cli.fail("init", cwd=relative_dir, env={"HOME": "", "USERPROFILE": ""})
    assert "HOME is not set" in failed
