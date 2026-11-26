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
    assert "Do not stop at an intermediate status" in skill_content

    overview_guide = (zest_dev_dir / "overview.md").read_text(encoding="utf-8")
    assert "Overview content contract" in overview_guide
    assert "recommended next" not in overview_guide

    design_guide = (zest_dev_dir / "design.md").read_text(encoding="utf-8")
    assert "Research Findings" in design_guide
    assert "Design Decisions" in design_guide
    assert "Lightweight Design Approach" in design_guide
    assert "Grilling Design Approach" in design_guide
    assert "`grilling`" in design_guide
    assert "`domain-modeling`" in design_guide
    assert "resolve ambiguities that materially affect" in design_guide
    assert "one recommended design" in design_guide
    assert "Impact Areas:" in design_guide
    assert "Planned File Changes:" in design_guide
    assert "A source supports a premise" in design_guide
    assert "### E2E Acceptance Gate (EAG)" not in design_guide
    assert "EAG" not in design_guide
    assert "## Deferred Follow-Ups (DFU)" in design_guide

    plan_guide = (zest_dev_dir / "plan.md").read_text(encoding="utf-8")
    assert "`to-tickets`" in plan_guide
    assert "Do not create GitHub issues or external issue-tracker entries unless the user explicitly asks for that." in plan_guide
    assert "Do not use markdown checkboxes in `## Plan`." in plan_guide
    assert "tracer-bullet slices" in plan_guide
    assert "documentation alone is not HITL" in plan_guide
    assert "Add or update `spec.md` → `## Progress` with a thin progress checklist:" in plan_guide
    assert "EAG Validation" not in plan_guide
    assert "Documentation Sync" in plan_guide

    implementation_guide = (zest_dev_dir / "implementation.md").read_text(encoding="utf-8")
    assert "`tdd`" not in implementation_guide
    assert "tests relevant to changed behavior" in implementation_guide
    assert "end-to-end check" in implementation_guide
    assert "If required evidence, configuration, credentials, or a consequential Design decision is missing" in implementation_guide
    assert "Use `implementation.md` as the implementation-notes source of truth" in implementation_guide
    assert "information value rather than Plan-ticket symmetry" in implementation_guide
    assert "Record a material Deviation when it becomes known" in implementation_guide
    assert "reconcile it with the Design Decisions and Plan" in implementation_guide
    assert "text proof" in implementation_guide
    assert "`## Progress` checkbox as `[x]`" in implementation_guide
    assert "Design Phase" not in implementation_guide
    assert "EAG" not in implementation_guide

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
