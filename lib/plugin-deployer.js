const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Parse markdown file with frontmatter
 * @param {string} filePath - Path to markdown file
 * @returns {{ frontmatter: Object, content: string }} Parsed frontmatter and content
 */
function parseMarkdownWithFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);

  if (!match) {
    // No frontmatter, return empty object and full content
    return { frontmatter: {}, content: content };
  }

  const frontmatterYaml = match[1];
  const bodyContent = content.slice(match[0].length).trim();

  try {
    const frontmatter = yaml.load(frontmatterYaml) || {};
    return { frontmatter, content: bodyContent };
  } catch (error) {
    throw new Error(`Failed to parse frontmatter in ${filePath}: ${error.message}`);
  }
}

/**
 * Transform frontmatter for OpenCode (remove Claude Code specific fields)
 * @param {Object} frontmatter - Original frontmatter object
 * @returns {Object} Transformed frontmatter with only description
 */
function transformFrontmatter(frontmatter) {
  // Keep only description field
  const transformed = {};
  if (frontmatter.description) {
    transformed.description = frontmatter.description;
  }
  return transformed;
}

/**
 * Write markdown file with frontmatter
 * @param {string} targetPath - Target file path
 * @param {Object} frontmatter - Frontmatter object
 * @param {string} content - Body content
 */
function writeMarkdownWithFrontmatter(targetPath, frontmatter, content) {
  const frontmatterYaml = yaml.dump(frontmatter, { lineWidth: -1 }).trim();
  const fileContent = `---\n${frontmatterYaml}\n---\n\n${content}`;
  fs.writeFileSync(targetPath, fileContent, 'utf-8');
}

/**
 * Create target directories if they don't exist
 */
function ensureDirectories() {
  const dirs = [
    '.opencode/commands',
    '.opencode/skills'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    fs.mkdirSync(fullPath, { recursive: true });
  });
}

/**
 * Create target directories for Codex deployment
 */
function ensureCodexDirectories() {
  const dirs = [
    '.codex/agents',
    '.agents/skills/zest-dev'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    fs.mkdirSync(fullPath, { recursive: true });
  });
}

/**
 * Remove legacy deployed agent files without deleting directories
 *
 * Legacy installs may have written files into .opencode/agents.
 * We no longer deploy agents, but should clean stale files on init.
 */
function cleanupLegacyAgentFiles() {
  const agentsDir = path.join(process.cwd(), '.opencode/agents');
  const legacyAgentFilenames = new Set([
    'code-architect.md',
    'code-explorer.md',
    'code-reviewer.md'
  ]);

  if (!fs.existsSync(agentsDir)) {
    return;
  }

  const entries = fs.readdirSync(agentsDir, { withFileTypes: true });
  entries.forEach(entry => {
    if (entry.isFile() && legacyAgentFilenames.has(entry.name)) {
      fs.unlinkSync(path.join(agentsDir, entry.name));
    }
  });
}

/**
 * Copy directory recursively
 * @param {string} source - Source directory
 * @param {string} target - Target directory
 */
