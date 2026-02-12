#!/usr/bin/env node

const { Command } = require('commander');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const {
  getSpecsStatus,
  getSpec,
  createSpec,
  setCurrentSpec,
  unsetCurrentSpec,
  updateSpecStatus
} = require('../lib/spec-manager');
const { deployPlugin } = require('../lib/plugin-deployer');
const { generatePrompt } = require('../lib/prompt-generator');

const program = new Command();
const DEPLOYED_COMMAND_DIRS = [
  path.join(process.cwd(), '.cursor/commands'),
  path.join(process.cwd(), '.opencode/commands')
];

function hasDeployedCommandMarkdowns() {
  return DEPLOYED_COMMAND_DIRS.some(dirPath => {
    if (!fs.existsSync(dirPath)) {
      return false;
    }

    const files = fs.readdirSync(dirPath);
    return files.some(file => /^zest-spec-.*\.md$/.test(file));
  });
}

program
  .name('zest-spec')
  .description('A lightweight, file-driven development workflow for swappable coding agents')
  .version('0.1.0');

// zest-spec status
program
  .command('status')
  .description('Show project status')
  .action(() => {
    try {
      const status = getSpecsStatus();
      if (hasDeployedCommandMarkdowns()) {
        status.agent_hints = [
          'Run `zest-spec init` to update deployed command markdown files.'
        ];
      }

      console.log(yaml.dump(status));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// zest-spec show <spec_number|current>
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

// zest-spec create <spec_slug>
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

// zest-spec set-current <spec_number>
program
  .command('set-current <spec>')
  .description('Set the current spec')
  .action((spec) => {
    try {
      const result = setCurrentSpec(spec);
      console.log(yaml.dump(result));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// zest-spec unset-current
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

// zest-spec update <spec_number|current> <status>
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

// zest-spec init
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

// zest-spec prompt <command> [args...]
program
  .command('prompt <command> [args...]')
  .description('Generate prompt for Codex editor (e.g., codex "$(zest-spec prompt new \'task description\')")')
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
