#!/usr/bin/env node

const { Command } = require('commander');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawnSync } = require('child_process');
const {
  getSpecsStatus,
  getSpec,
  listSpecs,
  createSpec,
  setCurrentSpec,
  unsetCurrentSpec,
  updateSpecStatus,
  createBranchFromCurrentSpec
} = require('../lib/spec-manager');
const { deployPlugin } = require('../lib/plugin-deployer');
const { generatePrompt } = require('../lib/prompt-generator');

const program = new Command();
const DEPLOYED_COMMAND_DIRS = [
  path.join(process.cwd(), '.cursor/commands'),
  path.join(process.cwd(), '.opencode/commands')
];

function isFzfAvailable() {
  const result = spawnSync('fzf', ['--version'], { stdio: 'ignore' });
  return !result.error;
}

async function selectSpecInteractively(specs) {
  if (specs.length === 0) {
    throw new Error('No specs available');
  }

  const lines = specs.map(s => {
    const mark = s.current ? '* ' : '  ';
    return `${mark}${s.id}  [${s.status}]  ${s.name}`;
  });

  if (isFzfAvailable()) {
    const result = spawnSync('fzf', ['--height=40%', '--reverse', '--prompt=Select spec: '], {
      input: lines.join('\n'),
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'inherit']
    });

    if (result.status !== 0 || !result.stdout.trim()) {
      return null; // user cancelled
    }

    // Line format: "  <id>  [status]  Name" — ID is after the 2-char mark prefix
    return result.stdout.trim().slice(2).split(/\s{2,}/)[0];
  }

  // Fallback: numbered list via readline
  process.stderr.write('Select a spec:\n');
  specs.forEach((s, i) => {
    const mark = s.current ? '*' : ' ';
    process.stderr.write(`  ${mark} ${i + 1}. ${s.id}  [${s.status}]  ${s.name}\n`);
  });

  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
    rl.question('Enter number: ', answer => {
      rl.close();
      const num = parseInt(answer, 10);
      if (num >= 1 && num <= specs.length) {
        resolve(specs[num - 1].id);
      } else {
        resolve(null);
      }
    });
  });
}

function hasDeployedCommandMarkdowns() {
  return DEPLOYED_COMMAND_DIRS.some(dirPath => {
    if (!fs.existsSync(dirPath)) {
      return false;
    }

    const files = fs.readdirSync(dirPath);
    return files.some(file => /^zest-dev-.*\.md$/.test(file));
  });
}

program
  .name('zest-dev')
  .description('A lightweight, human-interactive development workflow for AI-assisted coding')
  .version('0.1.0');

// zest-dev status
program
  .command('status')
  .description('Show project status')
  .action(() => {
    try {
      const status = getSpecsStatus();
      if (hasDeployedCommandMarkdowns()) {
        status.agent_hints = [
          'Run `zest-dev init` to update deployed command markdown files.'
        ];
      }

      console.log(yaml.dump(status));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// zest-dev show <spec_number|current>
program
  .command('show <spec>')
  .description('Show spec details')
  .action((spec) => {
    try {
      const specData = getSpec(spec);
      console.log(yaml.dump(specData));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// zest-dev create <spec_slug>
program
  .command('create <slug>')
  .description('Create a new spec')
  .action((slug) => {
    try {
      const result = createSpec(slug);
      console.log(yaml.dump(result));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// zest-dev set-current [spec_id]
program
  .command('set-current [spec]')
  .description('Set the current spec (interactive picker when no ID given)')
  .action(async (spec) => {
    try {
      if (!spec) {
        const specs = listSpecs();
        spec = await selectSpecInteractively(specs);
        if (!spec) {
          console.error('No spec selected.');
          process.exit(1);
        }
      }
      const result = setCurrentSpec(spec);
      console.log(yaml.dump(result));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// zest-dev unset-current
program
  .command('unset-current')
  .description('Unset the current spec')
  .action(() => {
    try {
      const result = unsetCurrentSpec();
      console.log(yaml.dump(result));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// zest-dev update <spec_number|current> <status>
program
  .command('update <spec> <status>')
  .description('Update spec status')
  .action((spec, status) => {
    try {
      const result = updateSpecStatus(spec, status);
      console.log(yaml.dump(result));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// zest-dev create-branch
program
  .command('create-branch')
  .description('Create and switch to a git branch from the current spec slug')
  .action(() => {
    try {
      const result = createBranchFromCurrentSpec();
      console.log(yaml.dump(result));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// zest-dev init
program
  .command('init')
  .description('Initialize plugin deployment to .cursor and .opencode directories')
  .action(() => {
    try {
      const result = deployPlugin();
      console.log(yaml.dump(result));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// zest-dev prompt <command> [args...]
program
  .command('prompt <command> [args...]')
  .description('Generate prompt for Codex editor (e.g., codex "$(zest-dev prompt new \'task description\')")')
  .action((command, args) => {
    try {
      // Join args array into a single string for commands that take arguments
      const argsString = args ? args.join(' ') : '';
      const prompt = generatePrompt(command, argsString);
      console.log(prompt);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
