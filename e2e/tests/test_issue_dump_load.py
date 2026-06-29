import json
import os
import stat
from pathlib import Path

import yaml


def markdown_files(spec_dir: Path) -> dict[str, str]:
    return {
        str(path.relative_to(spec_dir)): path.read_text(encoding="utf-8")
        for path in sorted(spec_dir.rglob("*.md"))
    }


def test_dump_dry_run_and_load_from_file_round_trip_markdown_files(cli):
    created = cli.yaml("create", "dump-load-source")["spec"]
    source_id = created["id"]
    source_dir = cli.project_dir / "specs" / "change" / source_id
    (source_dir / "notes").mkdir()
    (source_dir / "notes" / "review.md").write_text("# Review\n\nNested notes.\n", encoding="utf-8")
    cli.ok("set-active", source_id)

    dumped = cli.yaml("dump", "active", "--dry-run")
    assert dumped["ok"] is True
    issue = dumped["issue"]
    assert issue["title"] == f"[archive] {source_id}"
    assert issue["labels"] == ["spec:change", "archive"]
    assert issue["body"].startswith("<!--\nzest-dev-issue-spec: 1\n")
    assert len(issue["comments"]) == 3

    source_files = markdown_files(source_dir)
    source_dir.rename(source_dir.with_name(f"{source_id}.source"))
    (cli.project_dir / "specs" / "change" / "active").unlink()

    dump_path = cli.project_dir / "dump.yml"
    dump_path.write_text(yaml.safe_dump(issue, sort_keys=False), encoding="utf-8")
    loaded = cli.yaml("load", "--from-file", str(dump_path))

    assert loaded["ok"] is True
    assert loaded["spec"]["id"] == source_id
    assert loaded["spec"]["path"] == f"specs/change/{source_id}/spec.md"
    assert loaded["source"]["type"] == "file"
    assert not (cli.project_dir / "specs" / "change" / "active").exists()
    assert markdown_files(cli.project_dir / "specs" / "change" / source_id) == source_files


def test_dump_and_load_round_trip_yaml_sensitive_markdown_paths(cli):
    created = cli.yaml("create", "yaml-sensitive-paths")["spec"]
    source_id = created["id"]
    source_dir = cli.project_dir / "specs" / "change" / source_id
    (source_dir / "notes").mkdir()
    (source_dir / "notes" / "a: b.md").write_text("# Colon\n", encoding="utf-8")
    (source_dir / "notes" / "foo #bar.md").write_text("# Hash\n", encoding="utf-8")

    dumped = cli.yaml("dump", f"specs/change/{source_id}", "--dry-run")
    assert any("path: 'notes/a: b.md'" in comment for comment in dumped["issue"]["comments"])
    assert any("path: 'notes/foo #bar.md'" in comment for comment in dumped["issue"]["comments"])

    source_files = markdown_files(source_dir)
    source_dir.rename(source_dir.with_name(f"{source_id}.source"))

    dump_path = cli.project_dir / "yaml-sensitive.yml"
    dump_path.write_text(yaml.safe_dump(dumped["issue"], sort_keys=False), encoding="utf-8")
    loaded = cli.yaml("load", "--from-file", str(dump_path))

    assert loaded["ok"] is True
    assert markdown_files(cli.project_dir / "specs" / "change" / source_id) == source_files


