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
  setActiveChangeSpec,
  unsetActiveChangeSpec,
  updateSpecStatus,
  createBranchFromActiveChangeSpec,
  dumpSpec,
  loadIssueRepresentation
} = require('../lib/spec-manager');
const { installSkills, getGlobalSkillsDir } = require('../lib/skill-installer');
const { setupRalphFromActiveSpec } = require('../lib/ralph-setup');
const packageJson = require('../package.json');

const program = new Command();

function getOptionalGlobalSkillsDir() {
  try {
    return getGlobalSkillsDir();
  } catch {
    return null;
  }
}

function hasDeployedSkills() {
  const skillsDir = getOptionalGlobalSkillsDir();
  if (!skillsDir || !fs.existsSync(skillsDir)) {
    return false;
  }

  return fs.readdirSync(skillsDir, { withFileTypes: true }).some(entry =>
    entry.isDirectory() && fs.existsSync(path.join(skillsDir, entry.name, 'SKILL.md'))
  );
}

function isFzfAvailable() {
  const result = spawnSync('fzf', ['--version'], { stdio: 'ignore' });
  return !result.error;
}

async function selectSpecInteractively(specs) {
  if (specs.length === 0) {
    throw new Error('No specs available');
  }

  const lines = specs.map(s => {
    const mark = s.active ? '* ' : '  ';
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

    // Line format: "* <id>  [status]  Name" or "  <id>  [status]  Name"
    // Use end-trim only to preserve leading marker spaces for parsing.
    const selectedLine = result.stdout.trimEnd();
    const match = selectedLine.match(/^(?:\* |  )(\S+)/);
    if (!match) {
      return null;
    }

    return match[1];
  }

  // Fallback: numbered list via readline
  process.stderr.write('Select a spec:\n');
  specs.forEach((s, i) => {
    const mark = s.active ? '*' : ' ';
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

program
  .name('zest-dev')
  .description('A lightweight, human-interactive development workflow for AI-assisted coding')
  .version(packageJson.version);

// zest-dev status
program
  .command('status')
  .description('Show project status')
  .action(() => {
    try {
      const status = getSpecsStatus();
      if (hasDeployedSkills()) {
        status.agent_hints = [
          'Run `zest-dev init` to update deployed skills.'
        ];
      }

      console.log(yaml.dump(status));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// zest-dev show <spec_id|active>
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

// zest-dev set-active [spec_id]
program
  .command('set-active [spec]')
  .alias('set-current')
  .description('Set the active change spec (interactive picker when no ID given)')
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
      const result = setActiveChangeSpec(spec);
      console.log(yaml.dump(result));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// zest-dev unset-active
program
  .command('unset-active')
  .alias('unset-current')
  .description('Unset the active change spec')
  .action(() => {
    try {
      const result = unsetActiveChangeSpec();
      console.log(yaml.dump(result));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// zest-dev update <spec_id|active> <status>
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
  .description('Create and switch to a git branch from the active change spec slug')
  .action(() => {
    try {
      const result = createBranchFromActiveChangeSpec();
      console.log(yaml.dump(result));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// zest-dev dump <spec_id|active>
program
  .command('dump <spec>')
  .description('Dump a spec to an issue representation or forge issue')
  .option('--dry-run', 'Print the local Issue Spec Representation without creating an issue')
  .action((spec, options) => {
    try {
      const result = dumpSpec(spec, { dryRun: Boolean(options.dryRun) });
      console.log(yaml.dump(result, { lineWidth: -1 }));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// zest-dev load [issue]
program
  .command('load [issue]')
  .description('Load a spec from an issue representation or forge issue')
  .option('--from-file <path>', 'Load from a local Issue Spec Representation YAML file')
  .action((issue, options) => {
    try {
      const result = loadIssueRepresentation(issue, { fromFile: options.fromFile });
      console.log(yaml.dump(result, { lineWidth: -1 }));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// zest-dev init
program
  .command('init')
  .description('Install packaged skills to ~/.agents/skills')
  .action(() => {
    try {
      const result = installSkills();
      console.log(yaml.dump(result));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// zest-dev ralph
program
  .command('ralph')
  .description('Convert active spec Progress items into Ralph tasks')
  .action(() => {
    try {
      const result = setupRalphFromActiveSpec(process.cwd());
      console.log(yaml.dump(result));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
