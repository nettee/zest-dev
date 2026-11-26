import os
import shutil
import subprocess
from pathlib import Path

import pytest
import yaml

from helpers.paths import REPO_ROOT


EXPECTED_SKILLS = [
    "cli-code-workers",
    "t3-task",
    "zest-dev",
]
SKILL_SECTION_FILES = ["overview.md", "design.md", "plan.md", "implementation.md"]


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


def remove_if_exists(path: Path) -> None:
    if path.is_dir() and not path.is_symlink():
        shutil.rmtree(path)
    else:
        try:
            path.unlink()
        except FileNotFoundError:
            pass
