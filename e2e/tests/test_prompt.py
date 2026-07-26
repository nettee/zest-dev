def test_cli_removes_general_prompt_generation(cli):
    failed = cli.fail("prompt", "lightweight")
    assert "unknown command 'prompt'" in failed


def test_init_deploys_design_approach_entrypoints(cli):
    cli.ok("init", "--local")
    commands_dir = cli.project_dir / ".opencode" / "commands"

    lightweight = (commands_dir / "zest-dev-lightweight.md").read_text(encoding="utf-8")
    assert "Lightweight Design Approach" in lightweight
    assert "Designed Status" in lightweight
    assert "$ARGUMENTS" in lightweight

    grilling = (commands_dir / "zest-dev-grilling.md").read_text(encoding="utf-8")
    assert "Grilling Design Approach" in grilling
    assert "Designed Status" in grilling
    assert "$ARGUMENTS" in grilling

    assert sorted(path.name for path in commands_dir.glob("zest-dev-*.md")) == [
        "zest-dev-grilling.md",
        "zest-dev-lightweight.md",
    ]
