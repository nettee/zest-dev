const fs = require('fs');
const path = require('path');

const SOURCE_SKILLS_DIR = path.join(__dirname, '../skills');
const REMOVED_ZEST_DEV_SKILL_FILES = new Set(['new.md', 'research.md', 'implement.md']);

function getHomeDirectory() {
  return process.env.HOME || process.env.USERPROFILE;
}

function assertAbsolutePath(name, value) {
  if (!path.isAbsolute(value)) {
    throw new Error(`${name} must be an absolute path: ${value}`);
  }
}

function getGlobalSkillsDir() {
  const homeDir = getHomeDirectory();
  if (!homeDir) {
    throw new Error('HOME is not set');
  }
  assertAbsolutePath('HOME', homeDir);
  return path.join(homeDir, '.agents', 'skills');
}

function listPackagedSkillNames() {
  if (!fs.existsSync(SOURCE_SKILLS_DIR)) {
    throw new Error('Skills directory not found. Make sure the zest-dev package is installed correctly.');
  }

  return fs.readdirSync(SOURCE_SKILLS_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
}

function cleanupRemovedZestDevSkillFiles(skillDir) {
  if (!fs.existsSync(skillDir)) {
    return;
  }

  REMOVED_ZEST_DEV_SKILL_FILES.forEach(filename => {
    const filePath = path.join(skillDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
}

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
 * Install every packaged skill under ~/.agents/skills/<name>/
 * @returns {{ ok: true, skillsDir: string, skills: string[] }}
 */
function installSkills() {
  try {
    const skillsDir = getGlobalSkillsDir();
    const skillNames = listPackagedSkillNames();

    fs.mkdirSync(skillsDir, { recursive: true });

    const installed = [];

    skillNames.forEach(skillName => {
      const sourceDir = path.join(SOURCE_SKILLS_DIR, skillName);
      const targetDir = path.join(skillsDir, skillName);

      fs.mkdirSync(targetDir, { recursive: true });
      if (skillName === 'zest-dev') {
        cleanupRemovedZestDevSkillFiles(targetDir);
      }
      copyDirectoryRecursive(sourceDir, targetDir);
      installed.push(`${skillName}/`);
    });

    return {
      ok: true,
      skillsDir,
      skills: installed
    };
  } catch (error) {
    if (error.code === 'EACCES') {
      throw new Error(`Permission denied: ${error.path}`);
    }
    if (error.code === 'ENOENT' && error.path) {
      throw new Error(`File not found: ${error.path}`);
    }
    throw error;
  }
}

module.exports = {
  installSkills,
  getGlobalSkillsDir
};
