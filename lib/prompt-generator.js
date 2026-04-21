const fs = require('fs');
const path = require('path');

const COMMANDS_DIR = path.join(__dirname, '..', 'plugin', 'commands');
const COMMAND_ALIASES = {
  summarize: 'summarize-chat'
};

function getAvailableCommands() {
  return fs.readdirSync(COMMANDS_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => path.basename(file, '.md'))
    .sort();
}

function resolveCommandName(command) {
  return COMMAND_ALIASES[command] || command;
}

/**
 * Generate a prompt for Codex editor
 * @param {string} command - Command name
 * @param {string} args - Command arguments (for 'new' command, this is the task description)
 * @returns {string} - The formatted prompt
 */
function generatePrompt(command, args = '') {
  const resolvedCommand = resolveCommandName(command);
  const validCommands = getAvailableCommands();

  if (!validCommands.includes(resolvedCommand)) {
    throw new Error(`Invalid command: ${command}. Must be one of: ${validCommands.join(', ')}`);
  }

  const commandFile = path.join(COMMANDS_DIR, `${resolvedCommand}.md`);

  if (!fs.existsSync(commandFile)) {
    throw new Error(`Command file not found: ${commandFile}`);
  }

  // Read the command file
  const content = fs.readFileSync(commandFile, 'utf-8');

  // Strip YAML frontmatter (everything between --- markers)
  const withoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');

  // Replace $ARGUMENTS placeholder with actual arguments
  let prompt = withoutFrontmatter.replace(/\$ARGUMENTS/g, args);

  // Trim excessive whitespace
  prompt = prompt.trim();

  return prompt;
}

module.exports = {
  generatePrompt,
  getAvailableCommands
};
