const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync, spawnSync } = require('child_process');

const SPECS_DIR = 'specs';
const CURRENT_LINK = path.join(SPECS_DIR, 'current');
const TEMPLATE_PATH = '.zest-dev/template/spec.md';
const DEFAULT_TEMPLATE_PATH = path.join(__dirname, 'template', 'spec.md');
const VALID_STATUSES = ['new', 'researched', 'designed', 'implemented'];
const STATUS_ORDER = {
  new: 0,
  researched: 1,
  designed: 2,
  implemented: 3
};

/**
 * Get all spec directories
 */
function getSpecDirs() {
  if (!fs.existsSync(SPECS_DIR)) {
    return [];
  }

  const entries = fs.readdirSync(SPECS_DIR, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory() && /^\d{8}-/.test(entry.name))
    .map(entry => entry.name)
    .sort();
}

/**
 * Parse spec name from directory name (e.g., "20260224-init-project" -> "Init Project")
 */
function parseSpecName(dirName) {
  const name = dirName.replace(/^\d{8}-/, '');
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get current spec ID (full directory name, e.g. "20260224-init-project")
 */
function getCurrentSpecId() {
  if (!fs.existsSync(CURRENT_LINK)) {
    return null;
  }

  try {
    const linkTarget = fs.readlinkSync(CURRENT_LINK);
    return path.basename(linkTarget);
  } catch (error) {
    return null;
  }
}

/**
 * Parse frontmatter from spec file
 */
function parseSpecFrontmatter(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);

  if (!match) {
    return {};
  }

  try {
    return yaml.load(match[1]) || {};
  } catch (error) {
    return {};
  }
}

/**
 * Get project status
 */
function getSpecsStatus() {
  const specDirs = getSpecDirs();
  const currentId = getCurrentSpecId();
  let current = null;

  if (currentId) {
    const specDir = specDirs.find(dir => dir === currentId);

    if (specDir) {
      const specPath = getSpecFilePath(specDir);
      const frontmatter = parseSpecFrontmatter(specPath);

      current = {
        id: currentId,
        name: parseSpecName(specDir),
        path: specPath,
        status: frontmatter.status || 'new'
      };
    } else {
      // Keep id visible even if current symlink points to a removed spec.
      current = {
        id: currentId,
        name: null,
        path: null,
        status: null
      };
    }
  }

  return {
    specs_count: specDirs.length,
    current
  };
}

/**
 * Get spec file path (supports both spec.md and README.md for backwards compatibility)
 */
function getSpecFilePath(specDir) {
  const specMdPath = path.join(SPECS_DIR, specDir, 'spec.md');
  const readmePath = path.join(SPECS_DIR, specDir, 'README.md');

  if (fs.existsSync(specMdPath)) {
    return specMdPath;
  } else if (fs.existsSync(readmePath)) {
    return readmePath;
  }

  return specMdPath; // Default to spec.md for new specs
}

/**
 * Get spec details by ID (full dir name) or "current"
 */
function getSpec(specIdentifier) {
  let specId = specIdentifier;

  if (specIdentifier === 'current') {
    specId = getCurrentSpecId();
    if (!specId) {
      throw new Error('No current spec set');
    }
  }

  const specDirs = getSpecDirs();
  const specDir = specDirs.find(dir => dir === specId);

  if (!specDir) {
    throw new Error(`Spec ${specId} not found`);
  }

  const specPath = getSpecFilePath(specDir);
  const frontmatter = parseSpecFrontmatter(specPath);
  const currentId = getCurrentSpecId();

  return {
    id: specId,
    name: parseSpecName(specDir),
    path: specPath,
    current: specId === currentId,
    status: frontmatter.status || 'new'
  };
}

/**
 * Create a new spec
 */
function createSpec(slug) {
  // Ensure specs directory exists
  if (!fs.existsSync(SPECS_DIR)) {
    fs.mkdirSync(SPECS_DIR, { recursive: true });
  }

  // Generate date-based spec ID
  const datePrefix = new Date().toISOString().split('T')[0].replace(/-/g, '');

  // Create spec directory
  const specDirName = `${datePrefix}-${slug}`;
  const specDirPath = path.join(SPECS_DIR, specDirName);

  if (fs.existsSync(specDirPath)) {
    throw new Error(`Spec directory ${specDirName} already exists`);
  }

  fs.mkdirSync(specDirPath, { recursive: true });

  // Read template (user override first, packaged default second)
  const templatePath = fs.existsSync(TEMPLATE_PATH) ? TEMPLATE_PATH : DEFAULT_TEMPLATE_PATH;
  const template = fs.readFileSync(templatePath, 'utf-8');

  // Replace template variables
  const name = parseSpecName(specDirName);
  const date = new Date().toISOString().split('T')[0];
  const specContent = template
    .replace(/\{id\}/g, specDirName)
    .replace(/\{name\}/g, name)
    .replace(/\{date\}/g, date);

  // Write spec file
  const specPath = path.join(specDirPath, 'spec.md');
  fs.writeFileSync(specPath, specContent, 'utf-8');

  return {
    ok: true,
    spec: {
      id: specDirName,
      name: name,
      path: specPath,
      current: false,
      status: 'new'
    }
  };
}

