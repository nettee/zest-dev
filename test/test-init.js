#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

const TEST_DIR = path.join(__dirname, '../test-project-temp');
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

let testsPassed = 0;
let testsFailed = 0;

function log(message) {
  console.log(`  ${message}`);
}

function pass(message) {
  testsPassed++;
  console.log(`${GREEN}✓${RESET} ${message}`);
}

function fail(message) {
  testsFailed++;
  console.log(`${RED}✗${RESET} ${message}`);
}

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
    const output = execSync('zest-spec init', {
      cwd: TEST_DIR,
      encoding: 'utf-8'
    });
    return output;
  } catch (error) {
    throw new Error(`zest-spec init failed: ${error.message}`);
  }
}

function testOutputFormat(output) {
  console.log('\nTest: Output Format');

  try {
    const result = yaml.load(output);

    if (result.ok === true) {
      pass('Output has ok: true');
    } else {
      fail('Output missing ok: true');
    }

    if (result.cursor && result.opencode) {
      pass('Output grouped by target (cursor, opencode)');
    } else {
      fail('Output not properly grouped by target');
    }

    if (result.cursor.commands && Array.isArray(result.cursor.commands)) {
      pass('cursor.commands is an array');
    } else {
      fail('cursor.commands is not an array');
    }

    if (result.opencode.commands && Array.isArray(result.opencode.commands)) {
      pass('opencode.commands is an array');
    } else {
      fail('opencode.commands is not an array');
    }

    if (result.cursor.skills && Array.isArray(result.cursor.skills)) {
      pass('cursor.skills is an array');
    } else {
      fail('cursor.skills is not an array');
    }
  } catch (error) {
    fail(`Failed to parse output as YAML: ${error.message}`);
  }
}

function testDirectoryStructure() {
  console.log('\nTest: Directory Structure');

  const expectedDirs = [
    '.cursor/commands',
    '.cursor/skills',
    '.opencode/commands',
    '.opencode/skills'
  ];

  expectedDirs.forEach(dir => {
    const fullPath = path.join(TEST_DIR, dir);
    if (fs.existsSync(fullPath)) {
      pass(`Directory exists: ${dir}`);
    } else {
      fail(`Directory missing: ${dir}`);
    }
  });
}

function testCommandFiles() {
  console.log('\nTest: Command Files');

  const expectedCommands = [
    'zest-spec-new.md',
    'zest-spec-research.md',
    'zest-spec-design.md',
    'zest-spec-implement.md',
    'zest-spec-summarize.md'
  ];

  // Test Cursor commands
  expectedCommands.forEach(file => {
    const filePath = path.join(TEST_DIR, '.cursor/commands', file);
    if (fs.existsSync(filePath)) {
      pass(`Cursor command exists: ${file}`);
    } else {
      fail(`Cursor command missing: ${file}`);
    }
  });

  // Test OpenCode commands
  expectedCommands.forEach(file => {
    const filePath = path.join(TEST_DIR, '.opencode/commands', file);
    if (fs.existsSync(filePath)) {
      pass(`OpenCode command exists: ${file}`);
    } else {
      fail(`OpenCode command missing: ${file}`);
    }
  });
}

function testSkillsDeployment() {
  console.log('\nTest: Skills Deployment');

  const cursorSkillPath = path.join(TEST_DIR, '.cursor/skills/zest-spec/SKILL.md');
  const opencodeSkillPath = path.join(TEST_DIR, '.opencode/skills/zest-spec/SKILL.md');

  if (fs.existsSync(cursorSkillPath)) {
    pass('Cursor skill file exists: zest-spec/SKILL.md');
  } else {
    fail('Cursor skill file missing: zest-spec/SKILL.md');
  }

  if (fs.existsSync(opencodeSkillPath)) {
    pass('OpenCode skill file exists: zest-spec/SKILL.md');
  } else {
    fail('OpenCode skill file missing: zest-spec/SKILL.md');
  }
}

