const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const VALID_TARGETS = ['all', 'opencode', 'codex'];
const VALID_SCOPES = ['global', 'local'];
const SOURCE_COMMANDS_DIR = path.join(__dirname, '../commands');
const SOURCE_SKILLS_DIR = path.join(__dirname, '../skills');
const SOURCE_AGENTS_DIR = path.join(__dirname, '../agents');
const LEGACY_OPENCODE_AGENT_FILENAMES = new Set([
  'code-architect.md',
  'code-explorer.md',
  'code-reviewer.md'
]);

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
function getHomeDirectory() {
  return process.env.HOME || process.env.USERPROFILE;
}

function assertAbsolutePath(name, value) {
  if (!path.isAbsolute(value)) {
    throw new Error(`${name} must be an absolute path: ${value}`);
  }
}

function getGlobalOpenCodeBaseDir() {
  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (xdgConfigHome) {
    assertAbsolutePath('XDG_CONFIG_HOME', xdgConfigHome);
    return path.join(xdgConfigHome, 'opencode');
  }

  const homeDir = getHomeDirectory();
  if (!homeDir) {
    throw new Error('HOME is not set');
  }
  assertAbsolutePath('HOME', homeDir);

  return path.join(homeDir, '.config', 'opencode');
}

function getTargetPaths(scope) {
  if (!VALID_SCOPES.includes(scope)) {
    throw new Error(`Invalid scope: ${scope}. Expected one of: ${VALID_SCOPES.join(', ')}`);
  }

  if (scope === 'local') {
    const baseDir = process.cwd();
    return {
      baseDir,
      opencode: getLocalOpenCodePaths(baseDir),
      codex: getLocalCodexPaths(baseDir)
    };
  }

  return {
    opencode: getGlobalOpenCodePaths,
    codex: getGlobalCodexPaths
  };
}

function getLocalOpenCodePaths(baseDir = process.cwd()) {
  return {
    baseDir,
    commandsDir: path.join(baseDir, '.opencode/commands'),
    skillsDir: path.join(baseDir, '.opencode/skills'),
    legacyAgentsDir: path.join(baseDir, '.opencode/agents')
  };
}

function getLocalCodexPaths(baseDir = process.cwd()) {
  return {
    baseDir,
    commandsDir: null,
    skillsDir: path.join(baseDir, '.agents/skills/zest-dev'),
    agentsDir: path.join(baseDir, '.codex/agents')
  };
}

function getGlobalOpenCodePaths() {
  const openCodeBaseDir = getGlobalOpenCodeBaseDir();

  return {
    baseDir: openCodeBaseDir,
    commandsDir: path.join(openCodeBaseDir, 'commands'),
    skillsDir: path.join(openCodeBaseDir, 'skills'),
    legacyAgentsDir: path.join(openCodeBaseDir, 'agents')
  };
}

function getGlobalCodexPaths() {
  const homeDir = getHomeDirectory();
  if (!homeDir) {
    throw new Error('HOME is not set');
  }
  assertAbsolutePath('HOME', homeDir);

  return {
    baseDir: homeDir,
    commandsDir: null,
    skillsDir: path.join(homeDir, '.agents/skills/zest-dev'),
    agentsDir: path.join(homeDir, '.codex/agents')
  };
}

function resolveTargetPaths(scope, target) {
  const targetPathResolvers = getTargetPaths(scope);
  if (typeof targetPathResolvers.opencode !== 'function' && typeof targetPathResolvers.codex !== 'function') {
    return targetPathResolvers;
  }

  const paths = {};

  if (target === 'all' || target === 'opencode') {
    paths.opencode = typeof targetPathResolvers.opencode === 'function'
      ? targetPathResolvers.opencode()
      : targetPathResolvers.opencode;
  }

  if (target === 'all' || target === 'codex') {
    paths.codex = typeof targetPathResolvers.codex === 'function'
      ? targetPathResolvers.codex()
      : targetPathResolvers.codex;
  }

  return paths;
}

function ensureDirectories(dirs) {
  dirs.forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
  });
}

/**
 * Remove legacy deployed agent files without deleting directories
 *
 * Legacy installs may have written files into .opencode/agents.
 * We no longer deploy agents, but should clean stale files on init.
 */
function cleanupLegacyAgentFiles(agentsDir) {
  if (!fs.existsSync(agentsDir)) {
    return;
  }

  const entries = fs.readdirSync(agentsDir, { withFileTypes: true });
  entries.forEach(entry => {
    if (entry.isFile() && LEGACY_OPENCODE_AGENT_FILENAMES.has(entry.name)) {
      fs.unlinkSync(path.join(agentsDir, entry.name));
    }
  });
}

function cleanupLegacyCodexCommandPrompts(skillDir) {
  const commandsDir = path.join(skillDir, 'commands');
  if (!fs.existsSync(commandsDir)) {
    return;
  }

  const entries = fs.readdirSync(commandsDir, { withFileTypes: true });
  entries.forEach(entry => {
    if (entry.isFile() && /^zest-dev-.*\.md$/.test(entry.name)) {
      fs.unlinkSync(path.join(commandsDir, entry.name));
    }
  });

  if (fs.readdirSync(commandsDir).length === 0) {
    fs.rmdirSync(commandsDir);
  }
}

