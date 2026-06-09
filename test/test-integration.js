const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { execSync } = require('child_process');
const yaml = require('js-yaml');
const { FINAL_RALPH_TASK } = require('../lib/ralph-setup');

const PACKAGE_CLI_BIN = process.env.ZEST_DEV_CLI_PATH
  ? path.join(
      process.env.ZEST_DEV_CLI_PATH,
      'node_modules',
      '.bin',
      process.platform === 'win32' ? 'zest-dev.cmd' : 'zest-dev'
    )
  : null;

const CLI_COMMAND = process.env.ZEST_DEV_CLI_PATH
  ? `"${PACKAGE_CLI_BIN}"`
  : `node ${path.join(__dirname, '../bin/zest-dev.js')}`;

const TEST_DIR = path.join(__dirname, '../test-project-temp');
const CREATE_TEST_DIR = path.join(__dirname, '../test-project-create-temp');
const EXPECTED_COMMANDS = [
  'zest-dev-compound.md',
  'zest-dev-design.md',
  'zest-dev-implement.md',
  'zest-dev-new.md',
  'zest-dev-plan.md',
  'zest-dev-quick-implement.md',
  'zest-dev-research.md'
];
const THIN_COMMANDS = [
  'zest-dev-new.md',
  'zest-dev-research.md',
  'zest-dev-design.md',
  'zest-dev-plan.md',
  'zest-dev-implement.md',
  'zest-dev-quick-implement.md'
];
const SKILL_PHASE_FILES = ['new.md', 'research.md', 'design.md', 'plan.md', 'implement.md'];
const CODEX_SUBAGENTS = ['code-architect.toml', 'code-explorer.toml', 'code-reviewer.toml'];
function cleanup(testDir = TEST_DIR) {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}

function setup(testDir = TEST_DIR) {
  cleanup(testDir);
  fs.mkdirSync(testDir, { recursive: true });
}

function runCommand(command, cwd = TEST_DIR) {
  return runCommandWithEnv(command, cwd);
}

function runCommandWithEnv(command, cwd = TEST_DIR, env = {}) {
  try {
    return execSync(`${CLI_COMMAND} ${command}`, {
      cwd,
      encoding: 'utf-8',
      env: { ...process.env, ...env }
    });
  } catch (error) {
    const details = [error.message, error.stdout, error.stderr].filter(Boolean).join('\n');
    throw new Error(`zest-dev ${command} failed:\n${details}`);
  }
}

function runInit(cwd = TEST_DIR, env = {}) {
  return runCommandWithEnv('init', cwd, env);
}

function runInitArgs(args, cwd = TEST_DIR, env = {}) {
  return runCommandWithEnv(`init ${args}`.trim(), cwd, env);
}

function runCommandExpectFailure(command, cwd = TEST_DIR, env = {}) {
  try {
    execSync(`${CLI_COMMAND} ${command}`, {
      cwd,
      encoding: 'utf-8',
      stdio: 'pipe',
      env: { ...process.env, ...env }
    });
    return { failed: false, output: '' };
  } catch (error) {
    return {
      failed: true,
      output: [error.stdout, error.stderr, error.message].filter(Boolean).join('\n')
    };
  }
}

function runCreate(slug, cwd = TEST_DIR) {
  return runCommand(`create ${slug}`, cwd);
}

function runUpdate(spec, status, cwd = TEST_DIR) {
  return runCommand(`update ${spec} ${status}`, cwd);
}

function readCommand(target, filename, testDir = TEST_DIR) {
  return fs.readFileSync(path.join(testDir, target, 'commands', filename), 'utf-8');
}

function makeIsolatedGlobalEnv(testDir = TEST_DIR) {
  const homeDir = path.join(testDir, 'fake-home');
  const xdgConfigHome = path.join(testDir, 'fake-xdg-config');
  fs.mkdirSync(homeDir, { recursive: true });
  fs.mkdirSync(xdgConfigHome, { recursive: true });
  return { HOME: homeDir, XDG_CONFIG_HOME: xdgConfigHome };
}

function extractFrontmatter(content, filename) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(match, `${filename} has no frontmatter`);
  const frontmatter = yaml.load(match[1]);
  assert.equal(typeof frontmatter, 'object', `${filename} frontmatter should be an object`);
  return frontmatter;
}

function assertPluginResourceSymlinkAt(rootDir, name) {
  const pluginPath = path.join(rootDir, 'plugin', name);
  const topLevelPath = path.join(rootDir, name);
  const stat = fs.lstatSync(pluginPath);

  assert.ok(stat.isSymbolicLink(), `plugin/${name} should be a symlink`);
  assert.equal(fs.realpathSync(pluginPath), fs.realpathSync(topLevelPath));
}

function getPackagedCliRoot() {
  if (!PACKAGE_CLI_BIN) {
    return null;
  }

  const realCliBin = fs.realpathSync(PACKAGE_CLI_BIN);
  return path.join(path.dirname(realCliBin), '..');
}

function createDanglingActiveSymlink(targetId, testDir = TEST_DIR) {
  const activeLinkPath = path.join(testDir, 'specs/change/active');

  try {
    fs.lstatSync(activeLinkPath);
    fs.unlinkSync(activeLinkPath);
  } catch (error) {
    // ignore: link does not exist
  }

  fs.symlinkSync(targetId, activeLinkPath);
}

function createActiveSpecWithBody(slug, body, testDir = TEST_DIR) {
  const result = yaml.load(runCreate(slug, testDir));
  const specPath = path.join(testDir, result.spec.path);
  fs.writeFileSync(specPath, body, 'utf-8');
  runCommand(`set-active ${result.spec.id}`, testDir);
  return { id: result.spec.id, path: specPath };
}

