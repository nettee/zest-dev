---
name: t3-task
description: >-
  Dispatch, monitor, continue, and settle coding tasks through the local T3 Code
  CLI (`t3 thread start|send|show`). Use when the user asks to run work via T3,
  T3 Code, `t3` CLI, or to operate an existing T3 thread.
---

# t3-task

You are the orchestrator. T3 Code is the worker. Decompose the request, dispatch
it with the local `t3` CLI, inspect results, and keep driving the same thread
until the original need is met. Dispatch success is not task completion.

Do not reverse-engineer settle/HTTP/WebSocket APIs. Use only the CLI commands
below.

## Preconditions

- Prefer the repository absolute path as the project handle.
- If a custom T3 data directory is in use, pass the same `--base-dir` on every
  command.
- Do not switch provider or model unless the user explicitly asks; keep the
  project default. When specifying an effort requires explicit provider/model
  flags, use the resolved default selection unless a change was requested.
- Long prompts: pass message `-` and feed the body on stdin.

## 1. Resolve the project

```bash
t3 thread list --project "<repo-path>" --json
```

- Success → reuse that project.
- Only when the CLI clearly says the project is missing →
  `t3 project add "<repo-path>"`.
- Auth, connection, config, or other errors: report and fix. Never treat them as
  “project not found”. Never hide failures with `|| true`.

## 2. Start or continue a thread

New task:

```bash
t3 thread start "<repo-path>" "<full task brief>" --wait --json
```

Save the returned `threadId`. CLI-launched IDs often look like `mcp:…`; that is
normal (`t3 thread` talks to the local T3 `/mcp` endpoint). It does not mean a
separate Cursor MCP integration was used.

Continue the same task (follow-ups, answers, gap fixes):

```bash
t3 thread send "<thread-id>" "<follow-up>" --wait --json
```

Isolated edits:

```bash
t3 thread start "<repo-path>" "<full task brief>" \
  --worktree "<base-ref>" --branch "<new-branch>" --wait --json
```

Inspect state / recent messages:

```bash
t3 thread show "<thread-id>" --json
```

### Specify reasoning effort (Codex)

When the user requests a reasoning effort, set it on `thread start` with the
case-sensitive option id `reasoningEffort`:

```bash
t3 thread start "<repo-path>" "<full task brief>" \
  --provider "<provider-instance-id>" --model "<model-slug>" \
  --option reasoningEffort=medium --wait --json
```

- `--option` requires both `--provider` and `--model`. Resolve the intended
  provider instance and model first; do not guess or silently switch them.
- Use an effort supported by the selected model. For example, `medium` and
  `high` were verified with Codex `gpt-6.1-sol` on T3 CLI v0.1.11.
- Check `t3 thread start --help` for installed-version support. On v0.1.11,
  the help example `--option effort=high` is misleading: `effort` is accepted
  and stored, but does not reach Codex. Use `reasoningEffort=high` instead.
- `thread send` has no model-option flags in that version. Set the desired
  effort when creating the thread; do not assume a follow-up prompt changes it.
- Without an explicit option, the resolved defaults determine the setting.
  Do not assume it is `low`, `medium`, or inherited from the orchestrator.

When asked to confirm the actual effort, inspect the matching run's provider
log or Codex rollout rather than relying on the model's self-report:

- `thread show` on v0.1.11 does not expose reasoning effort. A saved option or
  CLI exit code `0` alone does not prove that Codex received it.
- Match the T3 thread/run to its provider log under
  `<base-dir>/userdata/logs/provider/` (default base: `~/.t3`). Inspect the
  Codex `thread/settings/updated` event's `threadSettings.effort` and
  `threadSettings.collaborationMode.settings.reasoning_effort`.
- Follow the rollout path reported by Codex and check the matching turn's
  `turn_context` record, `payload.effort`. Report the evidence and its scope.
  Missing or `null` effort means no explicit value is recorded; it does not
  establish the backend's effective default. If logs are unavailable, say the
  actual effort could not be verified.

## 3. Interpret `--wait` results

| Exit code | Meaning |
| --- | --- |
| `0` | Run finished |
| `1` | Run failed |
| `2` | Waiting for an answer |

Also read JSON `status` / `error` / `reply`.

- Exit `2`: answer from existing context when you can; ask the user only for
  decisions only they can make, then `thread send` the answer.
- Sending to a busy thread queues the next turn; it does not interrupt the
  current run.
- After completion: check code changes and relevant verification yourself.
  Missing work → keep pushing on the **same** thread. Report what actually
  landed, what was verified, and any remaining blockers.

## 4. Settle when done

Settle only after the original need is satisfied and verification looks good.
If anything is still failing, waiting on the user, or unfinished, keep driving
the thread and do **not** settle.

```bash
t3 thread send "<thread-id>" "任务已验收完成。请调用 t3_thread_organize，传入 action: settle，settle 当前线程，然后结束本轮。" --wait --json
```

- Settle takes effect when that turn ends. Do not send more messages before it
  finishes.
- Confirm with `t3 thread show "<thread-id>" --json` (`settled: true`).
- If settle fails or the tool is unavailable, report that clearly. Never claim
  the thread was settled.
