import os
import shutil
import subprocess
from contextlib import contextmanager
from pathlib import Path

from helpers.paths import REPO_ROOT


PACKAGE_ENV_DIR = REPO_ROOT / "test-package-env"
NPM_CACHE_DIR = REPO_ROOT / ".npm"


def run_required(args: list[str], *, cwd: Path, env: dict[str, str] | None = None) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(
        args,
        cwd=cwd,
        env=env,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if result.returncode != 0:
        details = "\n".join(part for part in [result.stdout, result.stderr] if part).strip()
        raise RuntimeError(f"{' '.join(args)} failed in {cwd}{': ' + details if details else ''}")
    return result


@contextmanager
def packaged_cli_environment():
    env = os.environ.copy()
    env["npm_config_cache"] = str(NPM_CACHE_DIR)

    shutil.rmtree(PACKAGE_ENV_DIR, ignore_errors=True)
    NPM_CACHE_DIR.mkdir(parents=True, exist_ok=True)

    tarball_path: Path | None = None
    try:
        run_required(["npm", "pack"], cwd=REPO_ROOT, env=env)
        tarballs = sorted(REPO_ROOT.glob("zest-dev-*.tgz"))
        if not tarballs:
            raise RuntimeError("Package tarball not found after npm pack")
        tarball_path = tarballs[-1]

        PACKAGE_ENV_DIR.mkdir(parents=True, exist_ok=True)
        run_required(["npm", "init", "-y"], cwd=PACKAGE_ENV_DIR, env=env)
        run_required(["npm", "install", str(tarball_path)], cwd=PACKAGE_ENV_DIR, env=env)
        run_required(["npx", "zest-dev", "--version"], cwd=PACKAGE_ENV_DIR, env=env)

        yield {"ZEST_DEV_CLI_PATH": str(PACKAGE_ENV_DIR)}
    finally:
        cleanup_errors: list[str] = []
        try:
            shutil.rmtree(PACKAGE_ENV_DIR, ignore_errors=False)
        except FileNotFoundError:
            pass
        except OSError as error:
            cleanup_errors.append(f"failed to remove {PACKAGE_ENV_DIR}: {error}")

        if tarball_path and tarball_path.exists():
            try:
                tarball_path.unlink()
            except OSError as error:
                cleanup_errors.append(f"failed to remove {tarball_path}: {error}")

        if cleanup_errors:
            raise RuntimeError("; ".join(cleanup_errors))
