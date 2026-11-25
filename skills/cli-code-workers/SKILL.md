---
name: cli-code-workers
description: >-
  Run Codex CLI (`codex exec`) and Antigravity CLI (`agy -p`) as unattended
  workers: start a task, pick model and reasoning effort, capture results, and
  enable YOLO / no-prompt modes. Use when delegating work via native vendor CLIs,
  scripting agent workers, or when the user mentions codex exec, agy print/headless,
  CLI workers, or YOLO for Codex/AntiGravity.
disable-model-invocation: true
---

# CLI Code Workers (Codex + AntiGravity)

Use the official vendor CLIs as workers: start a task → choose model → choose
reasoning effort → capture results → optionally enable YOLO.
Do not use Sidecar or third-party clients.

Confirm `codex` and `agy` are on `PATH`. Run from the target project directory.
Use `set -o pipefail` and `jq` when parsing structured output.

## Default model and reasoning effort

Unless the user overrides them:

| Worker | Default | How to resolve |
| --- | --- | --- |
| Codex | **GPT × Sol Medium** | Current Sol slug from `codex debug models`, plus `model_reasoning_effort="medium"` |
| AntiGravity | **Gemini × Neon High** | Current Neon High slug from `agy models` (effort is in the slug; do not also pass a conflicting `--effort`) |

Resolve the live catalog at run time. Command samples below include illustrative
slug *shapes* so the flag form is obvious — replace them with whatever Sol /
Neon High entry your catalog lists today.

## Cheat sheet

| Action | Codex | AntiGravity (`agy`) |
| --- | --- | --- |
| Start task | `codex exec '…'` (alias `codex e`) | `agy -p '…'` (`--print` / `--prompt`) |
| Choose model | `-m` / `--model`; catalog: `codex debug models` | `--model`; catalog: `agy models` |
| Reasoning effort | `-c 'model_reasoning_effort="…"'` (default `medium`) | Prefer a `…-neon-high` slug; or family slug + `--effort` |
| Capture / resume | stdout / `-o` / `--json` → `thread_id` | stdout / `--output-format json\|stream-json` → `conversation_id` |
| YOLO | `--yolo` | `--dangerously-skip-permissions` (no `--yolo`) |

---

## Codex worker

### 1. Start a task

```bash
# Positional prompt only: close stdin so piped context is not appended
codex exec -C "$WORKDIR" 'Task description' </dev/null

# Long prompt via stdin
codex exec -C "$WORKDIR" - <"$RUN/prompt.md"
```

Codex normally expects a Git repo; add `--skip-git-repo-check` for a trusted
non-repo directory. Auth: saved CLI login, or `CODEX_API_KEY` for the run.
Resume: `codex exec resume "$thread_id" 'Follow-up' </dev/null`
(avoid `--last` under concurrency). Do not use `--ephemeral` if you need resume.

### 2. Choose a model

```bash
codex debug models                    # raw catalog (optional: --bundled)
codex exec -m gpt-6.2-sol '…' </dev/null
```

### 3. Choose reasoning effort

There is no dedicated `--effort` flag; override config:

```bash
codex exec -m gpt-6.2-sol \
  -c 'model_reasoning_effort="medium"' \
  '…' </dev/null

# Inspect supported efforts per model
codex debug models > /tmp/codex-models.json
jq -r '.models[] | [.slug, .default_reasoning_level,
  ([.supported_reasoning_levels[].effort] | join(","))] | @tsv' \
  /tmp/codex-models.json
```

Common values: `low` | `medium` | `high` | `xhigh` | `max` | `ultra`
(availability depends on the model). This skill defaults to **`medium`** for Sol
even when the catalog default differs.

### 4. Capture results

| Mode | Behavior |
| --- | --- |
| Default | Final answer → **stdout**; progress → **stderr** |
| Final message file | `-o` / `--output-last-message FILE` |
| Event JSONL | `--json` (works with `-o`) |
| Structured final | `--output-schema schema.json` |

```bash
codex exec --json -o "$RUN/last.txt" '…' </dev/null \
  >"$RUN/events.jsonl" 2>"$RUN/stderr.log"
thread_id=$(jq -er 'select(.type=="thread.started") | .thread_id' "$RUN/events.jsonl")
```

Success: exit 0 and a `turn.completed` event when using `--json`; also check for
`turn.failed` / `error` and verify workspace artifacts. A completed turn can still
report that a command failed.

### 5. YOLO / no-prompt modes

`exec` sandbox default is **`read-only`**.