def test_dump_and_load_fail_fast_for_invalid_local_protocol(cli):
    created = cli.yaml("create", "invalid-dump-source")["spec"]
    spec_dir = cli.project_dir / "specs" / "change" / created["id"]
    (spec_dir / "asset.txt").write_text("not markdown\n", encoding="utf-8")
    assert "Non-Markdown file in Spec directory: asset.txt" in cli.fail("dump", created["id"], "--dry-run")

    (spec_dir / "asset.txt").unlink()
    (spec_dir / "spec.md").unlink()
    assert "Issue Spec Representation requires spec.md" in cli.fail("dump", created["id"], "--dry-run")

    cases = {
        "missing-header.yml": {"body": "# Missing\n", "comments": []},
        "invalid-spec-id.yml": {
            "body": "<!--\nzest-dev-issue-spec: 1\nspec-id: nope\npath: spec.md\n-->\n# Body\n",
            "comments": [],
        },
        "mismatched-comment.yml": {
            "body": "<!--\nzest-dev-issue-spec: 1\nspec-id: 20240101-valid\npath: spec.md\n-->\n# Body\n",
            "comments": [
                "<!--\nzest-dev-issue-spec: 1\nspec-id: 20240101-other\npath: design.md\n-->\n# Design\n"
            ],
        },
        "duplicate-path.yml": {
            "body": "<!--\nzest-dev-issue-spec: 1\nspec-id: 20240101-valid\npath: spec.md\n-->\n# Body\n",
            "comments": [
                "<!--\nzest-dev-issue-spec: 1\nspec-id: 20240101-valid\npath: design.md\n-->\n# One\n",
                "<!--\nzest-dev-issue-spec: 1\nspec-id: 20240101-valid\npath: design.md\n-->\n# Two\n",
            ],
        },
        "invalid-path.yml": {
            "body": "<!--\nzest-dev-issue-spec: 1\nspec-id: 20240101-valid\npath: spec.md\n-->\n# Body\n",
            "comments": [
                "<!--\nzest-dev-issue-spec: 1\nspec-id: 20240101-valid\npath: ../escape.md\n-->\n# Escape\n"
            ],
        },
        "path-conflict.yml": {
            "body": "<!--\nzest-dev-issue-spec: 1\nspec-id: 20240101-valid\npath: spec.md\n-->\n# Body\n",
            "comments": [
                "<!--\nzest-dev-issue-spec: 1\nspec-id: 20240101-valid\npath: notes.md/review.md\n-->\n# Conflict\n"
            ],
        },
    }

    for filename, representation in cases.items():
        path = cli.project_dir / filename
        path.write_text(yaml.safe_dump(representation, sort_keys=False), encoding="utf-8")
        assert cli.run("load", "--from-file", str(path)).returncode != 0

    valid_path = cli.project_dir / "valid.yml"
    valid_path.write_text(
        yaml.safe_dump(
            {
                "body": "<!--\nzest-dev-issue-spec: 1\nspec-id: 20240101-valid\npath: spec.md\n-->\n# Body\n",
                "comments": [],
            },
            sort_keys=False,
        ),
        encoding="utf-8",
    )
    (cli.project_dir / "specs" / "change" / "20240101-valid").mkdir(parents=True)
    assert "Target Spec directory already exists" in cli.fail("load", "--from-file", str(valid_path))


def test_load_ignores_non_protocol_html_comments(cli):
    path = cli.project_dir / "non-protocol-comment.yml"
    path.write_text(
        yaml.safe_dump(
            {
                "body": "<!--\nzest-dev-issue-spec: 1\nspec-id: 20240101-valid\npath: spec.md\n-->\n# Body\n",
                "comments": [
                    "<!--\nplain: comment\n-->\nThis is ordinary discussion.\n",
                    "<!--\nnot actually the protocol\n-->\nStill discussion.\n",
                ],
            },
            sort_keys=False,
        ),
        encoding="utf-8",
    )

    loaded = cli.yaml("load", "--from-file", str(path))

    assert loaded["ok"] is True
    assert markdown_files(cli.project_dir / "specs" / "change" / "20240101-valid") == {
        "spec.md": "# Body\n"
    }