/**
 * Set current spec
 */
function setCurrentSpec(specId) {
  // Allow full relative paths like "specs/20260224-foo" or "specs/20260224-foo/"
  specId = path.basename(specId.replace(/\/+$/, ''));
  const specDirs = getSpecDirs();
  const specDir = specDirs.find(dir => dir === specId);

  if (!specDir) {
    throw new Error(`Spec ${specId} not found`);
  }

  // Remove existing symlink if it exists
  if (fs.existsSync(CURRENT_LINK)) {
    fs.unlinkSync(CURRENT_LINK);
  }

  // Create new symlink
  const linkPath = path.resolve(CURRENT_LINK);
  const linkDir = path.dirname(linkPath);
  const relativePath = path.relative(linkDir, path.resolve(SPECS_DIR, specDir));

  fs.symlinkSync(relativePath, CURRENT_LINK);

  return {
    ok: true,
    current: specId
  };
}

/**
 * Unset current spec
 */
function unsetCurrentSpec() {
  if (fs.existsSync(CURRENT_LINK)) {
    fs.unlinkSync(CURRENT_LINK);
  }

  return {
    ok: true,
    current: null
  };
}

/**
 * Get slug from directory name (e.g., "20260224-init-project" -> "init-project")
 */
function getSpecSlug(dirName) {
  return dirName.replace(/^\d{8}-/, '');
}

/**
 * Create a git branch from the current spec's slug
 */
function createBranchFromCurrentSpec() {
  const currentId = getCurrentSpecId();
  if (!currentId) {
    throw new Error('No current spec set');
  }

  const specDirs = getSpecDirs();
  const specDir = specDirs.find(dir => dir === currentId);
  if (!specDir) {
    throw new Error(`Spec ${currentId} not found`);
  }

  const slug = getSpecSlug(specDir);
  const result = spawnSync('git', ['checkout', '-b', slug], { stdio: 'inherit' });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status);
  }

  return { ok: true, branch: slug };
}

/**
 * Update spec status with forward-only transitions (skip allowed)
 */
function updateSpecStatus(specIdentifier, nextStatus) {
  if (!VALID_STATUSES.includes(nextStatus)) {
    throw new Error(`Invalid status "${nextStatus}". Valid: ${VALID_STATUSES.join(', ')}`);
  }

  const spec = getSpec(specIdentifier);
  const content = fs.readFileSync(spec.path, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---(\n[\s\S]*)?$/);

  if (!match) {
    throw new Error(`Spec file ${spec.path} has no valid frontmatter`);
  }

  const frontmatter = yaml.load(match[1]);
  const currentStatus = frontmatter ? frontmatter.status : undefined;

  if (!VALID_STATUSES.includes(currentStatus)) {
    throw new Error(
      `Invalid current status "${currentStatus}" for spec ${spec.id}. Valid: ${VALID_STATUSES.join(', ')}`
    );
  }

  if (currentStatus === nextStatus) {
    throw new Error(`Status is already "${nextStatus}" for spec ${spec.id}`);
  }

  if (STATUS_ORDER[nextStatus] < STATUS_ORDER[currentStatus]) {
    throw new Error(`Invalid transition ${currentStatus} -> ${nextStatus}`);
  }

  frontmatter.status = nextStatus;
  const body = match[2] || '\n';
  const nextFrontmatter = yaml.dump(frontmatter, { lineWidth: -1 }).trimEnd();
  const nextContent = `---\n${nextFrontmatter}\n---${body}`;

  fs.writeFileSync(spec.path, nextContent, 'utf-8');

  return {
    ok: true,
    spec: {
      id: spec.id,
      status: nextStatus
    },
    status: {
      from: currentStatus,
      to: nextStatus,
      changed: true
    }
  };
}

module.exports = {
  getSpecsStatus,
  getSpec,
  createSpec,
  setCurrentSpec,
  unsetCurrentSpec,
  updateSpecStatus,
  createBranchFromCurrentSpec
};