| Mode | Flags | Notes |
| --- | --- | --- |
| Recommended unattended | `--sandbox workspace-write -c 'approval_policy="never"'` | No prompts; out-of-policy actions fail back to the model |
| Global never | `codex -a never exec …` (`-a` **before** `exec`) | Same idea |
| Auto-review | `--approve-for-me` (`--not-so-yolo`) | Forces workspace-write; **conflicts** with `--sandbox` / `--yolo` |
| Full YOLO | `--yolo` (`--dangerously-bypass-approvals-and-sandbox`) | No sandbox, no approvals; only in an externally isolated environment |

Do not use the removed `--full-auto` flag.

**Editing-worker template:**

```bash
codex exec -C "$WORKDIR" \
  -m gpt-6.2-sol \
  -c 'model_reasoning_effort="medium"' \
  --sandbox workspace-write \
  -c 'approval_policy="never"' \
  --json -o "$RUN/last.txt" - \
  <"$RUN/prompt.md" >"$RUN/events.jsonl" 2>"$RUN/stderr.log"
```

---

## AntiGravity worker (`agy`)

### 1. Start a task

```bash
agy -p 'Task description'
agy --print-timeout 10m --print 'Task description'   # 0s = wait until done
```

Resume: `agy --conversation "$conversation_id" -p 'Follow-up'`
(`-r` / `--resume` are aliases). Avoid `--continue` / `-c` under concurrency.
Without credentials and without a TTY, headless exits with authentication required.

### 2. Choose a model

```bash
agy models
agy --model gemini-4-neon-high -p '…'
```

Unknown models exit non-zero; JSON output reports `ERROR`.

### 3. Choose reasoning effort

Default: a **Neon High** slug (effort is already in the name):

```bash
agy -p '/effort' --output-format json          # read-only: current / available tiers
agy --model gemini-4-neon-high -p '…'

# Equivalent: family slug + explicit effort (no effort suffix on the slug)
agy --model gemini-4-neon --effort high -p '…'
```

`--effort`: `low` | `medium` | `high` | `xhigh` | `max`.

**Conflict:** a tiered slug (for example `…-neon-high`) plus a different
`--effort` returns `ERROR`. Use either a tiered slug **or** family slug +
`--effort`, not both.

### 4. Capture results

| `--output-format` | stdout |
| --- | --- |
| `text` (default) | Plain final answer |
| `json` | One object: `status` / `response` / `conversation_id` / `usage` |
| `stream-json` | NDJSON; final envelope under `.result` when `event == "result"` |

`--json-schema` → read `structured_output`.

```bash
agy -p '…' --output-format json >"$RUN/result.json" 2>"$RUN/stderr.log"
jq -er 'select(.status=="SUCCESS") | .response' "$RUN/result.json"
conversation_id=$(jq -er '.conversation_id' "$RUN/result.json")
```

**Success check:** do not trust exit 0 alone. Require `status == "SUCCESS"` and
verify artifacts. Tools that need approval they cannot get may be **soft-denied
while still exiting 0** (see stderr).

### 5. YOLO / no-prompt modes

There is no `--yolo` alias.

| Mode | Flags |
| --- | --- |
| Allow-list (one run) | `--settings '{"permissions":{"allow":["command(git status)"]}}'` |
| Auto where available | `--mode auto` (headless often defaults here when supported) |
| Auto-approve edits only | `--mode accept-edits` |
| Full YOLO | `--dangerously-skip-permissions` |

`--sandbox` is a separate flag (off by default). Do not confuse it with `auto`
mode's terminal sandboxing.

**Editing-worker template:**

```bash
agy -p "$(cat "$RUN/prompt.md")" \
  --model gemini-4-neon-high \
  --mode auto \
  --sandbox \
  --output-format json \
  --print-timeout 10m \
  >"$RUN/result.json" 2>"$RUN/stderr.log"
# Add --dangerously-skip-permissions when every tool must auto-approve
```

---

## Gotchas

- For parallel jobs, always use explicit `thread_id` / `conversation_id`, never
  “latest session” shortcuts.
- **Codex:** use `</dev/null` with positional prompts; require `turn.completed`
  and artifact checks.
- **agy:** soft-deny can still exit 0; never combine a tiered model slug with a
  conflicting `--effort`.
- Reserve YOLO for trusted tasks in isolated environments; prefer
  sandbox / `never` / `auto` / allow-lists day to day.

## References

- Codex: Non-interactive mode, Approvals & security, `model_reasoning_effort` config
- Antigravity: Headless mode, CLI reference, Permissions, `/effort`
