def test_prompt_supports_actual_command_set(cli):
    plan = cli.ok("prompt", "plan")
    assert plan.strip() == "Follow the Zest Dev workflow to advance the active spec to planned, using this focus if relevant: ."

    invalid = cli.fail("prompt", "summarize")
    assert "Invalid command: summarize" in invalid

    for removed in ["quick-implement", "compound"]:
        invalid = cli.fail("prompt", removed)
        assert f"Invalid command: {removed}" in invalid


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
