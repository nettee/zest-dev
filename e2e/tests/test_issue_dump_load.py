import json
import os
import shutil
import stat
from pathlib import Path

import pytest
import yaml


def markdown_files(spec_dir: Path) -> dict[str, str]:
    return {
        str(path.relative_to(spec_dir)): path.read_text(encoding="utf-8")
        for path in sorted(spec_dir.rglob("*.md"))
    }


def protocol_header(text: str) -> dict:
    assert text.startswith("<!--\n")
    metadata, _ = text.removeprefix("<!--\n").split("\n-->", 1)
    return yaml.safe_load(metadata)


def protocol_document(metadata: dict, content: str = "") -> str:
    header = yaml.safe_dump(metadata, sort_keys=False).rstrip()
    return f"<!--\n{header}\n-->\n{content}"


def test_v2_directory_manifest_round_trips_spec_with_main_file(cli):
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
    body_header = protocol_header(issue["body"])
    assert body_header["zest-dev-issue-spec"] == 2
    assert body_header["body-path"] == "spec.md"
    assert body_header["files"] == ["design.md", "implementation.md", "notes/review.md", "spec.md"]
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


def test_v2_directory_manifest_round_trips_without_main_file_and_loads_v1(cli):
    source_id = "20260812-legacy-spec"
    source_dir = cli.project_dir / "specs" / "change" / source_id
    (source_dir / "notes").mkdir(parents=True)
    (source_dir / "design.md").write_text("# Historical design\n", encoding="utf-8")
    (source_dir / "notes" / "empty.md").write_text("", encoding="utf-8")

    dumped = cli.yaml("dump", source_id, "--dry-run")
    issue = dumped["issue"]
    body_header = protocol_header(issue["body"])
    assert body_header == {
        "zest-dev-issue-spec": 2,
        "spec-id": source_id,
        "files": ["design.md", "notes/empty.md"],
    }
    assert issue["body"].endswith("-->\n")
    assert [protocol_header(comment)["path"] for comment in issue["comments"]] == [
        "design.md",
        "notes/empty.md",
    ]

    source_files = markdown_files(source_dir)
    source_dir.rename(source_dir.with_name(f"{source_id}.source"))
    dump_path = cli.project_dir / "legacy-v2.yml"
    dump_path.write_text(yaml.safe_dump(issue, sort_keys=False), encoding="utf-8")

    loaded = cli.yaml("load", "--from-file", str(dump_path))
    assert loaded["spec"] == {
        "id": source_id,
        "path": f"specs/change/{source_id}",
        "active": False,
        "status": "new",
    }
    assert markdown_files(cli.project_dir / "specs" / "change" / source_id) == source_files

    v1_id = "20240101-v1-archive"
    v1_path = cli.project_dir / "v1.yml"
    v1_path.write_text(
        yaml.safe_dump(
            {
                "body": (
                    "<!--\nzest-dev-issue-spec: 1\n"
                    f"spec-id: {v1_id}\npath: spec.md\n-->\n# V1 body\n"
                ),
                "comments": [],
            },
            sort_keys=False,
        ),
        encoding="utf-8",
    )
    cli.ok("load", "--from-file", str(v1_path))
    assert markdown_files(cli.project_dir / "specs" / "change" / v1_id) == {
        "spec.md": "# V1 body\n"
    }


def test_v3_standalone_file_round_trips_by_path_and_unambiguous_id(cli):
    spec_id = "20260101-legacy-record"
    filename = f"{spec_id}.md"
    source_path = cli.project_dir / "specs" / "change" / filename
    source_path.parent.mkdir(parents=True)
    source_bytes = "# Historical change record\n\n你好，世界。\n".encode()
    source_path.write_bytes(source_bytes)

    by_path = cli.yaml("dump", str(source_path), "--dry-run")
    by_id = cli.yaml("dump", spec_id, "--dry-run")
    assert by_path == by_id
    issue = by_path["issue"]
    assert protocol_header(issue["body"]) == {
        "zest-dev-issue-spec": 3,
        "kind": "standalone-file",
        "spec-id": spec_id,
        "filename": filename,
    }
    assert issue["body"].endswith(source_bytes.decode())
    assert issue["comments"] == []

    source_path.rename(source_path.with_suffix(".source"))
    dump_path = cli.project_dir / "standalone-v3.yml"
    load_issue = {**issue, "comments": ["Archive discussion without protocol metadata."]}
    dump_path.write_text(yaml.safe_dump(load_issue, sort_keys=False), encoding="utf-8")
    loaded = cli.yaml("load", "--from-file", str(dump_path))

    assert loaded["spec"] == {
        "id": spec_id,
        "path": f"specs/change/{filename}",
        "active": False,
        "status": "new",
    }
    assert source_path.read_bytes() == source_bytes


