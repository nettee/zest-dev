import json
import os
import shutil
import stat
import subprocess
from pathlib import Path

import pytest
import yaml

from helpers.paths import REPO_ROOT


EXPECTED_COMMANDS = [
    "zest-dev-grilling.md",
    "zest-dev-lightweight.md",
]
THIN_COMMANDS = EXPECTED_COMMANDS
SKILL_SECTION_FILES = ["overview.md", "design.md", "plan.md", "implementation.md"]
CODEX_SUBAGENTS = ["code-architect.toml", "code-explorer.toml", "code-reviewer.toml"]
FINAL_RALPH_TASK = (
    "Make sure all tasks are done in ralph loops, and then create PR. "
    "If there is a related issue, make sure to link it in the PR."
)
DFU_RALPH_TASK = (
    "If the spec has Deferred Follow-Ups (DFU), create one GitHub issue "
    "for each DFU item and link those issues in the PR."
)
RALPH_TASK_PROMPT = "Use the `zest-dev` skill to implement the active planned Spec.\n"


class Cli:
    def __init__(self, project_dir: Path):
        self.project_dir = project_dir
        package_root = os.environ.get("ZEST_DEV_CLI_PATH")
        if package_root:
            binary = "zest-dev.cmd" if os.name == "nt" else "zest-dev"
            self.command = [str(Path(package_root) / "node_modules" / ".bin" / binary)]
        else:
            self.command = ["node", str(REPO_ROOT / "bin" / "zest-dev.js")]

    @property
    def is_packaged(self) -> bool:
        return "ZEST_DEV_CLI_PATH" in os.environ

    @property
    def packaged_cli_root(self) -> Path | None:
        if not self.is_packaged:
            return None
        cli_bin = Path(self.command[0]).resolve()
        return cli_bin.parent.parent

    def run(self, *args: str, cwd: Path | None = None, env: dict[str, str] | None = None) -> subprocess.CompletedProcess[str]:
        run_env = os.environ.copy()
        if env:
            run_env.update(env)
        return subprocess.run(
            [*self.command, *args],
            cwd=cwd or self.project_dir,
            env=run_env,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

    def ok(self, *args: str, cwd: Path | None = None, env: dict[str, str] | None = None) -> str:
        result = self.run(*args, cwd=cwd, env=env)
        if result.returncode != 0:
            details = "\n".join(part for part in [result.stdout, result.stderr] if part).strip()
            raise AssertionError(f"zest-dev {' '.join(args)} failed:\n{details}")
        return result.stdout

    def fail(self, *args: str, cwd: Path | None = None, env: dict[str, str] | None = None) -> str:
        result = self.run(*args, cwd=cwd, env=env)
        assert result.returncode != 0, f"zest-dev {' '.join(args)} unexpectedly succeeded"
        return "\n".join(part for part in [result.stdout, result.stderr] if part)

    def yaml(self, *args: str, cwd: Path | None = None, env: dict[str, str] | None = None):
        return yaml.safe_load(self.ok(*args, cwd=cwd, env=env))


@pytest.fixture
def project(tmp_path: Path) -> Path:
    return tmp_path / "test-project"


@pytest.fixture
def cli(project: Path) -> Cli:
    project.mkdir(parents=True, exist_ok=True)
    return Cli(project)


def isolated_global_env(base_dir: Path) -> dict[str, str]:
    home = base_dir / "fake-home"
    xdg = base_dir / "fake-xdg-config"
    home.mkdir(parents=True, exist_ok=True)
    xdg.mkdir(parents=True, exist_ok=True)
    return {"HOME": str(home), "XDG_CONFIG_HOME": str(xdg)}


def frontmatter(content: str, filename: str) -> dict:
    assert content.startswith("---\n"), f"{filename} has no frontmatter"
    _, metadata, _ = content.split("---\n", 2)
    parsed = yaml.safe_load(metadata)
    assert isinstance(parsed, dict), f"{filename} frontmatter should be an object"
    return parsed


def assert_plugin_resource_symlink_at(root_dir: Path, name: str) -> None:
    plugin_path = root_dir / "plugin" / name
    top_level_path = root_dir / name
    assert plugin_path.is_symlink(), f"plugin/{name} should be a symlink"
    assert plugin_path.resolve() == top_level_path.resolve()


def create_dangling_active_symlink(project_dir: Path, target_id: str) -> None:
    active_link = project_dir / "specs" / "change" / "active"
    try:
        active_link.unlink()
    except FileNotFoundError:
        pass
    active_link.symlink_to(target_id)


def create_active_spec_with_body(cli: Cli, slug: str, body: str) -> tuple[str, Path]:
    result = cli.yaml("create", slug)
    spec_path = cli.project_dir / result["spec"]["path"]
    spec_path.write_text(body, encoding="utf-8")
    cli.ok("set-active", result["spec"]["id"])
    return result["spec"]["id"], spec_path


def fake_ralph_env(project_dir: Path) -> dict[str, str]:
    fake_bin = project_dir / "fake-bin"
    log_path = project_dir / "ralph-args.log"
    fake_bin.mkdir(parents=True, exist_ok=True)
    fake_ralph = fake_bin / "ralph"
    fake_ralph.write_text(
        """#!/usr/bin/env python3
import json
import os
import pathlib
import sys

if sys.argv[1:] == ["--add-task"] or len(sys.argv) != 3 or sys.argv[1] != "--add-task":
    print("unexpected ralph args: " + " ".join(sys.argv[1:]), file=sys.stderr)
    raise SystemExit(2)

pathlib.Path(os.environ["RALPH_LOG_PATH"]).open("a", encoding="utf-8").write(json.dumps(sys.argv[2]) + "\\n")
pathlib.Path(".ralph").mkdir(exist_ok=True)
pathlib.Path(".ralph/ralph-tasks.md").open("a", encoding="utf-8").write("- [ ] " + sys.argv[2] + "\\n")
print("Added task: " + sys.argv[2])
""",
        encoding="utf-8",
    )
    fake_ralph.chmod(fake_ralph.stat().st_mode | stat.S_IXUSR)
    return {
        "PATH": f"{fake_bin}{os.pathsep}{os.environ['PATH']}",
        "RALPH_LOG_PATH": str(log_path),
    }


def read_fake_ralph_tasks(project_dir: Path) -> list[str]:
    log_path = project_dir / "ralph-args.log"
    return [json.loads(line) for line in log_path.read_text(encoding="utf-8").splitlines() if line]


def remove_if_exists(path: Path) -> None:
    if path.is_dir() and not path.is_symlink():
        shutil.rmtree(path)
    else:
        try:
            path.unlink()
        except FileNotFoundError:
            pass