function copyDirectoryRecursive(source, target) {
  const entries = fs.readdirSync(source, { withFileTypes: true });

  entries.forEach(entry => {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true });
      copyDirectoryRecursive(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

/**
 * Deploy command files to OpenCode directory
 * @returns {string[]} Deployed file lists
 */
function deployCommands() {
  const sourceDir = path.join(__dirname, '../plugin/commands');
  const commandFiles = fs.readdirSync(sourceDir)
    .filter(f => f.endsWith('.md'))
    .sort(); // Ensure consistent order

  const result = [];

  commandFiles.forEach(filename => {
    const sourcePath = path.join(sourceDir, filename);
    const { frontmatter, content } = parseMarkdownWithFrontmatter(sourcePath);

    // Transform frontmatter (same for both targets)
    const transformedFrontmatter = transformFrontmatter(frontmatter);

    // Generate prefixed filename
    const prefixedFilename = `zest-dev-${filename}`;

    // Deploy to OpenCode
    const opencodePath = path.join(process.cwd(), '.opencode/commands', prefixedFilename);
    writeMarkdownWithFrontmatter(opencodePath, transformedFrontmatter, content);
    result.push(prefixedFilename);
  });

  return result;
}

/**
 * Deploy skill files to OpenCode directory
 * @returns {string[]} Deployed directory lists
 */
function deploySkills() {
  const skillsDir = path.join(__dirname, '../plugin/skills');
  const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();

  const result = [];

  skillDirs.forEach(skillName => {
    const sourceDir = path.join(skillsDir, skillName);

    // Copy to OpenCode
    const opencodeTarget = path.join(process.cwd(), '.opencode/skills', skillName);
    fs.mkdirSync(opencodeTarget, { recursive: true });
    copyDirectoryRecursive(sourceDir, opencodeTarget);
    result.push(skillName + '/');
  });

  return result;
}

/**
 * Deploy command markdown files for Codex skill layout
 * @returns {string[]} Deployed file lists
 */
function deployCodexCommandPrompts() {
  const sourceDir = path.join(__dirname, '../plugin/commands');
  const commandFiles = fs.readdirSync(sourceDir)
    .filter(f => f.endsWith('.md'))
    .sort();

  const codexCommandsDir = path.join(process.cwd(), '.agents/skills/zest-dev/commands');
  fs.mkdirSync(codexCommandsDir, { recursive: true });

  const result = [];
  commandFiles.forEach(filename => {
    const sourcePath = path.join(sourceDir, filename);
    const { frontmatter, content } = parseMarkdownWithFrontmatter(sourcePath);
    const transformedFrontmatter = transformFrontmatter(frontmatter);
    const prefixedFilename = `zest-dev-${filename}`;

    const targetPath = path.join(codexCommandsDir, prefixedFilename);
    writeMarkdownWithFrontmatter(targetPath, transformedFrontmatter, content);
    result.push(`commands/${prefixedFilename}`);
  });

  return result;
}

/**
 * Deploy skills for Codex layout
 * @returns {string[]} Deployed files/dirs
 */
function deployCodexSkills() {
  const sourceDir = path.join(__dirname, '../plugin/skills/zest-dev');
  const targetDir = path.join(process.cwd(), '.agents/skills/zest-dev');
  fs.mkdirSync(targetDir, { recursive: true });
  copyDirectoryRecursive(sourceDir, targetDir);

  const entries = fs.readdirSync(targetDir, { withFileTypes: true })
    .map(entry => entry.isDirectory() ? `${entry.name}/` : entry.name)
    .sort();

  return entries;
}

function toTomlMultiline(value) {
  return `"""${value.replace(/"""/g, '\\"\\"\\"')}"""`;
}

/**
 * Deploy exactly three codex subagent TOML files
 * @returns {string[]} deployed agent filenames
 */
function deployCodexSubagents() {
  const sourceDir = path.join(__dirname, '../plugin/agents');
  const targetDir = path.join(process.cwd(), '.codex/agents');
  const expectedAgents = ['code-architect', 'code-explorer', 'code-reviewer'];
  const deployed = [];

  expectedAgents.forEach(agentName => {
    const sourcePath = path.join(sourceDir, `${agentName}.md`);
    const { frontmatter, content } = parseMarkdownWithFrontmatter(sourcePath);

    const tomlContent = [
      `name = "${frontmatter.name || agentName}"`,
      `description = ${toTomlMultiline(frontmatter.description || '')}`,
      `prompt = ${toTomlMultiline(content)}`,
      ''
    ].join('\n');

    const targetFilename = `${agentName}.toml`;
    fs.writeFileSync(path.join(targetDir, targetFilename), tomlContent, 'utf-8');
    deployed.push(targetFilename);
  });

  return deployed;
}

/**
 * Main deployment function
 * @returns {Object} Deployment result with status and deployed files
 */
function deployPlugin(target = 'opencode') {
  try {
    // 1. Verify plugin directory exists
    const pluginDir = path.join(__dirname, '../plugin');
    if (!fs.existsSync(pluginDir)) {
      throw new Error('Plugin directory not found. Make sure you are in the zest-dev project root.');
    }

    if (target === 'opencode') {
      ensureDirectories();
      cleanupLegacyAgentFiles();
      const commandsResult = deployCommands();
      const skillsResult = deploySkills();

      return {
        ok: true,
        target,
        cursor: {
          commands: [],
          skills: [],
          agents: []
        },
        opencode: {
          commands: commandsResult,
          skills: skillsResult,
          agents: []
        },
        codex: {
          commands: [],
          skills: [],
          agents: []
        }
      };
    }

    if (target === 'codex') {
      ensureCodexDirectories();
      const codexCommands = deployCodexCommandPrompts();
      const codexSkills = deployCodexSkills();
      const codexAgents = deployCodexSubagents();

      return {
        ok: true,
        target,
        cursor: {
          commands: [],
          skills: [],
          agents: []
        },
        opencode: {
          commands: [],
          skills: [],
          agents: []
        },
        codex: {
          commands: codexCommands,
          skills: codexSkills,
          agents: codexAgents
        }
      };
    }

    throw new Error(`Invalid target: ${target}. Expected one of: opencode, codex`);
  } catch (error) {
    // Wrap low-level errors with context
    if (error.code === 'EACCES') {
      throw new Error(`Permission denied: ${error.path}`);
    } else if (error.code === 'ENOENT' && error.path) {
      throw new Error(`File not found: ${error.path}`);
    } else {
      throw error;
    }
  }
}

module.exports = {
  deployPlugin
};