def test_v3_standalone_file_fails_fast_for_ambiguity_collisions_and_corruption(cli):
    spec_id = "20260102-ambiguous-record"
    filename = f"{spec_id}.md"
    specs_dir = cli.project_dir / "specs" / "change"
    standalone_path = specs_dir / filename
    directory_path = specs_dir / spec_id
    directory_path.mkdir(parents=True)
    (directory_path / "notes.md").write_text("# Directory\n", encoding="utf-8")
    standalone_path.write_text("# Standalone\n", encoding="utf-8")

    assert "Ambiguous Spec identifier" in cli.fail("dump", spec_id, "--dry-run")
    assert cli.yaml("dump", str(standalone_path), "--dry-run")["ok"] is True
    assert cli.yaml("dump", str(directory_path), "--dry-run")["ok"] is True

    shutil.rmtree(directory_path)
    dumped = cli.yaml("dump", spec_id, "--dry-run")["issue"]
    dump_path = cli.project_dir / "standalone-collision.yml"
    dump_path.write_text(yaml.safe_dump(dumped, sort_keys=False), encoding="utf-8")
    assert "Target standalone Spec file already exists" in cli.fail(
        "load", "--from-file", str(dump_path)
    )

    standalone_path.unlink()
    directory_path.mkdir()
    assert "Conflicting target Spec directory already exists" in cli.fail(
        "load", "--from-file", str(dump_path)
    )

    shutil.rmtree(directory_path)
    invalid_cases = {
        "wrong-kind": protocol_document(
            {
                "zest-dev-issue-spec": 3,
                "kind": "directory",
                "spec-id": spec_id,
                "filename": filename,
            },
            "# Body\n",
        ),
        "wrong-filename": protocol_document(
            {
                "zest-dev-issue-spec": 3,
                "kind": "standalone-file",
                "spec-id": spec_id,
                "filename": "20260102-other.md",
            },
            "# Body\n",
        ),
        "extra-metadata": protocol_document(
            {
                "zest-dev-issue-spec": 3,
                "kind": "standalone-file",
                "spec-id": spec_id,
                "filename": filename,
                "files": [filename],
            },
            "# Body\n",
        ),
    }
    for name, body in invalid_cases.items():
        invalid_path = cli.project_dir / f"{name}.yml"
        invalid_path.write_text(
            yaml.safe_dump({"body": body, "comments": []}, sort_keys=False),
            encoding="utf-8",
        )
        assert cli.run("load", "--from-file", str(invalid_path)).returncode != 0

    protocol_comment_path = cli.project_dir / "protocol-comment.yml"
    protocol_comment_path.write_text(
        yaml.safe_dump(
            {
                "body": protocol_document(
                    {
                        "zest-dev-issue-spec": 3,
                        "kind": "standalone-file",
                        "spec-id": spec_id,
                        "filename": filename,
                    },
                    "# Body\n",
                ),
                "comments": [
                    protocol_document(
                        {"zest-dev-issue-spec": 3, "spec-id": spec_id},
                        "# Unexpected protocol payload\n",
                    )
                ],
            },
            sort_keys=False,
        ),
        encoding="utf-8",
    )
    assert "must not contain protocol comments" in cli.fail(
        "load", "--from-file", str(protocol_comment_path)
    )


def test_dump_rejects_invalid_utf8_standalone_file(cli):
    path = cli.project_dir / "specs" / "change" / "20260103-invalid-utf8.md"
    path.parent.mkdir(parents=True)
    path.write_bytes(b"\xff")
    assert "Invalid UTF-8 Markdown file" in cli.fail("dump", str(path), "--dry-run")


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
    dumped = cli.yaml("dump", created["id"], "--dry-run")
    assert dumped["ok"] is True
    assert "asset.txt" not in yaml.safe_dump(dumped["issue"])

    empty_id = "20240101-empty-directory"
    (cli.project_dir / "specs" / "change" / empty_id).mkdir()
    assert "requires at least one Markdown file" in cli.fail("dump", empty_id, "--dry-run")

    invalid_utf8_id = "20240101-invalid-utf8"
    invalid_utf8_dir = cli.project_dir / "specs" / "change" / invalid_utf8_id
    invalid_utf8_dir.mkdir()
    (invalid_utf8_dir / "invalid.md").write_bytes(b"\xff")
    assert "Invalid UTF-8 Markdown file: invalid.md" in cli.fail(
        "dump", invalid_utf8_id, "--dry-run"
    )

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


