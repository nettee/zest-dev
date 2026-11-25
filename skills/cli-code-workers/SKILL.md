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

# CLI Code Workers（Codex + AntiGravity）

用官方 CLI 当 worker：开任务 → 选模型 → 选推理强度 → 拿结果 → 可选 YOLO。  
不要走 Sidecar / 第三方 client。

先确认：`codex --version`、`agy --version`（已核对：Codex 0.167+、agy 1.5+）。在目标项目目录下执行；管道解析用 `set -o pipefail` + `jq`。

## 默认模型 & 推理强度

未另行指定时，worker 使用：

| Worker | 默认 | CLI |
| --- | --- | --- |
| Codex | **GPT × Sol Medium** | `-m gpt-6.2-sol` + `-c 'model_reasoning_effort="medium"'` |
| AntiGravity | **Gemini × Neon High** | `--model gemini-4-neon-high`（slug 已含 High；勿再叠冲突的 `--effort`） |

Sol 系列以本机 `codex debug models` 里最新的 `gpt-*-sol` 为准（当前：`gpt-6.2-sol`）。Neon High 以 `agy models` 里的 `gemini-*-neon-high` 为准（当前：`gemini-4-neon-high`）。

## 速查

| 动作 | Codex | AntiGravity (`agy`) |
| --- | --- | --- |
| 开任务 | `codex exec '…'`（别名 `codex e`） | `agy -p '…'`（=`--print`/`--prompt`） |
| 选模型 | `-m`；目录：`codex debug models`；默认 Sol | `--model`；目录：`agy models`；默认 Neon High |
| 推理强度 | `-c 'model_reasoning_effort="…"'`；默认 `medium` | 默认用 `…-neon-high` slug；或家族 slug + `--effort` |
| 看结果 | stdout / `-o` / `--json` → resume `thread_id` | stdout / `--output-format json\|stream-json` → resume `conversation_id` |
| YOLO | `--yolo` | `--dangerously-skip-permissions`（无 `--yolo`） |

---

## Codex worker

### 1. 开启任务

```bash
# 只用参数里的 prompt 时，关掉 stdin，避免管道内容被追加进上下文
codex exec -C "$WORKDIR" '任务说明' </dev/null

# 长 prompt 走 stdin
codex exec -C "$WORKDIR" - <"$RUN/prompt.md"
```

默认要求 Git 仓库；非仓库加 `--skip-git-repo-check`。认证：已登录 CLI，或环境变量 `CODEX_API_KEY`。  
续跑：`codex exec resume "$thread_id" '后续' </dev/null`（并发不要用 `--last`）。需要 resume 时别加 `--ephemeral`。

### 2. 选模型

```bash
codex debug models                          # 原始目录（可 --bundled）
codex exec -m gpt-6.2-sol '…' </dev/null   # 默认：Sol
```

### 3. 选推理强度

无独立 `--effort`；用 `-c`。默认 **`medium`**（GPT × Sol Medium）：

```bash
codex exec -m gpt-6.2-sol \
  -c 'model_reasoning_effort="medium"' \
  '…' </dev/null

# 查某模型支持的档位
codex debug models > /tmp/codex-models.json
jq -r '.models[] | [.slug, .default_reasoning_level, ([.supported_reasoning_levels[].effort] | join(","))] | @tsv' \
  /tmp/codex-models.json
```

常见：`low` | `medium` | `high` | `xhigh` | `max` | `ultra`（随模型变化）。本 skill 默认覆盖为 `medium`（目录里 Sol 原始默认可能是 `low`）。

### 4. 查看结果

| 方式 | 用法 |
| --- | --- |
| 默认 | 终稿 → **stdout**；进度 → **stderr** |
| 终稿文件 | `-o` / `--output-last-message FILE` |
| 事件 JSONL | `--json`（与 `-o` 可并用） |
| 结构化终稿 | `--output-schema schema.json` |

```bash
codex exec --json -o "$RUN/last.txt" '…' </dev/null \
  >"$RUN/events.jsonl" 2>"$RUN/stderr.log"
thread_id=$(jq -er 'select(.type=="thread.started") | .thread_id' "$RUN/events.jsonl")
```

成功：exit 0，且 JSONL 有 `turn.completed`；同时看有无 `turn.failed`/`error`，并核对产物。完成的 turn 仍可能报告命令失败。

### 5. YOLO / 不卡审批

