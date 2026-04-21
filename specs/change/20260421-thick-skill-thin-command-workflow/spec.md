---
id: 20260421-thick-skill-thin-command-workflow
name: Thick Skill Thin Command Workflow
status: designed
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

### Architecture Overview

```text
自然语言 / /zest-dev:* / zest-dev prompt <command>
                    │
                    ▼
          plugin/commands/*.md（薄入口）
                    │
                    ▼
        plugin/skills/zest-dev/SKILL.md
        ├─ Phase: New
        ├─ Phase: Research
        ├─ Phase: Design
        └─ Phase: Implement
                    │
                    ▼
              zest-dev CLI
      (status/show/create/set-active/update/init)
                    │
                    ▼
              specs/change/*
```

### Why this design
- 以 `plugin/skills/zest-dev/SKILL.md` 作为核心 workflow 的唯一真源，收敛 `new / research / design / implement` 的阶段逻辑，减少当前 command 间的重复与漂移。
- `plugin/commands/new.md`、`plugin/commands/research.md`、`plugin/commands/design.md`、`plugin/commands/implement.md` 退化为薄入口，保留 command 兼容性，但不再承载完整流程。
- `zest-dev` CLI 继续只负责 spec 生命周期、prompt 兼容层和部署，不把 workflow 细节下沉到 CLI 中，保持与 `lib/spec-manager.js` 的状态机边界一致。
- 自然语言直触发主要依赖 skill 的 description 与 phase 路由说明，符合部署后 command frontmatter 只保留 `description` 的约束。

### Component Responsibilities
- **CLI (`bin/zest-dev.js`, `lib/spec-manager.js`)**
  - 负责 spec 的创建、读取、active 切换、状态更新、plugin 部署、prompt 输出。
  - 不负责阶段内的 agent 编排、澄清问题模板或 spec 内容写作策略。
- **Thin commands (`plugin/commands/{new,research,design,implement}.md`)**
  - 负责显式入口、阶段名称、参数透传和“进入 Zest Dev skill 对应 phase”的最小提示。
  - 不再包含完整步骤、重复规则和大段 workflow 说明。
- **Main skill (`plugin/skills/zest-dev/SKILL.md`)**
  - 负责自然语言触发、phase 路由、共享规则和四个核心阶段的完整 canonical workflow。
  - 统一语言规则、active spec 校验、何时提问、何时调用 CLI、各阶段写回 spec 的要求。
- **Specs (`specs/change/*/spec.md`)**
  - 负责承载 Overview / Research / Design / Plan / Notes，记录状态和设计结果。
  - 不承载 command 或 skill 的执行说明文本。
- **Deployer (`lib/plugin-deployer.js`)**
  - 继续负责把 source plugin 部署到 `.opencode/commands/` 与 `.opencode/skills/`。
  - 不承担 workflow 编排，仅做最小转换与复制。
- **Tests (`test/test-integration.js`)**
  - 负责锁定 command 兼容性、prompt 输出可用性、技能部署结果，以及“command 变薄 / skill 成为真源”的结构约束。

### Implementation Steps
1. **把 skill 升级为真源**
   - 重写 `plugin/skills/zest-dev/SKILL.md`，加入 phase 路由和四个核心阶段的完整流程定义。
   - 将通用规则（语言、状态校验、CLI-only frontmatter 更新、facts vs decisions）收敛到 skill 的共享部分。
2. **把核心 command 压薄**
   - 重写 `plugin/commands/new.md`、`research.md`、`design.md`、`implement.md` 为轻量入口。
   - 每个 command 只保留阶段目的、参数位和“调用主 skill 对应 phase”的说明。
3. **补齐 prompt 兼容层**
   - 调整 `lib/prompt-generator.js`，使其定位为“薄入口 prompt 生成器”，同时处理当前 command 枚举与仓库实际文件集合不一致的问题。
   - 保持 `zest-dev prompt <command>` 仍可作为兼容入口使用。
4. **清理组合型入口的依赖关系**
   - 更新 `plugin/commands/draft.md` 与 `quick-implement.md` 等组合入口，使其复用新的主 skill phase，而不是继续内嵌旧的厚流程。