function makeFakeRalphEnv(testDir = TEST_DIR) {
  const fakeBinDir = path.join(testDir, 'fake-bin');
  const logPath = path.join(testDir, 'ralph-args.log');
  const fakeRalphPath = path.join(fakeBinDir, 'ralph');

  fs.mkdirSync(fakeBinDir, { recursive: true });
  fs.writeFileSync(
    fakeRalphPath,
    `#!/usr/bin/env node
const fs = require('fs');
if (process.argv[2] !== '--add-task' || process.argv.length !== 4) {
  console.error('unexpected ralph args: ' + process.argv.slice(2).join(' '));
  process.exit(2);
}
fs.appendFileSync(process.env.RALPH_LOG_PATH, JSON.stringify(process.argv[3]) + '\\n');
fs.mkdirSync('.ralph', { recursive: true });
fs.appendFileSync('.ralph/ralph-tasks.md', '- [ ] ' + process.argv[3] + '\\n');
console.log('Added task: ' + process.argv[3]);
`,
    'utf-8'
  );
  fs.chmodSync(fakeRalphPath, 0o755);

  return {
    PATH: `${fakeBinDir}${path.delimiter}${process.env.PATH}`,
    RALPH_LOG_PATH: logPath
  };
}

function readFakeRalphTasks(testDir = TEST_DIR) {
  const logPath = path.join(testDir, 'ralph-args.log');
  return fs.readFileSync(logPath, 'utf-8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

test('zest-dev init integration', async (t) => {
  setup();

  try {
    await t.test('plugin resource directories are compatibility symlinks', () => {
      for (const name of ['commands', 'skills', 'agents']) {
        assertPluginResourceSymlinkAt(path.join(__dirname, '..'), name);
      }
    });

    await t.test('packaged plugin resource directories are compatibility symlinks', { skip: !PACKAGE_CLI_BIN }, () => {
      const packageRoot = getPackagedCliRoot();
      for (const name of ['commands', 'skills', 'agents']) {
        assertPluginResourceSymlinkAt(packageRoot, name);
      }
    });

    const globalEnv = makeIsolatedGlobalEnv();
    const fakeHome = globalEnv.HOME;
    const fakeXdgConfigHome = globalEnv.XDG_CONFIG_HOME;
    const globalOpenCodeBase = path.join(fakeXdgConfigHome, 'opencode');
    const globalOpenCodeCommandsDir = path.join(globalOpenCodeBase, 'commands');
    const globalOpenCodeSkillsDir = path.join(globalOpenCodeBase, 'skills');
    const globalCodexSkillsDir = path.join(fakeHome, '.agents/skills/zest-dev');
    const globalCodexAgentsDir = path.join(fakeHome, '.codex/agents');
    const localOpenCodeCommandsDir = path.join(TEST_DIR, '.opencode/commands');
    const localOpenCodeSkillsDir = path.join(TEST_DIR, '.opencode/skills');
    const localCodexSkillsDir = path.join(TEST_DIR, '.agents/skills/zest-dev');
    const localCodexAgentsDir = path.join(TEST_DIR, '.codex/agents');
    const firstRunOutput = runInit(TEST_DIR, globalEnv);

    await t.test('default global init output format', () => {
      const result = yaml.load(firstRunOutput);

      assert.equal(result.ok, true);
      assert.equal(result.scope, 'global');
      assert.equal(result.target, 'all');
      assert.equal(result.cursor, undefined);
      assert.equal(result.opencode.baseDir, globalOpenCodeBase);
      assert.equal(result.codex.baseDir, fakeHome);
      assert.deepEqual(result.codex.commands, []);
      assert.deepEqual(result.opencode.agents, []);
      assert.deepEqual(result.opencode.commands, EXPECTED_COMMANDS);
      assert.deepEqual(result.codex.agents, CODEX_SUBAGENTS);
    });

    await t.test('default global init deploys opencode and codex artifacts', () => {
      assert.ok(fs.existsSync(globalOpenCodeCommandsDir));
      assert.ok(fs.existsSync(globalOpenCodeSkillsDir));
      assert.ok(fs.existsSync(globalCodexSkillsDir));
      assert.ok(fs.existsSync(globalCodexAgentsDir));
      assert.equal(fs.existsSync(localOpenCodeCommandsDir), false);
      assert.equal(fs.existsSync(localCodexAgentsDir), false);

      for (const file of EXPECTED_COMMANDS) {
        assert.ok(fs.existsSync(path.join(globalOpenCodeCommandsDir, file)), `global OpenCode command should exist: ${file}`);
      }

      const subagents = fs.readdirSync(globalCodexAgentsDir).sort();
      assert.deepEqual(subagents, CODEX_SUBAGENTS);
      assert.equal(fs.existsSync(path.join(globalCodexSkillsDir, 'commands')), false, 'codex skill should not contain command prompt files');
      assert.equal(fs.existsSync(path.join(TEST_DIR, '.cursor')), false);
      assert.equal(fs.existsSync(path.join(TEST_DIR, 'AGENTS.md')), false);
    });

    await t.test('default global init preserves opencode content rules', () => {
      for (const file of EXPECTED_COMMANDS) {
        const content = fs.readFileSync(path.join(globalOpenCodeCommandsDir, file), 'utf-8');
        assert.ok(content.startsWith('---\n'), `deployed command should preserve markdown frontmatter: ${file}`);
      }

      const content = fs.readFileSync(path.join(globalOpenCodeCommandsDir, 'zest-dev-new.md'), 'utf-8');
      const frontmatter = extractFrontmatter(content, 'zest-dev-new.md');
      assert.ok(frontmatter.description);
      assert.equal(frontmatter['argument-hint'], undefined);
      assert.equal(frontmatter['allowed-tools'], undefined);
      assert.equal(Object.keys(frontmatter).length, 1);

      for (const file of ['zest-dev-new.md', 'zest-dev-research.md', 'zest-dev-design.md', 'zest-dev-plan.md', 'zest-dev-implement.md']) {
        const body = fs.readFileSync(path.join(globalOpenCodeCommandsDir, file), 'utf-8');
        assert.ok(body.includes('$ARGUMENTS'));
      }

      for (const file of THIN_COMMANDS) {
        const thinContent = fs.readFileSync(path.join(globalOpenCodeCommandsDir, file), 'utf-8');
        assert.equal(thinContent.includes('**Step 1:'), false);
      }
    });

    await t.test('global skills content and codex toml content are preserved', () => {
      const opencodeSkillPath = path.join(globalOpenCodeSkillsDir, 'zest-dev/SKILL.md');
      assert.ok(fs.existsSync(opencodeSkillPath));
      const skillContent = fs.readFileSync(opencodeSkillPath, 'utf-8');
      assert.ok(skillContent.includes('This skill defines the workflow for planned feature work'));
      assert.ok(skillContent.includes('always include a final documentation follow-up step'));

      for (const file of SKILL_PHASE_FILES) {
        assert.ok(fs.existsSync(path.join(globalOpenCodeSkillsDir, 'zest-dev', file)));
      }

      const researchPhase = fs.readFileSync(path.join(globalOpenCodeSkillsDir, 'zest-dev/research.md'), 'utf-8');
      assert.ok(researchPhase.includes('Summarize your understanding of the request and confirm it with the user'));

      const designPhase = fs.readFileSync(path.join(globalOpenCodeSkillsDir, 'zest-dev/design.md'), 'utf-8');
      assert.ok(designPhase.includes('If the status is `designed`, `planned`, or `implemented`, confirm that the user wants to revise the existing design before continuing.'));

      const planPhase = fs.readFileSync(path.join(globalOpenCodeSkillsDir, 'zest-dev/plan.md'), 'utf-8');
      assert.ok(planPhase.includes('If the spec started as `designed`, run `zest-dev update active planned`.'));
      assert.ok(planPhase.includes('Use the slicing spirit of Matt Pocock\'s registered `to-issues` skill as a reference for scale and sequencing.'));
      assert.ok(planPhase.includes('Do not create GitHub issues or external issue-tracker entries unless the user explicitly asks for that.'));
      assert.ok(planPhase.includes('Do not use markdown checkboxes in `## Plan`.'));
      assert.ok(planPhase.includes('Add or update `spec.md` → `## Progress` with a thin progress checklist:'));
      assert.ok(planPhase.includes('Report every Plan step\'s `Type` as `AFK` or `HITL`.'));
      assert.ok(planPhase.includes('For each `HITL` step, tell the user what needs to be discussed, reviewed, judged, or approved in conversation before implementation continues.'));

      const implementPhase = fs.readFileSync(path.join(globalOpenCodeSkillsDir, 'zest-dev/implement.md'), 'utf-8');
      assert.ok(implementPhase.includes('try to use the registered `tdd` skill'));
      assert.ok(implementPhase.includes('judge applicability from the spec, plan step, and files being changed'));
      assert.ok(implementPhase.includes('mark the corresponding `spec.md` → `## Progress` checkbox as `[x]`'));
      assert.equal(implementPhase.includes('mark the corresponding `## Plan` checkbox'), false);

      const codexSkillFile = fs.readFileSync(path.join(globalCodexSkillsDir, 'SKILL.md'), 'utf-8');
      assert.ok(codexSkillFile.includes('This skill defines the workflow for planned feature work'));

      for (const subagent of CODEX_SUBAGENTS) {
        const tomlContent = fs.readFileSync(path.join(globalCodexAgentsDir, subagent), 'utf-8');
        assert.ok(tomlContent.includes('name = '));
        assert.ok(tomlContent.includes('developer_instructions = '));
      }
    });

    await t.test('explicit --global matches default behavior', () => {
      const explicitGlobal = yaml.load(runInitArgs('--global', TEST_DIR, globalEnv));
      assert.equal(explicitGlobal.scope, 'global');
      assert.equal(explicitGlobal.target, 'all');
      assert.deepEqual(fs.readdirSync(globalOpenCodeCommandsDir).sort(), EXPECTED_COMMANDS);
    });

    await t.test('global init removes only known legacy opencode agent files', () => {
      const agentsDir = path.join(globalOpenCodeBase, 'agents');
      const staleLegacyFile = path.join(agentsDir, 'code-explorer.md');
      const nonLegacyTopLevelFile = path.join(agentsDir, 'my-custom-agent.md');
      const nestedDir = path.join(agentsDir, 'nested-dir');

      fs.mkdirSync(nestedDir, { recursive: true });
      fs.writeFileSync(staleLegacyFile, '# stale legacy agent', 'utf-8');
      fs.writeFileSync(nonLegacyTopLevelFile, '# user agent', 'utf-8');

      const rerunOutput = yaml.load(runInit(TEST_DIR, globalEnv));
      assert.equal(rerunOutput.ok, true);
      assert.equal(fs.existsSync(staleLegacyFile), false);
      assert.ok(fs.existsSync(nonLegacyTopLevelFile));
      assert.ok(fs.existsSync(agentsDir));
      assert.ok(fs.existsSync(nestedDir));
    });

    await t.test('global init is idempotent', () => {
      const secondRun = yaml.load(runInit(TEST_DIR, globalEnv));
      assert.equal(secondRun.ok, true);
      assert.equal(fs.readdirSync(globalOpenCodeCommandsDir).length, EXPECTED_COMMANDS.length);
      assert.deepEqual(fs.readdirSync(globalCodexAgentsDir).sort(), CODEX_SUBAGENTS);
    });

    await t.test('local init defaults to opencode only', () => {
      const localOutput = yaml.load(runInitArgs('--local', TEST_DIR, globalEnv));
      assert.equal(localOutput.scope, 'local');
      assert.equal(localOutput.target, 'opencode');
      assert.equal(localOutput.opencode.baseDir, TEST_DIR);
      assert.equal(localOutput.codex.baseDir, TEST_DIR);
      assert.ok(fs.existsSync(localOpenCodeCommandsDir));
      assert.ok(fs.existsSync(localOpenCodeSkillsDir));
      assert.equal(fs.existsSync(localCodexSkillsDir), false);
      assert.equal(fs.existsSync(localCodexAgentsDir), false);
    });

    await t.test('local codex target deploys codex-only layout without command prompts', () => {
      const codexOutput = yaml.load(runInitArgs('--local --target codex', TEST_DIR, globalEnv));
      assert.equal(codexOutput.scope, 'local');
      assert.equal(codexOutput.target, 'codex');
      assert.deepEqual(codexOutput.opencode.commands, []);
      assert.ok(fs.existsSync(localCodexSkillsDir));
      assert.ok(fs.existsSync(localCodexAgentsDir));
      assert.deepEqual(fs.readdirSync(localCodexAgentsDir).sort(), CODEX_SUBAGENTS);
      assert.equal(fs.existsSync(path.join(localCodexSkillsDir, 'commands')), false);
    });

    await t.test('codex init removes legacy zest command prompts and preserves user command files', () => {
      const legacyCommandsDir = path.join(localCodexSkillsDir, 'commands');
      const legacyZestCommand = path.join(legacyCommandsDir, 'zest-dev-new.md');
      const userCommand = path.join(legacyCommandsDir, 'my-command.md');

      fs.mkdirSync(legacyCommandsDir, { recursive: true });
      fs.writeFileSync(legacyZestCommand, '# legacy zest command', 'utf-8');
      fs.writeFileSync(userCommand, '# user command', 'utf-8');

      const codexOutput = yaml.load(runInitArgs('--local --target codex', TEST_DIR, globalEnv));
      assert.equal(codexOutput.ok, true);
      assert.equal(fs.existsSync(legacyZestCommand), false);
      assert.ok(fs.existsSync(userCommand));
    });

    await t.test('local all target deploys opencode and codex without codex command prompts', () => {
      const localAllDir = path.join(TEST_DIR, 'local-all');
      setup(localAllDir);
      const localAllEnv = makeIsolatedGlobalEnv(localAllDir);
      const localAll = yaml.load(runInitArgs('--local --target all', localAllDir, localAllEnv));

      assert.equal(localAll.scope, 'local');
      assert.equal(localAll.target, 'all');
      assert.ok(fs.existsSync(path.join(localAllDir, '.opencode/commands')));
      assert.ok(fs.existsSync(path.join(localAllDir, '.opencode/skills')));
      assert.ok(fs.existsSync(path.join(localAllDir, '.agents/skills/zest-dev')));
      assert.ok(fs.existsSync(path.join(localAllDir, '.codex/agents')));
      assert.equal(fs.existsSync(path.join(localAllDir, '.agents/skills/zest-dev/commands')), false);
    });

    await t.test('target-specific global deploys only requested platform', () => {
      const opencodeOnlyDir = path.join(TEST_DIR, 'opencode-only');
      setup(opencodeOnlyDir);
      const opencodeOnlyEnv = makeIsolatedGlobalEnv(opencodeOnlyDir);
      const opencodeOnly = yaml.load(runInitArgs('--target opencode', opencodeOnlyDir, opencodeOnlyEnv));
      assert.equal(opencodeOnly.target, 'opencode');
      assert.equal(opencodeOnly.codex.baseDir, null);
      assert.ok(fs.existsSync(path.join(opencodeOnlyEnv.XDG_CONFIG_HOME, 'opencode/commands')));
      assert.equal(fs.existsSync(path.join(opencodeOnlyEnv.HOME, '.codex/agents')), false);

      const codexOnlyDir = path.join(TEST_DIR, 'codex-only');
      setup(codexOnlyDir);
      const codexOnlyEnv = makeIsolatedGlobalEnv(codexOnlyDir);
      const codexOnly = yaml.load(runInitArgs('--target codex', codexOnlyDir, codexOnlyEnv));
      assert.equal(codexOnly.target, 'codex');
      assert.equal(codexOnly.opencode.baseDir, null);
      assert.ok(fs.existsSync(path.join(codexOnlyEnv.HOME, '.codex/agents')));
      assert.equal(fs.existsSync(path.join(codexOnlyEnv.XDG_CONFIG_HOME, 'opencode/commands')), false);

      const opencodeWithoutHomeDir = path.join(TEST_DIR, 'opencode-without-home');
      setup(opencodeWithoutHomeDir);
      const opencodeWithoutHomeEnv = {
        HOME: '',
        XDG_CONFIG_HOME: path.join(opencodeWithoutHomeDir, 'xdg-config')
      };
      const opencodeWithoutHome = yaml.load(runInitArgs('--target opencode', opencodeWithoutHomeDir, opencodeWithoutHomeEnv));
      assert.equal(opencodeWithoutHome.target, 'opencode');
      assert.ok(fs.existsSync(path.join(opencodeWithoutHomeEnv.XDG_CONFIG_HOME, 'opencode/commands')));

      const codexWithRelativeXdgDir = path.join(TEST_DIR, 'codex-with-relative-xdg');
      setup(codexWithRelativeXdgDir);
      const codexWithRelativeXdgEnv = {
        HOME: path.join(codexWithRelativeXdgDir, 'home'),
        XDG_CONFIG_HOME: 'relative-config'
      };
      fs.mkdirSync(codexWithRelativeXdgEnv.HOME, { recursive: true });
      const codexWithRelativeXdg = yaml.load(runInitArgs('--target codex', codexWithRelativeXdgDir, codexWithRelativeXdgEnv));
      assert.equal(codexWithRelativeXdg.target, 'codex');
      assert.ok(fs.existsSync(path.join(codexWithRelativeXdgEnv.HOME, '.codex/agents')));
      assert.equal(fs.existsSync(path.join(codexWithRelativeXdgDir, 'relative-config')), false);
    });

    await t.test('invalid target fails before writes', () => {
      const invalidDir = path.join(TEST_DIR, 'invalid-target');
      setup(invalidDir);
      const invalidEnv = makeIsolatedGlobalEnv(invalidDir);
      const failed = runCommandExpectFailure('init --target invalid', invalidDir, invalidEnv);
      assert.equal(failed.failed, true);
      assert.ok(failed.output.includes('Invalid target: invalid. Expected one of: all, opencode, codex'));
      assert.equal(fs.existsSync(path.join(invalidEnv.XDG_CONFIG_HOME, 'opencode')), false);
      assert.equal(fs.existsSync(path.join(invalidEnv.HOME, '.codex')), false);
    });

    await t.test('conflicting scope flags fail before writes', () => {
      const conflictingDir = path.join(TEST_DIR, 'conflicting-scope');
      setup(conflictingDir);
      const conflictingEnv = makeIsolatedGlobalEnv(conflictingDir);
      const failed = runCommandExpectFailure('init --global --local', conflictingDir, conflictingEnv);
      assert.equal(failed.failed, true);
      assert.ok(failed.output.includes('Cannot specify both --global and --local'));
      assert.equal(fs.existsSync(path.join(conflictingDir, '.opencode')), false);
      assert.equal(fs.existsSync(path.join(conflictingEnv.XDG_CONFIG_HOME, 'opencode')), false);
    });

    await t.test('relative global environment paths fail before writes', () => {
      const relativeEnvDir = path.join(TEST_DIR, 'relative-env');
      setup(relativeEnvDir);

      const relativeXdg = runCommandExpectFailure(
        'init',
        relativeEnvDir,
        { HOME: path.join(relativeEnvDir, 'home'), XDG_CONFIG_HOME: 'relative-config' }
      );
      assert.equal(relativeXdg.failed, true);
      assert.ok(relativeXdg.output.includes('XDG_CONFIG_HOME must be an absolute path: relative-config'));
      assert.equal(fs.existsSync(path.join(relativeEnvDir, 'relative-config')), false);

      const relativeHome = runCommandExpectFailure(
        'init',
        relativeEnvDir,
        { HOME: 'relative-home', XDG_CONFIG_HOME: '' }
      );
      assert.equal(relativeHome.failed, true);
      assert.ok(relativeHome.output.includes('HOME must be an absolute path: relative-home'));
      assert.equal(fs.existsSync(path.join(relativeEnvDir, 'relative-home')), false);
    });
  } finally {
    cleanup();
  }
});

test('zest-dev create integration', async (t) => {
  setup(CREATE_TEST_DIR);

  try {
    await t.test('default template fallback', () => {
      const output = runCreate('default-template', CREATE_TEST_DIR);
      const result = yaml.load(output);
      assert.equal(result.ok, true, 'create command should succeed');

      const specId = result.spec.id;
      assert.ok(/^\d{8}-default-template$/.test(specId), `spec id should be date-based, got: ${specId}`);

      const specDir = path.join(CREATE_TEST_DIR, `specs/change/${specId}`);
      const specPath = path.join(specDir, 'spec.md');
      const designPath = path.join(specDir, 'design.md');
      const stepsPath = path.join(specDir, 'steps.md');
      assert.ok(fs.existsSync(specPath), 'spec file should exist');
      assert.ok(fs.existsSync(designPath), 'design file should exist');
      assert.ok(fs.existsSync(stepsPath), 'steps file should exist');

      const content = fs.readFileSync(specPath, 'utf-8');
      const designContent = fs.readFileSync(designPath, 'utf-8');
      const stepsContent = fs.readFileSync(stepsPath, 'utf-8');
      const frontmatter = extractFrontmatter(content, `specs/change/${specId}/spec.md`);

      assert.ok(/^\d{8}-default-template$/.test(frontmatter.id), `frontmatter.id should be date-based, got: ${frontmatter.id}`);
      assert.equal(frontmatter.name, 'Default Template');
      assert.equal(frontmatter.status, 'new');
      assert.equal(typeof frontmatter.created, 'string');
      assert.ok(content.includes('## Overview'), 'should use packaged default template');
      assert.ok(content.includes('## Research'), 'should include Research section');
      assert.ok(content.includes('See [design.md](./design.md).'), 'should reference design file naturally');
      assert.ok(content.includes('## Design'), 'should include Design section');
      assert.ok(content.includes('## Plan'), 'should include Plan section');
      assert.ok(content.includes('## Progress'), 'should include Progress section');
      assert.ok(content.includes('## Implementation'), 'should include Implementation section');
      assert.ok(content.includes('See [steps.md](./steps.md).'), 'should reference steps file naturally');
      assert.equal(
        content.includes('Optional completion checklist, created during Plan and updated during Implement.'),
        false,
        'Progress section should not include a non-checkbox placeholder that Ralph rejects'
      );
      assert.ok(
        content.includes('Optional implementation step breakdown, created during Plan.'),
        'packaged default template should keep Plan guidance brief'
      );
      assert.equal(content.includes('Use markdown checkboxes for all step and substep items'), false);
      assert.equal(content.includes('Substep 1.1 Implement'), false);
      assert.equal(content.includes('## Notes'), false);
      assert.ok(designContent.includes('## Research'), 'design template should include Research section');
      assert.ok(designContent.includes('## Design'), 'design template should include Design section');
      assert.ok(stepsContent.includes('## Step 1'), 'steps template should include an initial step section');
      assert.equal(stepsContent.includes('## Implementation'), false, 'steps template should not split implementation globally');
      assert.equal(stepsContent.includes('## Verification'), false, 'steps template should not split verification globally');
      assert.equal(content.includes('Phase 3: Test and verify'), false);
      assert.equal(content.includes('{name}'), false);
      assert.equal(content.includes('{date}'), false);
      assert.equal(designContent.includes('{name}'), false);
      assert.equal(stepsContent.includes('{date}'), false);
    });

    await t.test('custom template override is ignored', () => {
      const customTemplatePath = path.join(CREATE_TEST_DIR, '.zest-dev/template/spec.md');
      fs.mkdirSync(path.dirname(customTemplatePath), { recursive: true });
      fs.writeFileSync(
        customTemplatePath,
        `---
name: "{name}"
status: custom
created: "{date}"
---

# Custom Spec

Token: {name}|{date}
`,
        'utf-8'
      );

      const output = runCreate('custom-template', CREATE_TEST_DIR);
      const result = yaml.load(output);
      assert.equal(result.ok, true, 'create command should succeed while ignoring custom template');

      const specId = result.spec.id;
      assert.ok(/^\d{8}-custom-template$/.test(specId), `spec id should be date-based, got: ${specId}`);

      const specDir = path.join(CREATE_TEST_DIR, `specs/change/${specId}`);
      const specPath = path.join(specDir, 'spec.md');
      assert.ok(fs.existsSync(specPath), 'spec file should exist');
      assert.ok(fs.existsSync(path.join(specDir, 'design.md')), 'design file should exist');
      assert.ok(fs.existsSync(path.join(specDir, 'steps.md')), 'steps file should exist');

      const content = fs.readFileSync(specPath, 'utf-8');
      const frontmatter = extractFrontmatter(content, `specs/change/${specId}/spec.md`);

      assert.ok(/^\d{8}-custom-template$/.test(frontmatter.id), `frontmatter.id should be date-based, got: ${frontmatter.id}`);
      assert.equal(frontmatter.name, 'Custom Template');
      assert.equal(frontmatter.status, 'new');
      assert.equal(content.includes('# Custom Spec'), false);
      assert.ok(content.includes('## Overview'), 'should use built-in template');
      assert.equal(content.includes('{name}'), false);
      assert.equal(content.includes('{date}'), false);
      assert.equal(content.includes('Token: Custom Template|'), false);
    });
  } finally {
    cleanup(CREATE_TEST_DIR);
  }
});

test('zest-dev status integration', async (t) => {
  setup();

  try {
    const statusEnv = makeIsolatedGlobalEnv(path.join(TEST_DIR, 'status-env'));
    const runStatus = () => runCommandWithEnv('status', TEST_DIR, statusEnv);

    runCreate('first-spec');
    runCreate('second-spec');

    await t.test('active_change is null when not set', () => {
      const status = yaml.load(runStatus());
      assert.equal(status.specs_count, 2);
      assert.equal(status.active_change, null);
      assert.equal(status.agent_hints, undefined);
    });

    await t.test('active_change is an object when set', () => {
      // Use the fact that both specs were created today — find by slug suffix.
      const specs = fs.readdirSync(path.join(TEST_DIR, 'specs/change'))
        .filter(d => /^\d{8}-/.test(d));
      const secondSpecDir = specs.find(d => d.endsWith('-second-spec'));
      assert.ok(secondSpecDir, 'second-spec directory should exist');

      runCommand(`set-active ${secondSpecDir}`);
      const status = yaml.load(runStatus());

      assert.equal(status.specs_count, 2);
      assert.equal(typeof status.active_change, 'object');
      assert.equal(status.active_change.id, secondSpecDir);
      assert.equal(status.active_change.name, 'Second Spec');
      assert.equal(status.active_change.path, path.join('specs/change', secondSpecDir, 'spec.md'));
      assert.equal(status.active_change.status, 'new');
      assert.equal(status.agent_hints, undefined);
      assert.ok(fs.existsSync(path.join(TEST_DIR, 'specs/change', secondSpecDir, 'design.md')));
      assert.ok(fs.existsSync(path.join(TEST_DIR, 'specs/change', secondSpecDir, 'steps.md')));
    });

    await t.test('legacy README-backed spec remains readable and updatable', () => {
      const legacySpecId = '20240101-legacy-spec';
      const legacySpecDir = path.join(TEST_DIR, 'specs/change', legacySpecId);
      const legacyReadmePath = path.join(legacySpecDir, 'README.md');

      fs.mkdirSync(legacySpecDir, { recursive: true });
      fs.writeFileSync(
        legacyReadmePath,
        `---
id: "${legacySpecId}"
name: "Legacy Spec"
status: designed
created: "2024-01-01"
---

## Overview
`,
        'utf-8'
      );

      runCommand(`set-active ${legacySpecId}`);

      const status = yaml.load(runStatus());
      assert.equal(status.specs_count, 3);
      assert.equal(status.active_change.id, legacySpecId);
      assert.equal(status.active_change.path, path.join('specs/change', legacySpecId, 'README.md'));
      assert.equal(status.active_change.status, 'designed');

      const updateResult = yaml.load(runCommand(`update ${legacySpecId} implemented`));
      assert.equal(updateResult.ok, true);
      assert.equal(updateResult.spec.id, legacySpecId);
      assert.equal(updateResult.status.from, 'designed');
      assert.equal(updateResult.status.to, 'implemented');

      const updatedContent = fs.readFileSync(legacyReadmePath, 'utf-8');
      const updatedFrontmatter = extractFrontmatter(updatedContent, `specs/change/${legacySpecId}/README.md`);
      assert.equal(updatedFrontmatter.status, 'implemented');

      fs.rmSync(legacySpecDir, { recursive: true, force: true });
    });

    await t.test('status shows dangling active symlink with null fields', () => {
      const missingSpecId = '19990101-removed-spec';
      createDanglingActiveSymlink(missingSpecId);

      const status = yaml.load(runStatus());

      assert.equal(status.specs_count, 2);
      assert.deepEqual(status.active_change, {
        id: missingSpecId,
        name: null,
        path: null,
        status: null
      });
    });

    await t.test('set-active replaces dangling active symlink', () => {
      const specs = fs.readdirSync(path.join(TEST_DIR, 'specs/change'))
        .filter(d => /^\d{8}-/.test(d));
      const firstSpecDir = specs.find(d => d.endsWith('-first-spec'));
      assert.ok(firstSpecDir, 'first-spec directory should exist');

      createDanglingActiveSymlink('19990101-removed-spec');
      runCommand(`set-active ${firstSpecDir}`);

      const status = yaml.load(runStatus());
      assert.equal(status.active_change.id, firstSpecDir);
    });

    await t.test('unset-active removes dangling active symlink', () => {
      const activeLinkPath = path.join(TEST_DIR, 'specs/change/active');
      createDanglingActiveSymlink('19990101-removed-spec');

      const result = yaml.load(runCommand('unset-active'));
      assert.equal(result.ok, true);
      assert.equal(result.active_change, null);
      assert.throws(() => fs.lstatSync(activeLinkPath), /ENOENT/);
    });

    await t.test('agent hint appears when deployed zest command markdown exists', () => {
      const cursorCommandsDir = path.join(TEST_DIR, '.cursor', 'commands');
      fs.mkdirSync(cursorCommandsDir, { recursive: true });
      fs.writeFileSync(path.join(cursorCommandsDir, 'zest-dev-new.md'), '# test', 'utf-8');

      const status = yaml.load(runStatus());
      assert.deepEqual(status.agent_hints, [
        'Run `zest-dev init` to update deployed command markdown files.'
      ]);
    });

    await t.test('agent hint appears when global OpenCode command markdown exists', () => {
      const globalEnv = makeIsolatedGlobalEnv(path.join(TEST_DIR, 'global-hint-env'));
      const globalCommandsDir = path.join(globalEnv.XDG_CONFIG_HOME, 'opencode', 'commands');
      const cursorZestFile = path.join(TEST_DIR, '.cursor', 'commands', 'zest-dev-new.md');
      if (fs.existsSync(cursorZestFile)) {
        fs.unlinkSync(cursorZestFile);
      }

      fs.mkdirSync(globalCommandsDir, { recursive: true });
      fs.writeFileSync(path.join(globalCommandsDir, 'zest-dev-new.md'), '# test', 'utf-8');

      const status = yaml.load(runCommandWithEnv('status', TEST_DIR, globalEnv));
      assert.deepEqual(status.agent_hints, [
        'Run `zest-dev init` to update deployed command markdown files.'
      ]);
    });

    await t.test('status works when optional global OpenCode env is invalid', () => {
      const status = yaml.load(runCommandWithEnv('status', TEST_DIR, {
        HOME: '',
        XDG_CONFIG_HOME: 'relative-config'
      }));
      assert.equal(status.specs_count, 2);
    });

    await t.test('agent hint is not shown for non-zest markdown files', () => {
      const otherCommandsDir = path.join(TEST_DIR, '.opencode', 'commands');
      fs.mkdirSync(otherCommandsDir, { recursive: true });
      fs.writeFileSync(path.join(otherCommandsDir, 'pr.md'), '# unrelated', 'utf-8');

      // Ensure no deployed zest command files exist for this subtest.
      const cursorZestFile = path.join(TEST_DIR, '.cursor', 'commands', 'zest-dev-new.md');
      if (fs.existsSync(cursorZestFile)) {
        fs.unlinkSync(cursorZestFile);
      }

      const status = yaml.load(runStatus());
      assert.equal(status.agent_hints, undefined);
    });
  } finally {
    cleanup();
  }
});

test('zest-dev update integration', async (t) => {
  setup();

  try {
    const firstOutput = yaml.load(runCreate('first-spec'));
    const firstSpecId = firstOutput.spec.id;

    await t.test('allows forward update', () => {
      const result = yaml.load(runUpdate(firstSpecId, 'researched'));
      assert.equal(result.ok, true);
      assert.equal(result.spec.id, firstSpecId);
      assert.equal(result.spec.status, 'researched');
      assert.equal(result.status.from, 'new');
      assert.equal(result.status.to, 'researched');
      assert.equal(result.status.changed, true);

      const spec = yaml.load(runCommand(`show ${firstSpecId}`));
      assert.equal(spec.status, 'researched');
    });

    await t.test('allows forward skip update', () => {
      const result = yaml.load(runUpdate(firstSpecId, 'implemented'));
      assert.equal(result.ok, true);
      assert.equal(result.spec.status, 'implemented');
      assert.equal(result.status.from, 'researched');
      assert.equal(result.status.to, 'implemented');
    });

    await t.test('fails on no-op update', () => {
      assert.throws(
        () => runUpdate(firstSpecId, 'implemented'),
        /Status is already "implemented" for spec \S+/
      );
    });

    await t.test('fails on backward update', () => {
      assert.throws(
        () => runUpdate(firstSpecId, 'designed'),
        /Invalid transition implemented -> designed/
      );
    });

    await t.test('fails on invalid target status', () => {
      assert.throws(
        () => runUpdate(firstSpecId, 'ready'),
        /Invalid status "ready"\. Valid: new, researched, designed, planned, implemented/
      );
    });

    await t.test('accepts active alias for show/update', () => {
      const aliasSpecId = yaml.load(runCreate('alias-spec')).spec.id;
      runCommand(`set-active ${aliasSpecId}`);
      const showActive = yaml.load(runCommand('show active'));
      assert.equal(showActive.id, aliasSpecId);

      const updateActive = yaml.load(runCommand('update active implemented'));
      assert.equal(updateActive.ok, true);
      assert.equal(updateActive.spec.id, aliasSpecId);
      assert.equal(updateActive.spec.status, 'implemented');
    });

    await t.test('allows planned status before implemented', () => {
      const plannedSpecId = yaml.load(runCreate('planned-spec')).spec.id;
      const plannedResult = yaml.load(runUpdate(plannedSpecId, 'planned'));
      assert.equal(plannedResult.ok, true);
      assert.equal(plannedResult.spec.status, 'planned');
      assert.equal(plannedResult.status.from, 'new');
      assert.equal(plannedResult.status.to, 'planned');

      const implementedResult = yaml.load(runUpdate(plannedSpecId, 'implemented'));
      assert.equal(implementedResult.ok, true);
      assert.equal(implementedResult.status.from, 'planned');
      assert.equal(implementedResult.status.to, 'implemented');
    });
  } finally {
    cleanup();
  }
});

test('zest-dev ralph integration', async (t) => {
  setup();

  try {
    await t.test('converts unfinished active Progress items into Ralph tasks and task.md', () => {
      const spec = createActiveSpecWithBody('ralph-progress', `---
id: test-ralph-progress
name: Ralph Progress
status: planned
created: '2026-06-04'
---

## Overview

Test spec.

## Progress

- [ ] Step 1: Parse active Progress into task text
- [x] Step 2: Already complete
- [ ] Step 3: Write implement prompt file

## Implementation

See [steps.md](./steps.md).

`);
      const staleFile = path.join(TEST_DIR, '.ralph', 'stale.txt');
      fs.mkdirSync(path.dirname(staleFile), { recursive: true });
      fs.writeFileSync(staleFile, 'stale', 'utf-8');

      const env = makeFakeRalphEnv();
      const output = yaml.load(runCommandWithEnv('ralph', TEST_DIR, env));
      const tasks = readFakeRalphTasks();

      assert.equal(output.ok, true);
      assert.equal(output.spec.id, spec.id);
      assert.deepEqual(tasks, [
        'Step 1: Parse active Progress into task text',
        'Step 3: Write implement prompt file',
        FINAL_RALPH_TASK
      ]);
      assert.deepEqual(output.tasks_added, tasks);
      assert.equal('ralph_results' in output, false);
      assert.equal(fs.existsSync(staleFile), false, 'existing .ralph state should be removed before adding tasks');
      const prompt = runCommand('prompt implement');

      assert.deepEqual(output.task_md, {
        path: 'task.md',
        content: prompt
      });
      assert.equal(
        fs.readFileSync(path.join(TEST_DIR, 'task.md'), 'utf-8'),
        prompt
      );
    });

    await t.test('falls back to legacy Notes Progress items for active planned specs', () => {
      cleanup();
      setup();
      createActiveSpecWithBody('ralph-legacy-progress', `---
id: test-ralph-legacy-progress
name: Ralph Legacy Progress
status: planned
created: '2026-06-04'
---

## Overview

Legacy spec.

## Notes

### Progress

- [ ] Step 1: Preserve legacy Ralph handoff
- [x] Step 2: Already complete
- [ ] Step 3: Keep split layout support

### Decisions

- Use the split spec layout for new specs.
`);

      const output = yaml.load(runCommandWithEnv('ralph', TEST_DIR, makeFakeRalphEnv()));
      const tasks = readFakeRalphTasks();

      assert.equal(output.ok, true);
      assert.deepEqual(tasks, [
        'Step 1: Preserve legacy Ralph handoff',
        'Step 3: Keep split layout support',
        FINAL_RALPH_TASK
      ]);
      assert.deepEqual(output.tasks_added, tasks);
    });

    await t.test('fails when all Progress items are complete', () => {
      cleanup();
      setup();
      createActiveSpecWithBody('ralph-complete-progress', `---
id: test-ralph-complete-progress
name: Ralph Complete Progress
status: planned
created: '2026-06-04'
---

## Progress

- [x] Step 1: Done
- [X] Step 2: Also done
`);

      const failed = runCommandExpectFailure('ralph', TEST_DIR, makeFakeRalphEnv());

      assert.equal(failed.failed, true);
      assert.ok(failed.output.includes('Active spec Progress section has no unfinished checkbox items'));
      assert.equal(fs.existsSync(path.join(TEST_DIR, '.ralph')), false);
      assert.equal(fs.existsSync(path.join(TEST_DIR, 'task.md')), false);
    });

    await t.test('fails when no active spec exists', () => {
      cleanup();
      setup();

      const failed = runCommandExpectFailure('ralph');

      assert.equal(failed.failed, true);
      assert.ok(failed.output.includes('No active change spec set'));
      assert.equal(fs.existsSync(path.join(TEST_DIR, 'task.md')), false);
    });

    await t.test('fails when Progress is missing', () => {
      cleanup();
      setup();
      createActiveSpecWithBody('ralph-missing-progress', `---
id: test-ralph-missing-progress
name: Ralph Missing Progress
status: planned
created: '2026-06-04'
---

## Implementation

See [steps.md](./steps.md).

`);

      const failed = runCommandExpectFailure('ralph', TEST_DIR, makeFakeRalphEnv());

      assert.equal(failed.failed, true);
      assert.ok(failed.output.includes('Active spec is missing ## Progress'));
      assert.equal(fs.existsSync(path.join(TEST_DIR, '.ralph')), false);
      assert.equal(fs.existsSync(path.join(TEST_DIR, 'task.md')), false);
    });

    await t.test('fails on unsupported Progress syntax', () => {
      cleanup();
      setup();
      createActiveSpecWithBody('ralph-malformed-progress', `---
id: test-ralph-malformed-progress
name: Ralph Malformed Progress
status: planned
created: '2026-06-04'
---

## Progress

- [/] Step 1: In progress is not supported
`);

      const failed = runCommandExpectFailure('ralph', TEST_DIR, makeFakeRalphEnv());

      assert.equal(failed.failed, true);
      assert.ok(failed.output.includes('Unsupported Progress line: - [/] Step 1: In progress is not supported'));
      assert.equal(fs.existsSync(path.join(TEST_DIR, '.ralph')), false);
      assert.equal(fs.existsSync(path.join(TEST_DIR, 'task.md')), false);
    });
  } finally {
    cleanup();
  }
});

test('zest-dev prompt supports actual command set', () => {
  setup();

  try {
    const quickPrompt = runCommand('prompt quick-implement test feature');
    assert.ok(quickPrompt.includes('complete Zest Dev workflow'));
    assert.ok(quickPrompt.includes('test feature'));
    assert.ok(quickPrompt.includes('explicit approval before entering Implementation'));

    const planPrompt = runCommand('prompt plan');
    assert.equal(
      planPrompt.trim(),
      'Follow the Zest Dev workflow to advance the active spec to planned, using this focus if relevant: .'
    );

    const invalidPrompt = runCommandExpectFailure('prompt summarize');
    assert.equal(invalidPrompt.failed, true);
    assert.ok(invalidPrompt.output.includes('Invalid command: summarize'));
  } finally {
    cleanup();
  }
});

test('zest-dev prompt implement supports incremental phases', () => {
  setup();

  try {
    const prompt = runCommand('prompt implement');
    assert.equal(
      prompt.trim(),
      'Follow the Zest Dev workflow to advance the active spec to implemented, using this focus if relevant: .'
    );
    assert.equal(prompt.includes('**Step 1:'), false);
    assert.equal(prompt.includes('Treat this command as a request'), false);

    runInitArgs('--local');
    const deployedImplement = readCommand('.opencode', 'zest-dev-implement.md');
    assert.ok(
      deployedImplement.includes('Follow the Zest Dev workflow to advance the active spec to implemented, using this focus if relevant: $ARGUMENTS.')
    );
    assert.equal(deployedImplement.includes('**Step 1:'), false);
    assert.equal(deployedImplement.includes('Treat this command as a request'), false);
  } finally {
    cleanup();
  }
});
