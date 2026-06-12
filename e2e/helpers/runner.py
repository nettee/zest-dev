import os
import subprocess
import sys
from pathlib import Path

from helpers.paths import E2E_ROOT


def run_pytest(env: dict[str, str] | None = None) -> int:
    test_env = os.environ.copy()
    if env:
        test_env.update(env)

    result = subprocess.run(
        [sys.executable, "-m", "pytest", "tests"],
        cwd=E2E_ROOT,
        env=test_env,
        text=True,
    )
    return result.returncode