5. **更新文档与测试**
   - 更新 `plugin/README.md` 与 `README.md`，明确“skill 是 workflow 真源，command 是兼容入口”。
   - 更新 `test/test-integration.js`，验证核心 command 仍部署、prompt 仍可用、skill 部署存在，以及 command 内容不再承载厚流程。

### Pseudocode
```text
When request arrives:
  If user uses /zest-dev:new|research|design|implement:
    Load thin command prompt
    Command tells agent to enter Zest Dev skill phase

  Else if user uses natural language matching Zest Dev:
    Trigger Zest Dev skill directly

Inside Zest Dev skill:
  Detect target phase from command context or user intent
  Verify active spec and required status for that phase
  Ask clarifying questions when required
  Read spec and relevant codebase context
  Execute phase-specific workflow
  Use zest-dev CLI for spec creation / status transitions
  Write results back into spec sections
  Return next-step guidance
```

### File Structure
- `plugin/skills/zest-dev/SKILL.md` - 核心 workflow 真源，承载 phase 路由与四个核心阶段逻辑。
- `plugin/commands/new.md` - new 阶段的薄入口。
- `plugin/commands/research.md` - research 阶段的薄入口。
- `plugin/commands/design.md` - design 阶段的薄入口。
- `plugin/commands/implement.md` - implement 阶段的薄入口。
- `plugin/commands/draft.md` - 组合入口，改为桥接到主 skill phase。
- `plugin/commands/quick-implement.md` - 组合入口，改为串联主 skill phase。
- `lib/prompt-generator.js` - prompt 兼容层，输出薄 command prompt。
- `plugin/README.md` - plugin 层工作流说明与入口说明。
- `README.md` - 仓库对外使用说明。
- `test/test-integration.js` - command/skill 部署、prompt 输出与架构约束测试。

### Interfaces / APIs
- **CLI → Skill / Command**
  - `zest-dev status`
  - `zest-dev show <spec-id|active>`
  - `zest-dev create <slug>`
  - `zest-dev set-active <spec-id>`
  - `zest-dev update <spec-id|active> <status>`
  - `zest-dev prompt <command> [args...]`
- **Command → Skill**
  - command prompt 不再直接描述完整工作流，而是声明当前 phase，并要求进入 Zest Dev skill 的对应 phase。
- **Skill → Spec**
  - 通过 CLI 更新 status；通过编辑 spec 正文填充 Overview / Research / Design / Notes。

### Edge Cases
- **没有 active spec**：`research / design / implement` phase 必须先中止并引导用户创建或设置 active spec。
- **status 不匹配**：主 skill 必须按阶段校验 `new / researched / designed` 前置状态，避免绕过既有状态机约束。
- **自然语言触发不精确**：skill description 需要覆盖 phase 触发词和“create spec / research phase / design architecture / implement feature”等意图，降低误触发或漏触发概率。
- **prompt 兼容入口枚举漂移**：`lib/prompt-generator.js` 的命令集合需要与实际 command 文件集合保持一致，避免迁移后出现入口存在但 prompt 不支持的情况。
- **部署后 frontmatter 被裁剪**：不能依赖 deployed command 的 `argument-hint` 或其他 frontmatter 字段，相关上下文必须写进正文或 skill 中。
- **一次性迁移的回归面**：`draft`、`quick-implement` 等组合入口如果仍内嵌旧逻辑，会与主 skill 真源产生再次漂移，需同轮对齐。

### Alternatives Considered
- 保持“厚 command、薄 skill”：会继续把 workflow 真源放在多个 command 文件中，不能解决漂移问题。
- 为每个 phase 单独拆分 skill：会重复共享规则，并增加 phase 间一致性维护成本。
- 把更多 workflow 下沉到 CLI：会把 AI workflow 与本地状态机耦合，削弱自然语言直触发能力。

## Plan

- [ ] Phase 1: 将核心 workflow 真源迁移到 `plugin/skills/zest-dev/SKILL.md`，并压薄 `new/research/design/implement` commands。
- [ ] Phase 2: 对齐 prompt 兼容层、组合入口、文档与集成测试，确保一次性迁移后的行为一致性。

## Notes

<!-- Optional sections — add what's relevant. -->

### Implementation

<!-- Files created/modified, decisions made during coding, deviations from design -->

### Verification

<!-- How the feature was verified: tests written, manual testing steps, results -->
