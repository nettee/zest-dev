const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

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
  'zest-dev-archive.md',
  'zest-dev-compound.md',
  'zest-dev-design.md',
  'zest-dev-draft.md',
  'zest-dev-implement.md',
  'zest-dev-new.md',
  'zest-dev-research.md',
  'zest-dev-summarize-chat.md',
  'zest-dev-summarize-pr.md',
  'zest-dev-quick-implement.md'
];
const LANGUAGE_ALIGNMENT_RULE =
  'Always respond in the user\'s language throughout the flow unless the user asks to switch languages.';

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
  try {
    return execSync(`${CLI_COMMAND} ${command}`, {
      cwd,
      encoding: 'utf-8'
    });
  } catch (error) {
    const details = [error.message, error.stdout, error.stderr].filter(Boolean).join('\n');
    throw new Error(`zest-dev ${command} failed:\n${details}`);
  }
}

function runInit(cwd = TEST_DIR) {
  return runCommand('init', cwd);
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

function extractFrontmatter(content, filename) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(match, `${filename} has no frontmatter`);
  const frontmatter = yaml.load(match[1]);
  assert.equal(typeof frontmatter, 'object', `${filename} frontmatter should be an object`);
  return frontmatter;
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

test('zest-dev init integration', async (t) => {
  setup();

  try {
    const firstRunOutput = runInit();

    await t.test('output format', () => {
      const result = yaml.load(firstRunOutput);

      assert.equal(result.ok, true, 'output should include ok: true');
      assert.ok(result.cursor && result.opencode, 'output should group by cursor/opencode');
      assert.ok(Array.isArray(result.cursor.commands), 'cursor.commands should be an array');
      assert.ok(Array.isArray(result.opencode.commands), 'opencode.commands should be an array');
      assert.ok(Array.isArray(result.cursor.skills), 'cursor.skills should be an array');
      assert.ok(Array.isArray(result.cursor.agents), 'cursor.agents should be an array');
      assert.ok(Array.isArray(result.opencode.agents), 'opencode.agents should be an array');
      assert.deepEqual(result.cursor.commands, [], 'cursor.commands should be empty');
      assert.deepEqual(result.cursor.skills, [], 'cursor.skills should be empty');
      assert.deepEqual(result.cursor.agents, [], 'cursor.agents should be empty');
      assert.deepEqual(result.opencode.agents, [], 'opencode.agents should be empty');
    });

    await t.test('directory structure', () => {
      const expectedDirs = [
        '.opencode/commands',
        '.opencode/skills'
      ];

      for (const dir of expectedDirs) {
        assert.ok(fs.existsSync(path.join(TEST_DIR, dir)), `directory should exist: ${dir}`);
      }
    });

    await t.test('command files', () => {
      for (const file of EXPECTED_COMMANDS) {
        const filePath = path.join(TEST_DIR, '.opencode', 'commands', file);
        assert.ok(fs.existsSync(filePath), `.opencode command should exist: ${file}`);
      }

      assert.equal(
        fs.existsSync(path.join(TEST_DIR, '.cursor')),
        false,
        '.cursor should not be created during init'
      );
    });

    await t.test('command language alignment rule', () => {
      for (const file of EXPECTED_COMMANDS) {
        const content = readCommand('.opencode', file);
        assert.ok(
          content.includes(LANGUAGE_ALIGNMENT_RULE),
          `.opencode/commands/${file} should include the language alignment rule`
        );
      }
    });

    await t.test('skills deployment', () => {
      const opencodeSkillPath = path.join(TEST_DIR, '.opencode/skills/zest-dev/SKILL.md');

      assert.ok(fs.existsSync(opencodeSkillPath), 'OpenCode skill file should exist');
    });

    await t.test('agents are not deployed', () => {
      assert.equal(
        fs.existsSync(path.join(TEST_DIR, '.opencode/agents')),
        false,
        '.opencode/agents should not be created during init'
      );
    });

    await t.test('init removes only known legacy agent files and keeps other agents content', () => {
      const agentsDir = path.join(TEST_DIR, '.opencode/agents');
      const staleLegacyFile = path.join(agentsDir, 'code-explorer.md');
      const nonLegacyTopLevelFile = path.join(agentsDir, 'my-custom-agent.md');
      const nestedDir = path.join(agentsDir, 'nested-dir');

      fs.mkdirSync(nestedDir, { recursive: true });
      fs.writeFileSync(staleLegacyFile, '# stale legacy agent', 'utf-8');
      fs.writeFileSync(nonLegacyTopLevelFile, '# user agent', 'utf-8');

      assert.ok(fs.existsSync(staleLegacyFile), 'known legacy file should exist before init');
      assert.ok(fs.existsSync(nonLegacyTopLevelFile), 'non-legacy file should exist before init');
      assert.ok(fs.existsSync(agentsDir), 'agents directory should exist before cleanup');

      const rerunOutput = yaml.load(runInit());
      assert.equal(rerunOutput.ok, true, 'init rerun should succeed during upgrade cleanup');

      assert.equal(fs.existsSync(staleLegacyFile), false, 'known legacy file should be removed');
      assert.ok(fs.existsSync(nonLegacyTopLevelFile), 'non-legacy top-level file should be preserved');
      assert.ok(fs.existsSync(agentsDir), 'agents directory should be kept');
      assert.ok(fs.existsSync(nestedDir), 'subdirectories under agents should be kept');
    });

    await t.test('frontmatter transformation', () => {
      const fileLabel = '.opencode/commands/zest-dev-new.md';
      const content = readCommand('.opencode', 'zest-dev-new.md');
      const frontmatter = extractFrontmatter(content, fileLabel);

      assert.ok(frontmatter.description, `${fileLabel} should include description`);
      assert.equal(
        frontmatter['argument-hint'],
        undefined,
        `${fileLabel} should remove argument-hint`
      );
      assert.equal(
        frontmatter['allowed-tools'],
        undefined,
        `${fileLabel} should remove allowed-tools`
      );
      assert.equal(
        Object.keys(frontmatter).length,
        1,
        `${fileLabel} should only contain one frontmatter field`
      );
    });

    await t.test('content preservation', () => {
      const content = readCommand('.opencode', 'zest-dev-new.md');
      const match = content.match(/^---\n[\s\S]*?\n---\n\n([\s\S]*)/);
      assert.ok(match, 'should be able to extract command body');

      const bodyContent = match[1];
      assert.ok(bodyContent.includes('$ARGUMENTS'), 'command body should keep $ARGUMENTS placeholder');
      assert.ok(bodyContent.includes('Step 1'), 'command body should keep step structure');
    });

    await t.test('idempotency', () => {
      const secondRunOutput = runInit();
      const secondRun = yaml.load(secondRunOutput);
      assert.equal(secondRun.ok, true, 'second init run should succeed');

      const opencodeCommands = fs.readdirSync(path.join(TEST_DIR, '.opencode/commands'));

      assert.equal(
        opencodeCommands.length,
        EXPECTED_COMMANDS.length,
        'opencode commands count should remain unchanged'
      );
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

      const specPath = path.join(CREATE_TEST_DIR, `specs/change/${specId}/spec.md`);
      assert.ok(fs.existsSync(specPath), 'spec file should exist');

      const content = fs.readFileSync(specPath, 'utf-8');
      const frontmatter = extractFrontmatter(content, `specs/change/${specId}/spec.md`);

      assert.ok(/^\d{8}-default-template$/.test(frontmatter.id), `frontmatter.id should be date-based, got: ${frontmatter.id}`);
      assert.equal(frontmatter.name, 'Default Template');
      assert.equal(frontmatter.status, 'new');
      assert.equal(typeof frontmatter.created, 'string');
      assert.ok(content.includes('## Overview'), 'should use packaged default template');
      assert.equal(content.includes('{name}'), false);
      assert.equal(content.includes('{date}'), false);
    });

    await t.test('custom template override', () => {
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
      assert.equal(result.ok, true, 'create command should succeed with custom template');

      const specId = result.spec.id;
      assert.ok(/^\d{8}-custom-template$/.test(specId), `spec id should be date-based, got: ${specId}`);

      const specPath = path.join(CREATE_TEST_DIR, `specs/change/${specId}/spec.md`);
      assert.ok(fs.existsSync(specPath), 'spec file should exist');

      const content = fs.readFileSync(specPath, 'utf-8');
      const frontmatter = extractFrontmatter(content, `specs/change/${specId}/spec.md`);

      assert.equal(frontmatter.id, undefined);
      assert.equal(frontmatter.name, 'Custom Template');
      assert.equal(frontmatter.status, 'custom');
      assert.ok(content.includes('# Custom Spec'), 'should use custom template file');
      assert.equal(content.includes('## Overview'), false);
      assert.equal(content.includes('{name}'), false);
      assert.equal(content.includes('{date}'), false);
      assert.ok(content.includes('Token: Custom Template|'));
    });
  } finally {
    cleanup(CREATE_TEST_DIR);
  }
});

test('zest-dev status integration', async (t) => {
  setup();

  try {
    runCreate('first-spec');
    runCreate('second-spec');

    await t.test('active_change is null when not set', () => {
      const status = yaml.load(runCommand('status'));
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
      const status = yaml.load(runCommand('status'));

      assert.equal(status.specs_count, 2);
      assert.equal(typeof status.active_change, 'object');
      assert.equal(status.active_change.id, secondSpecDir);
      assert.equal(status.active_change.name, 'Second Spec');
      assert.equal(status.active_change.path, path.join('specs/change', secondSpecDir, 'spec.md'));
      assert.equal(status.active_change.status, 'new');
      assert.equal(status.agent_hints, undefined);
    });

    await t.test('status shows dangling active symlink with null fields', () => {
      const missingSpecId = '19990101-removed-spec';
      createDanglingActiveSymlink(missingSpecId);

      const status = yaml.load(runCommand('status'));

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

      const status = yaml.load(runCommand('status'));
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

      const status = yaml.load(runCommand('status'));
      assert.deepEqual(status.agent_hints, [
        'Run `zest-dev init` to update deployed command markdown files.'
      ]);
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

      const status = yaml.load(runCommand('status'));
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
        () => runUpdate(firstSpecId, 'planned'),
        /Invalid status "planned"\. Valid: new, researched, designed, implemented/
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
  } finally {
    cleanup();
  }
});

test('zest-dev prompt archive integration', () => {
  setup();

  try {
    const prompt = runCommand('prompt archive');
    assert.ok(prompt.includes('Archive Active Change Spec'));
    assert.ok(prompt.includes('zest-dev show active'));
    assert.ok(prompt.includes('zest-dev unset-active'));
    assert.equal(prompt.includes('zest-dev archive active --no-merge'), false);

    runInit();
    const deployedArchive = readCommand('.opencode', 'zest-dev-archive.md');
    assert.ok(deployedArchive.includes('zest-dev unset-active'));
    assert.equal(deployedArchive.includes('zest-dev archive active --no-merge'), false);
  } finally {
    cleanup();
  }
});

test('zest-dev prompt implement supports incremental phases', () => {
  setup();

  try {
    const prompt = runCommand('prompt implement');
    assert.ok(prompt.includes('Step 7: Update Spec Status (Only When Fully Complete)'));
    assert.ok(prompt.includes('If only part of the spec is implemented'));
    assert.ok(prompt.includes('Only when the full spec is complete, execute: `zest-dev update active implemented`'));

    runInit();
    const deployedImplement = readCommand('.opencode', 'zest-dev-implement.md');
    assert.ok(deployedImplement.includes('Step 7: Update Spec Status (Only When Fully Complete)'));
    assert.ok(deployedImplement.includes('If only part of the spec is implemented'));
    assert.ok(deployedImplement.includes('Only when the full spec is complete, execute: `zest-dev update active implemented`'));
  } finally {
    cleanup();
  }
});
