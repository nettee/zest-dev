const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const SPECS_DIR = 'specs';
const CURRENT_LINK = path.join(SPECS_DIR, 'current');
const TEMPLATE_PATH = '.zest-spec/template/spec.md';
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
    .filter(entry => entry.isDirectory() && /^\d{3}-/.test(entry.name))
    .map(entry => entry.name)
    .sort();
}

/**
 * Parse spec ID from directory name (e.g., "001-init-project" -> "001")
 */
function parseSpecId(dirName) {
  const match = dirName.match(/^(\d{3})-/);
  return match ? match[1] : null;
}

/**
 * Parse spec name from directory name (e.g., "001-init-project" -> "Init Project")
 */
function parseSpecName(dirName) {
  const name = dirName.replace(/^\d{3}-/, '');
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get current spec ID
 */
function getCurrentSpecId() {
  if (!fs.existsSync(CURRENT_LINK)) {
    return null;
  }

  try {
    const linkTarget = fs.readlinkSync(CURRENT_LINK);
    const dirName = path.basename(linkTarget);
    return parseSpecId(dirName);
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
    const specDir = specDirs.find(dir => parseSpecId(dir) === currentId);

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
 * Get spec details by ID or "current"
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
  const specDir = specDirs.find(dir => parseSpecId(dir) === specId);

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

  // Generate next spec ID
  const specDirs = getSpecDirs();
  const lastId = specDirs.length > 0
    ? parseInt(parseSpecId(specDirs[specDirs.length - 1]))
    : 0;
  const newId = String(lastId + 1).padStart(3, '0');

  // Create spec directory
  const specDirName = `${newId}-${slug}`;
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
    .replace(/\{id\}/g, newId)
    .replace(/\{name\}/g, name)
    .replace(/\{date\}/g, date);

  // Write spec file
  const specPath = path.join(specDirPath, 'spec.md');
  fs.writeFileSync(specPath, specContent, 'utf-8');

  return {
    ok: true,
    spec: {
      id: newId,
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
  const specDirs = getSpecDirs();
  const specDir = specDirs.find(dir => parseSpecId(dir) === specId);

  if (!specDir) {
    throw new Error(`Spec ${specId} not found`);
  }

  // Remove existing symlink if it exists
  if (fs.existsSync(CURRENT_LINK)) {
    fs.unlinkSync(CURRENT_LINK);
  }

  // Create new symlink
  const targetPath = path.join('..', SPECS_DIR, specDir);
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
  updateSpecStatus
};
