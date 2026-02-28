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
 * Transform frontmatter for Cursor/OpenCode (remove Claude Code specific fields)
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
    '.cursor/commands',
    '.cursor/skills',
    '.cursor/agents',
    '.opencode/commands',
    '.opencode/skills',
    '.opencode/agents'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    fs.mkdirSync(fullPath, { recursive: true });
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
 * Deploy command files to Cursor and OpenCode directories
 * @returns {{ cursor: string[], opencode: string[] }} Deployed file lists
 */
function deployCommands() {
  const sourceDir = path.join(__dirname, '../plugin/commands');
  const commandFiles = fs.readdirSync(sourceDir)
    .filter(f => f.endsWith('.md'))
    .sort(); // Ensure consistent order

  const result = {
    cursor: [],
    opencode: []
  };

  commandFiles.forEach(filename => {
    const sourcePath = path.join(sourceDir, filename);
    const { frontmatter, content } = parseMarkdownWithFrontmatter(sourcePath);

    // Transform frontmatter (same for both targets)
    const transformedFrontmatter = transformFrontmatter(frontmatter);

    // Generate prefixed filename
    const prefixedFilename = `zest-dev-${filename}`;

    // Deploy to Cursor
    const cursorPath = path.join(process.cwd(), '.cursor/commands', prefixedFilename);
    writeMarkdownWithFrontmatter(cursorPath, transformedFrontmatter, content);
    result.cursor.push(prefixedFilename);

    // Deploy to OpenCode
    const opencodePath = path.join(process.cwd(), '.opencode/commands', prefixedFilename);
    writeMarkdownWithFrontmatter(opencodePath, transformedFrontmatter, content);
    result.opencode.push(prefixedFilename);
  });

  return result;
}

/**
 * Deploy skill files to Cursor and OpenCode directories
 * @returns {{ cursor: string[], opencode: string[] }} Deployed directory lists
 */
function deploySkills() {
  const skillsDir = path.join(__dirname, '../plugin/skills');
  const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();

  const result = {
    cursor: [],
    opencode: []
  };

  skillDirs.forEach(skillName => {
    const sourceDir = path.join(skillsDir, skillName);

    // Copy to Cursor
    const cursorTarget = path.join(process.cwd(), '.cursor/skills', skillName);
    fs.mkdirSync(cursorTarget, { recursive: true });
    copyDirectoryRecursive(sourceDir, cursorTarget);
    result.cursor.push(skillName + '/');

    // Copy to OpenCode
    const opencodeTarget = path.join(process.cwd(), '.opencode/skills', skillName);
    fs.mkdirSync(opencodeTarget, { recursive: true });
    copyDirectoryRecursive(sourceDir, opencodeTarget);
    result.opencode.push(skillName + '/');
  });

  return result;
}

/**
 * Deploy agent files to Cursor and OpenCode directories
 * @returns {{ cursor: string[], opencode: string[] }} Deployed file lists
 */
function deployAgents() {
  const agentsDir = path.join(__dirname, '../plugin/agents');
  const agentFiles = fs.readdirSync(agentsDir)
    .filter(f => f.endsWith('.md'))
    .sort();

  const result = {
    cursor: [],
    opencode: []
  };

  agentFiles.forEach(filename => {
    const sourcePath = path.join(agentsDir, filename);
    const { frontmatter, content } = parseMarkdownWithFrontmatter(sourcePath);

    // Keep name, description, and model for agent frontmatter
    const transformedFrontmatter = {};
    if (frontmatter.name) transformedFrontmatter.name = frontmatter.name;
    if (frontmatter.description) transformedFrontmatter.description = frontmatter.description;
    if (frontmatter.model) transformedFrontmatter.model = frontmatter.model;

    // Deploy to Cursor
    const cursorPath = path.join(process.cwd(), '.cursor/agents', filename);
    writeMarkdownWithFrontmatter(cursorPath, transformedFrontmatter, content);
    result.cursor.push(filename);

    // Deploy to OpenCode
    const opencodePath = path.join(process.cwd(), '.opencode/agents', filename);
    writeMarkdownWithFrontmatter(opencodePath, transformedFrontmatter, content);
    result.opencode.push(filename);
  });

  return result;
}

/**
 * Main deployment function
 * @returns {Object} Deployment result with status and deployed files
 */
function deployPlugin() {
  try {
    // 1. Verify plugin directory exists
    const pluginDir = path.join(__dirname, '../plugin');
    if (!fs.existsSync(pluginDir)) {
      throw new Error('Plugin directory not found. Make sure you are in the zest-dev project root.');
    }

    // 2. Create target directories
    ensureDirectories();

    // 3. Deploy commands
    const commandsResult = deployCommands();

    // 4. Deploy skills
    const skillsResult = deploySkills();

    // 5. Deploy agents
    const agentsResult = deployAgents();

    // 6. Return result grouped by target
    return {
      ok: true,
      cursor: {
        commands: commandsResult.cursor,
        skills: skillsResult.cursor,
        agents: agentsResult.cursor
      },
      opencode: {
        commands: commandsResult.opencode,
        skills: skillsResult.opencode,
        agents: agentsResult.opencode
      }
    };
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