def test_v2_manifest_fails_fast_for_incomplete_or_invalid_representations(cli):
    spec_id = "20240101-v2-invalid"
    base_metadata = {
        "zest-dev-issue-spec": 2,
        "spec-id": spec_id,
        "files": ["design.md"],
    }
    valid_comment = protocol_document(
        {"zest-dev-issue-spec": 2, "spec-id": spec_id, "path": "design.md"},
        "# Design\n",
    )
    cases = {
        "empty-manifest": (
            {"body": protocol_document({**base_metadata, "files": []}), "comments": []},
            "manifest requires at least one file",
        ),
        "duplicate-manifest": (
            {
                "body": protocol_document({**base_metadata, "files": ["design.md", "design.md"]}),
                "comments": [valid_comment],
            },
            "Duplicate Issue Spec manifest path: design.md",
        ),
        "body-path-not-listed": (
            {
                "body": protocol_document({**base_metadata, "body-path": "spec.md"}, "# Spec\n"),
                "comments": [valid_comment],
            },
            "Issue body path is not present in manifest: spec.md",
        ),
        "unexpected-body-content": (
            {"body": protocol_document(base_metadata, "# Not a represented file\n"), "comments": [valid_comment]},
            "Unexpected issue body content without body-path",
        ),
        "missing-comment": (
            {"body": protocol_document(base_metadata), "comments": []},
            "Missing Issue Spec file: design.md",
        ),
        "unlisted-comment": (
            {
                "body": protocol_document(base_metadata),
                "comments": [
                    valid_comment,
                    protocol_document(
                        {"zest-dev-issue-spec": 2, "spec-id": spec_id, "path": "extra.md"},
                        "# Extra\n",
                    ),
                ],
            },
            "Unlisted Issue Spec path: extra.md",
        ),
        "mixed-version": (
            {
                "body": protocol_document(base_metadata),
                "comments": [
                    protocol_document(
                        {"zest-dev-issue-spec": 1, "spec-id": spec_id, "path": "design.md"},
                        "# Design\n",
                    )
                ],
            },
            "Mismatched Issue Spec protocol version",
        ),
        "mismatched-spec-id": (
            {
                "body": protocol_document(base_metadata),
                "comments": [
                    protocol_document(
                        {"zest-dev-issue-spec": 2, "spec-id": "20240101-other", "path": "design.md"},
                        "# Design\n",
                    )
                ],
            },
            'Mismatched comment spec-id "20240101-other"',
        ),
    }

    for name, (representation, expected_error) in cases.items():
        path = cli.project_dir / f"{name}.yml"
        path.write_text(yaml.safe_dump(representation, sort_keys=False), encoding="utf-8")
        assert expected_error in cli.fail("load", "--from-file", str(path))


@pytest.mark.parametrize("source_shape", ["directory-with-main", "directory-without-main", "standalone"])
def test_github_transport_uses_gh_and_reports_comment_failure(cli, source_shape):
    created = cli.yaml("create", "github-dump-source")["spec"]
    spec_dir = cli.project_dir / "specs" / "change" / created["id"]
    (spec_dir / "notes.md").write_text("# Notes\n", encoding="utf-8")
    spec_identifier = created["id"]
    standalone_path = cli.project_dir / "specs" / "change" / f"{created['id']}.md"
    if source_shape == "directory-without-main":
        (spec_dir / "spec.md").unlink()
    elif source_shape == "standalone":
        shutil.rmtree(spec_dir)
        standalone_path.write_text("# Standalone archive\n", encoding="utf-8")
        spec_identifier = str(standalone_path)

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

    dumped = cli.yaml("dump", spec_identifier, env=env)
    assert dumped["ok"] is True
    assert dumped["issue"]["url"] == "https://github.com/nettee/zest-dev/issues/123"
    assert dumped["issue"]["closed"] is True
    log_entries = [yaml.safe_load(line) for line in log_path.read_text(encoding="utf-8").splitlines()]
    assert log_entries[1]["args"][:2] == ["issue", "create"]
    assert "--label" in log_entries[1]["args"]
    if source_shape != "standalone":
        assert log_entries[2]["args"][:2] == ["issue", "comment"]
    assert log_entries[-1]["args"] == ["issue", "close", "https://github.com/nettee/zest-dev/issues/123"]

    fail_env = {**env, "FAIL_COMMENT": "1"}
    if source_shape != "standalone":
        assert "created issue before failure: https://github.com/nettee/zest-dev/issues/123" in cli.fail(
            "dump", spec_identifier, env=fail_env
        )

    close_fail_env = {**env, "FAIL_CLOSE": "1"}
    assert "created issue before failure: https://github.com/nettee/zest-dev/issues/123" in cli.fail(
        "dump", spec_identifier, env=close_fail_env
    )

    dry_run = cli.yaml("dump", spec_identifier, "--dry-run")
    body_path = cli.project_dir / "issue-body.md"
    comments_path = cli.project_dir / "issue-comments.yml"
    body_path.write_text(dry_run["issue"]["body"], encoding="utf-8")
    comments_path.write_text(json.dumps(dry_run["issue"]["comments"]), encoding="utf-8")
    load_env = {**env, "ISSUE_BODY": str(body_path), "ISSUE_COMMENTS": str(comments_path)}
    if source_shape == "standalone":
        source_bytes = standalone_path.read_bytes()
        standalone_path.rename(standalone_path.with_suffix(".source"))
    else:
        source_files = markdown_files(spec_dir)
        spec_dir.rename(spec_dir.with_name(f"{created['id']}.source"))
    loaded = cli.yaml("load", "123", env=load_env)
    assert loaded["ok"] is True
    assert loaded["source"] == {"type": "github", "issue": "123"}
    if source_shape == "standalone":
        assert standalone_path.read_bytes() == source_bytes
    else:
        assert markdown_files(cli.project_dir / "specs" / "change" / created["id"]) == source_files
