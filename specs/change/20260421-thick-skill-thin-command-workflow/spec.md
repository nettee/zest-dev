---
id: 20260421-thick-skill-thin-command-workflow
name: Thick Skill Thin Command Workflow
status: researched
created: '2026-04-21'
---

## Overview

### Problem Statement
- 当前工作流能力分散在 command 中，导致维护成本偏高，且不同入口之间的行为容易不一致。
- 需要将更多工作流能力沉淀到 skill 中，让命令触发和自然语言 prompt 的使用体验更统一。

### Goals
- 将 research、design、implement 等流程收敛到 skill 内部，由 skill 负责主要逻辑与编排。
- 让 command 仅作为轻量触发入口，尽量减少 command 中的流程逻辑。
- 支持用户不依赖专门 command，仅通过简单 prompt 也能触发对应的 skill/workflow。

### Scope
**In scope:**
- 设计兼容 command 和自由 prompt 的 skill 触发机制。
- 明确 command 与 skill 的职责边界。
- 评估现有 command 中哪些流程适合优先迁移到 skill。

### Constraints
- 需要保证 prompt 直触发时的稳定性和可预测性。

## Research

### Existing System
- `zest-dev` CLI 负责 spec 生命周期与 prompt 生成：`status/show/create/set-active/update/create-branch/init/prompt` 都在同一入口实现。关键入口见 `bin/zest-dev.js:97-246`。
- spec 状态由 `lib/spec-manager.js:11-17` 和 `lib/spec-manager.js:319-369` 管理，当前只支持 `new → researched → designed → implemented` 的前进式流转，active spec 通过 `specs/change/active` symlink 表示，见 `lib/spec-manager.js:70-72`、`lib/spec-manager.js:236-265`。
- command workflow 以 `plugin/commands/*.md` 的 markdown prompt 形式存在，`/new`、`/research`、`/design`、`/implement`、`/draft`、`/summarize-*` 等流程都通过文档步骤定义，见 `plugin/commands/new.md:1-138`、`plugin/commands/research.md:1-142`、`plugin/commands/design.md:1-180`、`plugin/commands/implement.md:1-85`、`plugin/commands/draft.md:1-163`。
- `zest-dev prompt <command>` 会读取 `plugin/commands/<command>.md`，去掉 frontmatter，并替换 `$ARGUMENTS`，把 command 文档转成自然语言 prompt 文本，见 `bin/zest-dev.js:230-244` 与 `lib/prompt-generator.js:10-37`。
- 部署时，command 会被复制到 `.opencode/commands/` 并统一加上 `zest-dev-` 前缀；skill 会整目录复制到 `.opencode/skills/`。部署逻辑在 `lib/plugin-deployer.js:122-173`、`lib/plugin-deployer.js:179-223`。
- 已部署 command 的 frontmatter 会被裁剪为仅保留 `description`，其余如 `argument-hint` 不会进入部署产物，见 `lib/plugin-deployer.js:30-42`。
- `plugin/skills/zest-dev/SKILL.md:1-306` 当前主要承担方法论说明和触发描述；`plugin/skills/debug-mode/SKILL.md:1-280` 展示了 skill 目录可同时包含 `SKILL.md` 与辅助脚本（如 `server.js`）的结构。
- 仓库文档要求 prompt 以能力/角色描述为主，避免绑定 Claude 特有工具或固定 agent 名称，并明确部署后的 OpenCode command 只保留 `description` frontmatter，见 `AGENTS.md:7-24`。

### Available Approaches
- **Command markdown 入口**：继续以 `plugin/commands/*.md` 定义具体 workflow 步骤，再由部署产物和 `/command` 入口触发，见 `plugin/commands/research.md:1-142`。
- **CLI prompt 生成入口**：通过 `zest-dev prompt <command>` 读取 command markdown，并将其作为普通 prompt 提供给编辑器或代理，见 `bin/zest-dev.js:230-244`、`lib/prompt-generator.js:10-37`。
- **Skill 触发入口**：通过 `SKILL.md` 的 description 和正文方法论，让自然语言或特定短语直接触发 workflow/skill，见 `plugin/skills/zest-dev/SKILL.md:1-306`、`plugin/skills/debug-mode/SKILL.md:1-7`。

### Constraints & Dependencies
- command 与 skill 当前都依赖 `zest-dev` CLI 和 `specs/change/` 目录来读取 active spec、创建 spec、推进状态，见 `plugin/README.md:35-39`、`lib/spec-manager.js:153-180`。
- 现有命令式 workflow 明确约束各阶段顺序：`new → researched → designed → implemented`，而 `updateSpecStatus` 禁止回退状态，见 `lib/spec-manager.js:321-349`。
- 部署到 OpenCode 后，command 文档不能依赖 `allowed-tools`、`argument-hint` 等前端作者字段；相关信息需要通过正文表达，见 `AGENTS.md:19-24`、`lib/plugin-deployer.js:35-42`。
- prompt 编写规范要求使用通用的“explorer/architect/reviewer subagent”等角色语言，而非硬编码某个平台专属 agent 或工具名，见 `AGENTS.md:11-17`。
- 当前 `generatePrompt` 只接受固定 command 名称集合 `new/research/design/implement/summarize/archive`，说明 CLI prompt 入口本身有一层枚举式约束，见 `lib/prompt-generator.js:10-15`。

### Key References
- `bin/zest-dev.js:102-244` - CLI 对 spec 管理、plugin 部署和 prompt 生成的统一入口。
- `lib/spec-manager.js:99-131` - project status 与 active change spec 的解析逻辑。
- `lib/spec-manager.js:236-369` - active spec 设置和前进式状态迁移规则。
- `lib/prompt-generator.js:10-37` - 读取 command markdown、剥离 frontmatter、替换 `$ARGUMENTS` 的逻辑。
- `lib/plugin-deployer.js:35-42` - command 部署时仅保留 `description` frontmatter。
- `lib/plugin-deployer.js:122-173` - command 与 skill 的部署方式。
- `plugin/commands/new.md:16-138` - 从用户描述创建 spec 并写入 Overview 的现有流程。
- `plugin/commands/research.md:51-142` - 当前 research 阶段对探索、阅读、写回 spec 的要求。
- `plugin/commands/design.md:57-180` - 当前 design 阶段对澄清、架构综合与状态更新的定义。
- `plugin/commands/implement.md:38-85` - 当前 implement 阶段对按设计实现、记录 Notes、更新状态的定义。
- `plugin/commands/draft.md:93-145` - 对话到 spec，再选择后续 workflow 的桥接模式。
- `plugin/skills/zest-dev/SKILL.md:237-259` - skill 中已定义的 workflow 入口模型：step-by-step、vibe coding、discussion-driven。
- `AGENTS.md:11-24` - command prompt 的可移植性约束与通用角色写法规范。

## Design

<!-- Technical approach, architecture decisions -->

## Plan

<!-- Optional: Phase breakdown for complex features that need multiple implementation phases.
     Decided during Design. Checked off during Implement. -->

## Notes

<!-- Optional sections — add what's relevant. -->

### Implementation

<!-- Files created/modified, decisions made during coding, deviations from design -->

### Verification

<!-- How the feature was verified: tests written, manual testing steps, results -->
