const fs = require('fs');
const path = require('path');

/**
 * Generate a prompt for Codex editor
 * @param {string} command - Command name (new, research, design, implement, summarize)
 * @param {string} args - Command arguments (for 'new' command, this is the task description)
 * @returns {string} - The formatted prompt
 */
function generatePrompt(command, args = '') {
  const validCommands = ['new', 'research', 'design', 'implement', 'summarize'];

  if (!validCommands.includes(command)) {
    throw new Error(`Invalid command: ${command}. Must be one of: ${validCommands.join(', ')}`);
  }

  // Get the plugin directory path (relative to this file)
  const pluginDir = path.join(__dirname, '..', 'plugin');
  const commandFile = path.join(pluginDir, 'commands', `${command}.md`);

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
  generatePrompt
};
