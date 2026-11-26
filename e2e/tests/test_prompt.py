def test_cli_removes_general_prompt_generation(cli):
    failed = cli.fail("prompt", "lightweight")
    assert "unknown command 'prompt'" in failed


def test_cli_removes_ralph_command(cli):
    failed = cli.fail("ralph")
    assert "unknown command 'ralph'" in failed
