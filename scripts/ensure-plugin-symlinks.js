const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const pluginDir = path.join(rootDir, 'plugin');

const links = [
  ['commands', 'commands'],
  ['skills', 'skills'],
  ['agents', 'agents']
];

function ensureDirectory(name, dirPath) {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`${name} directory not found: ${dirPath}`);
  }
}

function ensurePluginSymlink(linkName, targetName) {
  ensureDirectory(targetName, path.join(rootDir, targetName));
  ensureDirectory('plugin', pluginDir);

  const linkPath = path.join(pluginDir, linkName);
  const targetPath = path.join(rootDir, targetName);

  let stat = null;
  try {
    stat = fs.lstatSync(linkPath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  if (stat) {
    if (!stat.isSymbolicLink()) {
      throw new Error(`Expected ${linkPath} to be a symlink, found non-symlink`);
    }

    const actualTarget = fs.realpathSync(linkPath);
    const expectedTarget = fs.realpathSync(targetPath);
    if (actualTarget !== expectedTarget) {
      throw new Error(`Expected ${linkPath} to point to ${expectedTarget}, got ${actualTarget}`);
    }

    return;
  }

  const symlinkTarget = process.platform === 'win32'
    ? targetPath
    : path.relative(pluginDir, targetPath);
  const symlinkType = process.platform === 'win32' ? 'junction' : 'dir';
  fs.symlinkSync(symlinkTarget, linkPath, symlinkType);
}

links.forEach(([linkName, targetName]) => ensurePluginSymlink(linkName, targetName));
