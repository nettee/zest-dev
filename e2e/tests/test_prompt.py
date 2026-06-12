def test_prompt_supports_actual_command_set(cli):
    quick = cli.ok("prompt", "quick-implement", "test feature")
    assert "complete Zest Dev workflow" in quick
    assert "test feature" in quick
    assert "explicit approval before entering Implementation" in quick

    plan = cli.ok("prompt", "plan")
    assert plan.strip() == "Follow the Zest Dev workflow to advance the active spec to planned, using this focus if relevant: ."

    invalid = cli.fail("prompt", "summarize")
    assert "Invalid command: summarize" in invalid


def test_prompt_implement_supports_incremental_phases(cli):
    prompt = cli.ok("prompt", "implement")
    assert prompt.strip() == "Follow the Zest Dev workflow to advance the active spec to implemented, using this focus if relevant: ."
    assert "**Step 1:" not in prompt
    assert "Treat this command as a request" not in prompt

    cli.ok("init", "--local")
    deployed = (cli.project_dir / ".opencode" / "commands" / "zest-dev-implement.md").read_text(encoding="utf-8")
    assert "Follow the Zest Dev workflow to advance the active spec to implemented, using this focus if relevant: $ARGUMENTS." in deployed
    assert "**Step 1:" not in deployed
    assert "Treat this command as a request" not in deployed
