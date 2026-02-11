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
const EXPECTED_COMMANDS = [
  'zest-spec-new.md',
  'zest-spec-research.md',
  'zest-spec-design.md',
  'zest-spec-implement.md',
  'zest-spec-summarize.md'
];

function cleanup() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

function setup() {
  cleanup();
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

function runInit() {
  try {
    return execSync(`${CLI_COMMAND} init`, {
      cwd: TEST_DIR,
      encoding: 'utf-8'
    });
  } catch (error) {
    const details = [error.message, error.stdout, error.stderr].filter(Boolean).join('\n');
    throw new Error(`zest-spec init failed:\n${details}`);
  }
}

function readCommand(target, filename) {
  return fs.readFileSync(path.join(TEST_DIR, target, 'commands', filename), 'utf-8');
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