`exec` 默认 sandbox 是 **`read-only`**。

| 模式 | 命令 | 说明 |
| --- | --- | --- |
| 推荐无人值守 | `--sandbox workspace-write -c 'approval_policy="never"'` | 不弹审批；越权变错误回给模型 |
| 全局 never | `codex -a never exec …`（`-a` 在 `exec` **之前**） | 同上思路 |
| 自动审 | `--approve-for-me`（=`--not-so-yolo`） | 固定 workspace-write；**不能**与 `--sandbox`/`--yolo` 同用 |
| 真 YOLO | `--yolo`（=`--dangerously-bypass-approvals-and-sandbox`） | 无沙箱无审批；仅外部已隔离环境 |

本机构建拒绝 `--full-auto`。

**编辑型模板：**

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

## AntiGravity worker（`agy`）

### 1. 开启任务

```bash
agy -p '任务说明'
agy --print-timeout 10m --print '任务说明'   # 0s = 等到完成
```

续跑：`agy --conversation "$conversation_id" -p '后续'`（`-r`/`--resume` 同义）。  
并发不要用 `--continue`/`-c`。无凭证且无 TTY → `authentication required`。

### 2. 选模型

```bash
agy models
agy --model gemini-4-neon-high -p '…'    # 默认：Gemini × Neon High
```

未知模型：非零退出，JSON 里 `ERROR`。

### 3. 选推理强度

默认用 **Neon High** slug（档位已钉在模型名里）：

```bash
agy -p '/effort' --output-format json          # 只读：当前/可用档位
agy --model gemini-4-neon-high -p '…'          # 推荐默认
# 等价写法（家族 slug + effort）：
agy --model gemini-4-neon --effort high -p '…'
```

`--effort`：`low` | `medium` | `high` | `xhigh` | `max`。  

**冲突：** 带档位的 slug（如 `…-neon-high`）再叠不同 `--effort` 会 `ERROR`。二选一：家族 slug + `--effort`，或单一 variant slug。

### 4. 查看结果

| 格式 | stdout |
| --- | --- |
| `text`（默认） | 纯文本终稿 |
| `json` | 单对象：`status` / `response` / `conversation_id` / `usage` |
| `stream-json` | NDJSON；终稿在 `event=="result"` 的 `.result` |

`--json-schema` → 读 `structured_output`。

```bash
agy -p '…' --output-format json >"$RUN/result.json" 2>"$RUN/stderr.log"
jq -er 'select(.status=="SUCCESS") | .response' "$RUN/result.json"
conversation_id=$(jq -er '.conversation_id' "$RUN/result.json")
```

**成功判定：** 不要只看 exit 0。要 `status=="SUCCESS"`，并核对产物。需要审批却批不了的工具会 **soft-deny 仍可能 exit 0**（看 stderr）。

### 5. YOLO / 不卡审批

无 `--yolo` 别名。

| 模式 | 用法 |
| --- | --- |
| 白名单（单次） | `--settings '{"permissions":{"allow":["command(git status)"]}}'` |
| 自动（可用时） | `--mode auto`（1.5.7+ headless 常默认；无 sandbox/部分账号会退回） |
| 只自动改文件 | `--mode accept-edits` |
| 真 YOLO | `--dangerously-skip-permissions` |

`--sandbox` 是独立开关（默认关）；与 `auto` 的终端沙箱相关但别混为一谈。

**编辑型模板：**

```bash
agy -p "$(cat "$RUN/prompt.md")" \
  --model gemini-4-neon-high \
  --mode auto \
  --sandbox \
  --output-format json \
  --print-timeout 10m \
  >"$RUN/result.json" 2>"$RUN/stderr.log"
# 需要工具全放行时再加：--dangerously-skip-permissions
```

---

## Gotchas

- **并行任务**只用显式 `thread_id` / `conversation_id`，别用「最近一次」快捷方式。
- **Codex**：参数 prompt 时记得 `</dev/null`；检查 `turn.completed` 与产物。
- **agy**：soft-deny + exit 0；slug 档位与 `--effort` 勿冲突。
- YOLO 仅信任任务 + 隔离环境；日常优先 sandbox/`never`/`auto`/白名单。

## 参考

- Codex：Non-interactive mode、Approvals & security、`model_reasoning_effort` config  
- Antigravity：Headless mode、CLI reference、Permissions、`/effort`