function cleanupRemovedCommandPrompts(commandsDir, expectedCommandFiles) {
  if (!fs.existsSync(commandsDir)) {
    return;
  }

  const expectedFiles = new Set(expectedCommandFiles);
  const entries = fs.readdirSync(commandsDir, { withFileTypes: true });

  entries.forEach(entry => {
    if (!entry.isFile()) {
      return;
    }

    if (/^zest-dev-.*\.md$/.test(entry.name) && !expectedFiles.has(entry.name)) {
      fs.unlinkSync(path.join(commandsDir, entry.name));
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
function deployCommands(commandsDir) {
  const sourceDir = SOURCE_COMMANDS_DIR;
  const commandFiles = fs.readdirSync(sourceDir)
    .filter(f => f.endsWith('.md'))
    .sort(); // Ensure consistent order
  const deployedCommandFiles = commandFiles.map(filename => `zest-dev-${filename}`);

  cleanupRemovedCommandPrompts(commandsDir, deployedCommandFiles);

  const result = [];

  commandFiles.forEach(filename => {
    const sourcePath = path.join(sourceDir, filename);
    const { frontmatter, content } = parseMarkdownWithFrontmatter(sourcePath);

    // Transform frontmatter (same for both targets)
    const transformedFrontmatter = transformFrontmatter(frontmatter);

    // Generate prefixed filename
    const prefixedFilename = `zest-dev-${filename}`;

    // Deploy to OpenCode
    const targetPath = path.join(commandsDir, prefixedFilename);
    writeMarkdownWithFrontmatter(targetPath, transformedFrontmatter, content);
    result.push(prefixedFilename);
  });

  return result;
}

/**
 * Deploy skill files to OpenCode directory
 * @returns {string[]} Deployed directory lists
 */
function deploySkills(skillsRootDir) {
  const skillsDir = SOURCE_SKILLS_DIR;
  const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();

  const result = [];

  skillDirs.forEach(skillName => {
    const sourceDir = path.join(skillsDir, skillName);

    // Copy to OpenCode
    const opencodeTarget = path.join(skillsRootDir, skillName);
    fs.mkdirSync(opencodeTarget, { recursive: true });
    copyDirectoryRecursive(sourceDir, opencodeTarget);
    result.push(skillName + '/');
  });

  return result;
}

/**
 * Deploy skills for Codex layout
 * @returns {string[]} Deployed files/dirs
 */
function deployCodexSkills(targetDir) {
  const sourceDir = path.join(SOURCE_SKILLS_DIR, 'zest-dev');
  fs.mkdirSync(targetDir, { recursive: true });
  cleanupLegacyCodexCommandPrompts(targetDir);
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
function deployCodexSubagents(targetDir) {
  const sourceDir = SOURCE_AGENTS_DIR;
  const expectedAgents = ['code-architect', 'code-explorer', 'code-reviewer'];
  const deployed = [];

  expectedAgents.forEach(agentName => {
    const sourcePath = path.join(sourceDir, `${agentName}.md`);
    const { frontmatter, content } = parseMarkdownWithFrontmatter(sourcePath);

    const tomlContent = [
      `name = "${frontmatter.name || agentName}"`,
      `description = ${toTomlMultiline(frontmatter.description || '')}`,
      `developer_instructions = ${toTomlMultiline(content)}`,
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
function createEmptyTargetResult(baseDir) {
  return {
    commands: [],
    skills: [],
    agents: [],
    baseDir
  };
}

function deployPlugin(options = {}) {
  try {
    const pluginDir = path.join(__dirname, '../plugin');
    if (!fs.existsSync(pluginDir)) {
      throw new Error('Plugin directory not found. Make sure you are in the zest-dev project root.');
    }

    const scope = options.scope || 'global';
    const target = options.target || (scope === 'local' ? 'opencode' : 'all');

    if (!VALID_TARGETS.includes(target)) {
      throw new Error(`Invalid target: ${target}. Expected one of: ${VALID_TARGETS.join(', ')}`);
    }

    if (!VALID_SCOPES.includes(scope)) {
      throw new Error(`Invalid scope: ${scope}. Expected one of: ${VALID_SCOPES.join(', ')}`);
    }

    const targetPaths = resolveTargetPaths(scope, target);
    const result = {
      ok: true,
      scope,
      target,
      opencode: createEmptyTargetResult(targetPaths.opencode ? targetPaths.opencode.baseDir : null),
      codex: createEmptyTargetResult(targetPaths.codex ? targetPaths.codex.baseDir : null)
    };

    if (target === 'all' || target === 'opencode') {
      ensureDirectories([targetPaths.opencode.commandsDir, targetPaths.opencode.skillsDir]);
      cleanupLegacyAgentFiles(targetPaths.opencode.legacyAgentsDir);
      result.opencode.commands = deployCommands(targetPaths.opencode.commandsDir);
      result.opencode.skills = deploySkills(targetPaths.opencode.skillsDir);
    }

    if (target === 'all' || target === 'codex') {
      ensureDirectories([targetPaths.codex.skillsDir, targetPaths.codex.agentsDir]);
      result.codex.skills = deployCodexSkills(targetPaths.codex.skillsDir);
      result.codex.agents = deployCodexSubagents(targetPaths.codex.agentsDir);
    }

    return result;
  } catch (error) {
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
