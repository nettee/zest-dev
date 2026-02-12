const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

const PACKAGE_CLI_BIN = process.env.ZEST_CLI_PATH
  ? path.join(
      process.env.ZEST_CLI_PATH,
      'node_modules',
      '.bin',
      process.platform === 'win32' ? 'zest-spec.cmd' : 'zest-spec'
    )
  : null;

const CLI_COMMAND = process.env.ZEST_CLI_PATH
  ? `"${PACKAGE_CLI_BIN}"`
  : `node ${path.join(__dirname, '../bin/zest-spec.js')}`;

const TEST_DIR = path.join(__dirname, '../test-project-temp');
const CREATE_TEST_DIR = path.join(__dirname, '../test-project-create-temp');
const EXPECTED_COMMANDS = [
  'zest-spec-new.md',
  'zest-spec-research.md',
  'zest-spec-design.md',
  'zest-spec-implement.md',
  'zest-spec-summarize.md'
];

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
    throw new Error(`zest-spec ${command} failed:\n${details}`);
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

test('zest-spec init integration', async (t) => {
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
    });

    await t.test('directory structure', () => {
      const expectedDirs = [
        '.cursor/commands',
        '.cursor/skills',
        '.opencode/commands',
        '.opencode/skills'
      ];

      for (const dir of expectedDirs) {
        assert.ok(fs.existsSync(path.join(TEST_DIR, dir)), `directory should exist: ${dir}`);
      }
    });

    await t.test('command files', () => {
      for (const target of ['.cursor', '.opencode']) {
        for (const file of EXPECTED_COMMANDS) {
          const filePath = path.join(TEST_DIR, target, 'commands', file);
          assert.ok(fs.existsSync(filePath), `${target} command should exist: ${file}`);
        }
      }
    });

    await t.test('skills deployment', () => {
      const cursorSkillPath = path.join(TEST_DIR, '.cursor/skills/zest-spec/SKILL.md');
      const opencodeSkillPath = path.join(TEST_DIR, '.opencode/skills/zest-spec/SKILL.md');

      assert.ok(fs.existsSync(cursorSkillPath), 'Cursor skill file should exist');
      assert.ok(fs.existsSync(opencodeSkillPath), 'OpenCode skill file should exist');
    });

    await t.test('frontmatter transformation', () => {
      for (const target of ['.cursor', '.opencode']) {
        const fileLabel = `${target}/commands/zest-spec-new.md`;
        const content = readCommand(target, 'zest-spec-new.md');
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
      }
    });

    await t.test('content preservation', () => {
      const content = readCommand('.cursor', 'zest-spec-new.md');
      const match = content.match(/^---\n[\s\S]*?\n---\n\n([\s\S]*)/);
      assert.ok(match, 'should be able to extract command body');

      const bodyContent = match[1];
      assert.ok(bodyContent.includes('$ARGUMENTS'), 'command body should keep $ARGUMENTS placeholder');
      assert.ok(bodyContent.includes('**Step 1:'), 'command body should keep step structure');
    });

    await t.test('idempotency', () => {
      const secondRunOutput = runInit();
      const secondRun = yaml.load(secondRunOutput);
      assert.equal(secondRun.ok, true, 'second init run should succeed');

      const cursorCommands = fs.readdirSync(path.join(TEST_DIR, '.cursor/commands'));
      const opencodeCommands = fs.readdirSync(path.join(TEST_DIR, '.opencode/commands'));

      assert.equal(
        cursorCommands.length,
        EXPECTED_COMMANDS.length,
        'cursor commands count should remain unchanged'
      );
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

test('zest-spec create integration', async (t) => {
  setup(CREATE_TEST_DIR);

  try {
    await t.test('default template fallback', () => {
      const output = runCreate('default-template', CREATE_TEST_DIR);
      const result = yaml.load(output);
      assert.equal(result.ok, true, 'create command should succeed');

      const specPath = path.join(CREATE_TEST_DIR, 'specs/001-default-template/spec.md');
      assert.ok(fs.existsSync(specPath), 'spec file should exist');

      const content = fs.readFileSync(specPath, 'utf-8');
      const frontmatter = extractFrontmatter(content, 'specs/001-default-template/spec.md');

      assert.equal(frontmatter.id, '001');
      assert.equal(frontmatter.name, 'Default Template');
      assert.equal(frontmatter.status, 'new');
      assert.equal(typeof frontmatter.created, 'string');
      assert.ok(content.includes('## Overview'), 'should use packaged default template');
      assert.equal(content.includes('{id}'), false);
      assert.equal(content.includes('{name}'), false);
      assert.equal(content.includes('{date}'), false);
    });

    await t.test('custom template override', () => {
      const customTemplatePath = path.join(CREATE_TEST_DIR, '.zest-spec/template/spec.md');
      fs.mkdirSync(path.dirname(customTemplatePath), { recursive: true });
      fs.writeFileSync(
        customTemplatePath,
        `---
id: "{id}"
name: "{name}"
status: custom
created: "{date}"
---

# Custom Spec

Token: {id}|{name}|{date}
`,
        'utf-8'
      );

      const output = runCreate('custom-template', CREATE_TEST_DIR);
      const result = yaml.load(output);
      assert.equal(result.ok, true, 'create command should succeed with custom template');

      const specPath = path.join(CREATE_TEST_DIR, 'specs/002-custom-template/spec.md');
      assert.ok(fs.existsSync(specPath), 'spec file should exist');

      const content = fs.readFileSync(specPath, 'utf-8');
      const frontmatter = extractFrontmatter(content, 'specs/002-custom-template/spec.md');

      assert.equal(frontmatter.id, '002');
      assert.equal(frontmatter.name, 'Custom Template');
      assert.equal(frontmatter.status, 'custom');
      assert.ok(content.includes('# Custom Spec'), 'should use custom template file');
      assert.equal(content.includes('## Overview'), false);
      assert.equal(content.includes('{id}'), false);
      assert.equal(content.includes('{name}'), false);
      assert.equal(content.includes('{date}'), false);
      assert.ok(content.includes('Token: 002|Custom Template|'));
    });
  } finally {
    cleanup(CREATE_TEST_DIR);
  }
});

test('zest-spec status integration', async (t) => {
  setup();

  try {
    runCreate('first-spec');
    runCreate('second-spec');

    await t.test('current is null when not set', () => {
      const status = yaml.load(runCommand('status'));
      assert.equal(status.specs_count, 2);
      assert.equal(status.current, null);
      assert.equal(status.agent_hints, undefined);
    });

    await t.test('current is an object when set', () => {
      runCommand('set-current 002');
      const status = yaml.load(runCommand('status'));

      assert.equal(status.specs_count, 2);
      assert.equal(typeof status.current, 'object');
      assert.equal(status.current.id, '002');
      assert.equal(status.current.name, 'Second Spec');
      assert.equal(status.current.path, path.join('specs', '002-second-spec', 'spec.md'));
      assert.equal(status.current.status, 'new');
      assert.equal(status.agent_hints, undefined);
    });

    await t.test('agent hint appears when deployed zest command markdown exists', () => {
      const cursorCommandsDir = path.join(TEST_DIR, '.cursor', 'commands');
      fs.mkdirSync(cursorCommandsDir, { recursive: true });
      fs.writeFileSync(path.join(cursorCommandsDir, 'zest-spec-new.md'), '# test', 'utf-8');

      const status = yaml.load(runCommand('status'));
      assert.deepEqual(status.agent_hints, [
        'Run `zest-spec init` to update deployed command markdown files.'
      ]);
    });

    await t.test('agent hint is not shown for non-zest markdown files', () => {
      const otherCommandsDir = path.join(TEST_DIR, '.opencode', 'commands');
      fs.mkdirSync(otherCommandsDir, { recursive: true });
      fs.writeFileSync(path.join(otherCommandsDir, 'pr.md'), '# unrelated', 'utf-8');

      // Ensure no deployed zest command files exist for this subtest.
      const cursorZestFile = path.join(TEST_DIR, '.cursor', 'commands', 'zest-spec-new.md');
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

test('zest-spec update integration', async (t) => {
  setup();

  try {
    runCreate('first-spec');

    await t.test('allows forward update', () => {
      const result = yaml.load(runUpdate('001', 'researched'));
      assert.equal(result.ok, true);
      assert.equal(result.spec.id, '001');
      assert.equal(result.spec.status, 'researched');
      assert.equal(result.status.from, 'new');
      assert.equal(result.status.to, 'researched');
      assert.equal(result.status.changed, true);

      const spec = yaml.load(runCommand('show 001'));
      assert.equal(spec.status, 'researched');
    });

    await t.test('allows forward skip update', () => {
      const result = yaml.load(runUpdate('001', 'implemented'));
      assert.equal(result.ok, true);
      assert.equal(result.spec.status, 'implemented');
      assert.equal(result.status.from, 'researched');
      assert.equal(result.status.to, 'implemented');
    });

    await t.test('fails on no-op update', () => {
      assert.throws(
        () => runUpdate('001', 'implemented'),
        /Status is already "implemented" for spec 001/
      );
    });

    await t.test('fails on backward update', () => {
      assert.throws(
        () => runUpdate('001', 'designed'),
        /Invalid transition implemented -> designed/
      );
    });

    await t.test('fails on invalid target status', () => {
      assert.throws(
        () => runUpdate('001', 'planned'),
        /Invalid status "planned"\. Valid: new, researched, designed, implemented/
      );
    });
  } finally {
    cleanup();
  }
});