def test_github_transport_uses_gh_and_reports_comment_failure(cli):
    created = cli.yaml("create", "github-dump-source")["spec"]
    spec_dir = cli.project_dir / "specs" / "change" / created["id"]
    (spec_dir / "notes.md").write_text("# Notes\n", encoding="utf-8")

    fake_bin = cli.project_dir / "fake-bin"
    fake_bin.mkdir()
    log_path = cli.project_dir / "gh.log"
    fake_gh = fake_bin / "gh"
    fake_gh.write_text(
        """#!/usr/bin/env python3
import json
import os
import pathlib
import sys

log = pathlib.Path(os.environ["GH_LOG"])
body = sys.stdin.read()
log.open("a", encoding="utf-8").write(json.dumps({"args": sys.argv[1:], "stdin": body}) + "\\n")

if sys.argv[1:3] == ["auth", "status"]:
    raise SystemExit(0)
if sys.argv[1:3] == ["issue", "create"]:
    print("https://github.com/nettee/zest-dev/issues/123")
    raise SystemExit(0)
if sys.argv[1:3] == ["issue", "comment"]:
    if os.environ.get("FAIL_COMMENT") == "1":
        print("comment failed", file=sys.stderr)
        raise SystemExit(2)
    raise SystemExit(0)
if sys.argv[1:3] == ["issue", "close"]:
    if os.environ.get("FAIL_CLOSE") == "1":
        print("close failed", file=sys.stderr)
        raise SystemExit(2)
    raise SystemExit(0)
if sys.argv[1:3] == ["issue", "view"]:
    comments = [
        {"body": body}
        for body in json.loads(pathlib.Path(os.environ["ISSUE_COMMENTS"]).read_text())
    ]
    print(json.dumps({"body": pathlib.Path(os.environ["ISSUE_BODY"]).read_text(), "comments": comments}))
    raise SystemExit(0)

print("unexpected gh args: " + " ".join(sys.argv[1:]), file=sys.stderr)
raise SystemExit(2)
""",
        encoding="utf-8",
    )
    fake_gh.chmod(fake_gh.stat().st_mode | stat.S_IXUSR)
    env = {"PATH": f"{fake_bin}{os.pathsep}{os.environ['PATH']}", "GH_LOG": str(log_path)}

    dumped = cli.yaml("dump", created["id"], env=env)
    assert dumped["ok"] is True
    assert dumped["issue"]["url"] == "https://github.com/nettee/zest-dev/issues/123"
    assert dumped["issue"]["closed"] is True
    log_entries = [yaml.safe_load(line) for line in log_path.read_text(encoding="utf-8").splitlines()]
    assert log_entries[1]["args"][:2] == ["issue", "create"]
    assert "--label" in log_entries[1]["args"]
    assert log_entries[2]["args"][:2] == ["issue", "comment"]
    assert log_entries[-1]["args"] == ["issue", "close", "https://github.com/nettee/zest-dev/issues/123"]

    fail_env = {**env, "FAIL_COMMENT": "1"}
    assert "created issue before failure: https://github.com/nettee/zest-dev/issues/123" in cli.fail(
        "dump", created["id"], env=fail_env
    )

    close_fail_env = {**env, "FAIL_CLOSE": "1"}
    assert "created issue before failure: https://github.com/nettee/zest-dev/issues/123" in cli.fail(
        "dump", created["id"], env=close_fail_env
    )

    dry_run = cli.yaml("dump", created["id"], "--dry-run")
    body_path = cli.project_dir / "issue-body.md"
    comments_path = cli.project_dir / "issue-comments.yml"
    body_path.write_text(dry_run["issue"]["body"], encoding="utf-8")
    comments_path.write_text(json.dumps(dry_run["issue"]["comments"]), encoding="utf-8")
    load_env = {**env, "ISSUE_BODY": str(body_path), "ISSUE_COMMENTS": str(comments_path)}
    source_files = markdown_files(spec_dir)
    spec_dir.rename(spec_dir.with_name(f"{created['id']}.source"))
    loaded = cli.yaml("load", "123", env=load_env)
    assert loaded["ok"] is True
    assert loaded["source"] == {"type": "github", "issue": "123"}
    assert markdown_files(cli.project_dir / "specs" / "change" / created["id"]) == source_files