function testFrontmatterTransformation() {
  console.log('\nTest: Frontmatter Transformation');

  const cursorFile = path.join(TEST_DIR, '.cursor/commands/zest-spec-new.md');
  const opencodeFile = path.join(TEST_DIR, '.opencode/commands/zest-spec-new.md');

  if (fs.existsSync(cursorFile)) {
    const content = fs.readFileSync(cursorFile, 'utf-8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);

    if (match) {
      const frontmatter = yaml.load(match[1]);

      if (frontmatter.description) {
        pass('Cursor command has description field');
      } else {
        fail('Cursor command missing description field');
      }

      if (!frontmatter['argument-hint'] && !frontmatter['allowed-tools']) {
        pass('Cursor command removed argument-hint and allowed-tools');
      } else {
        fail('Cursor command still has argument-hint or allowed-tools');
      }

      const fieldCount = Object.keys(frontmatter).length;
      if (fieldCount === 1) {
        pass('Cursor command has only 1 frontmatter field');
      } else {
        fail(`Cursor command has ${fieldCount} frontmatter fields (expected 1)`);
      }
    } else {
      fail('Cursor command has no frontmatter');
    }
  }

  if (fs.existsSync(opencodeFile)) {
    const content = fs.readFileSync(opencodeFile, 'utf-8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);

    if (match) {
      const frontmatter = yaml.load(match[1]);

      if (frontmatter.description) {
        pass('OpenCode command has description field');
      } else {
        fail('OpenCode command missing description field');
      }

      if (!frontmatter['argument-hint'] && !frontmatter['allowed-tools']) {
        pass('OpenCode command removed argument-hint and allowed-tools');
      } else {
        fail('OpenCode command still has argument-hint or allowed-tools');
      }

      const fieldCount = Object.keys(frontmatter).length;
      if (fieldCount === 1) {
        pass('OpenCode command has only 1 frontmatter field');
      } else {
        fail(`OpenCode command has ${fieldCount} frontmatter fields (expected 1)`);
      }
    } else {
      fail('OpenCode command has no frontmatter');
    }
  }
}

function testContentPreservation() {
  console.log('\nTest: Content Preservation');

  const cursorFile = path.join(TEST_DIR, '.cursor/commands/zest-spec-new.md');

  if (fs.existsSync(cursorFile)) {
    const content = fs.readFileSync(cursorFile, 'utf-8');
    const match = content.match(/^---\n[\s\S]*?\n---\n\n([\s\S]*)/);

    if (match) {
      const bodyContent = match[1];

      if (bodyContent.includes('$ARGUMENTS')) {
        pass('Command body preserved $ARGUMENTS placeholder');
      } else {
        fail('Command body missing $ARGUMENTS placeholder');
      }

      if (bodyContent.includes('**Step 1:')) {
        pass('Command body preserved step structure');
      } else {
        fail('Command body missing step structure');
      }
    } else {
      fail('Cannot extract command body content');
    }
  }
}

function testIdempotency() {
  console.log('\nTest: Idempotency');

  try {
    // Run init second time
    const output = execSync('zest-spec init', {
      cwd: TEST_DIR,
      encoding: 'utf-8'
    });

    pass('Second init run succeeded');

    // Verify file count hasn't changed
    const cursorCommands = fs.readdirSync(path.join(TEST_DIR, '.cursor/commands'));
    const opencodeCommands = fs.readdirSync(path.join(TEST_DIR, '.opencode/commands'));

    if (cursorCommands.length === 5) {
      pass('Cursor commands count unchanged (5 files)');
    } else {
      fail(`Cursor commands count changed (${cursorCommands.length} files, expected 5)`);
    }

    if (opencodeCommands.length === 5) {
      pass('OpenCode commands count unchanged (5 files)');
    } else {
      fail(`OpenCode commands count changed (${opencodeCommands.length} files, expected 5)`);
    }
  } catch (error) {
    fail(`Second init run failed: ${error.message}`);
  }
}

function main() {
  console.log('='.repeat(60));
  console.log('Testing zest-spec init command');
  console.log('='.repeat(60));

  try {
    // Setup
    console.log('\nSetup: Creating test project...');
    setup();
    log(`Test directory: ${TEST_DIR}`);

    // Run init
    console.log('\nRunning: zest-spec init...');
    const output = runInit();
    log('Command completed successfully');

    // Run tests
    testOutputFormat(output);
    testDirectoryStructure();
    testCommandFiles();
    testSkillsDeployment();
    testFrontmatterTransformation();
    testContentPreservation();
    testIdempotency();

    // Cleanup
    console.log('\nCleanup: Removing test project...');
    cleanup();
    log('Test directory removed');

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Test Summary');
    console.log('='.repeat(60));
    console.log(`${GREEN}Passed:${RESET} ${testsPassed}`);
    console.log(`${RED}Failed:${RESET} ${testsFailed}`);
    console.log('='.repeat(60));

    process.exit(testsFailed > 0 ? 1 : 0);
  } catch (error) {
    console.error(`\n${RED}Error:${RESET} ${error.message}`);
    cleanup();
    process.exit(1);
  }
}

main();
