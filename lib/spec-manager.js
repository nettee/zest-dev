const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync, spawnSync } = require('child_process');

const SPECS_DIR = 'specs/change';
const ACTIVE_CHANGE_LINK = path.join(SPECS_DIR, 'active');
const LEGACY_CURRENT_LINK = path.join(SPECS_DIR, 'current');
const DEFAULT_TEMPLATE_PATH = path.join(__dirname, 'template', 'spec.md');
const DEFAULT_DESIGN_TEMPLATE_PATH = path.join(__dirname, 'template', 'design.md');
const DEFAULT_STEPS_TEMPLATE_PATH = path.join(__dirname, 'template', 'steps.md');
const VALID_STATUSES = ['new', 'researched', 'designed', 'planned', 'implemented'];
const STATUS_ORDER = {
  new: 0,
  researched: 1,
  designed: 2,
  planned: 3,
  implemented: 4
};
const ISSUE_SPEC_PROTOCOL_VERSION = 1;
const ISSUE_SPEC_LABELS = ['spec:change', 'archive'];

function pathExistsIncludingDanglingSymlink(filePath) {
  try {
    fs.lstatSync(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

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

function renderTemplate(templatePath, replacements) {
  const template = fs.readFileSync(templatePath, 'utf-8');

  return Object.entries(replacements).reduce(
    (content, [key, value]) => content.replace(new RegExp(`\\{${key}\\}`, 'g'), value),
    template
  );
}

/**
 * Get active change spec ID (full directory name, e.g. "20260224-init-project")
 */
function readSpecLinkId(linkPath) {
  if (!pathExistsIncludingDanglingSymlink(linkPath)) {
    return null;
  }

  try {
    const linkTarget = fs.readlinkSync(linkPath);
    return path.basename(linkTarget);
  } catch (error) {
    return null;
  }
}

function getActiveChangeSpecId() {
  return readSpecLinkId(ACTIVE_CHANGE_LINK) || readSpecLinkId(LEGACY_CURRENT_LINK);
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
  const activeId = getActiveChangeSpecId();
  let active_change = null;

  if (activeId) {
    const specDir = specDirs.find(dir => dir === activeId);

    if (specDir) {
      const specPath = getSpecFilePath(specDir);
      const frontmatter = parseSpecFrontmatter(specPath);

      active_change = {
        id: activeId,
        name: parseSpecName(specDir),
        path: specPath,
        status: frontmatter.status || 'new'
      };
    } else {
      // Keep id visible even if active symlink points to a removed spec.
      active_change = {
        id: activeId,
        name: null,
        path: null,
        status: null
      };
    }
  }

  return {
    specs_count: specDirs.length,
    active_change
  };
}

function getSpecFilePath(specDir) {
  const specMdPath = path.join(SPECS_DIR, specDir, 'spec.md');
  if (fs.existsSync(specMdPath)) {
    return specMdPath;
  }

  const readmePath = path.join(SPECS_DIR, specDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    return readmePath;
  }

  return specMdPath;
}

function validateSpecId(specId) {
  if (!/^\d{8}-[a-z0-9][a-z0-9-]*$/.test(specId)) {
    throw new Error(`Invalid spec-id "${specId}"`);
  }
}

function normalizeSpecIdentifier(specIdentifier) {
  if (specIdentifier === 'active' || specIdentifier === 'current') {
    return specIdentifier;
  }

  const trimmed = String(specIdentifier).replace(/[\\/]+$/, '');
  const basename = path.basename(trimmed);
  if (basename === 'spec.md' || basename === 'README.md') {
    return path.basename(path.dirname(trimmed));
  }

  return basename;
}

function normalizeIssueSpecPath(relativePath) {
  if (typeof relativePath !== 'string' || relativePath.trim() === '') {
    throw new Error('Invalid Issue Spec path: path is required');
  }
  if (relativePath.includes('\\') || relativePath.includes('\0')) {
    throw new Error(`Invalid Issue Spec path: ${relativePath}`);
  }
  if (path.isAbsolute(relativePath)) {
    throw new Error(`Invalid Issue Spec path: ${relativePath}`);
  }

  const normalized = path.posix.normalize(relativePath);
  if (
    normalized === '.' ||
    normalized.startsWith('../') ||
    normalized === '..' ||
    normalized.split('/').includes('..') ||
    normalized !== relativePath
  ) {
    throw new Error(`Invalid Issue Spec path: ${relativePath}`);
  }
  if (!normalized.endsWith('.md')) {
    throw new Error(`Invalid Issue Spec path: ${relativePath}`);
  }
  const directorySegments = normalized.split('/').slice(0, -1);
  if (directorySegments.some(segment => segment.endsWith('.md'))) {
    throw new Error(`Invalid Issue Spec path: ${relativePath}`);
  }

  return normalized;
}

function walkSpecDirectory(specDirPath, currentDir = specDirPath, files = []) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(currentDir, entry.name);
    const relativePath = path.relative(specDirPath, entryPath).split(path.sep).join('/');

    if (entry.isDirectory()) {
      walkSpecDirectory(specDirPath, entryPath, files);
    } else if (entry.isFile()) {
      if (!entry.name.endsWith('.md')) {
        continue;
      }
      files.push(relativePath);
    } else {
      throw new Error(`Unsupported file type in Spec directory: ${relativePath}`);
    }
  }
  return files;
}

function renderIssueSpecFile(specId, relativePath, content) {
  const metadata = yaml
    .dump(
      {
        'zest-dev-issue-spec': ISSUE_SPEC_PROTOCOL_VERSION,
        'spec-id': specId,
        path: relativePath
      },
      { lineWidth: -1 }
    )
    .trimEnd();
  return [
    '<!--',
    metadata,
    '-->',
    content
  ].join('\n');
}

function parseIssueSpecFile(text, location, { requireProtocol = true } = {}) {
  if (typeof text !== 'string') {
    throw new Error(`${location} must be a string`);
  }

  const match = text.match(/^<!--\n([\s\S]*?)\n-->\n?/);
  if (!match) {
    if (requireProtocol) {
      throw new Error(`Missing Issue Spec protocol header in ${location}`);
    }
    return null;
  }

  if (!requireProtocol && !/(^|\n)zest-dev-issue-spec\s*:/.test(match[1])) {
    return null;
  }

  let metadata;
  try {
    metadata = yaml.load(match[1]) || {};
  } catch (error) {
    throw new Error(`Malformed Issue Spec protocol header in ${location}: ${error.message}`);
  }

  if (metadata['zest-dev-issue-spec'] !== ISSUE_SPEC_PROTOCOL_VERSION) {
    throw new Error(`Unsupported Issue Spec protocol version in ${location}`);
  }
  if (!metadata['spec-id']) {
    throw new Error(`Missing spec-id in ${location}`);
  }

  validateSpecId(metadata['spec-id']);
  const relativePath = normalizeIssueSpecPath(metadata.path);

  return {
    specId: metadata['spec-id'],
    path: relativePath,
    content: text.slice(match[0].length)
  };
}

function specToIssueRepresentation(specIdentifier) {
  const spec = getSpec(specIdentifier);
  validateSpecId(spec.id);

  const specDirPath = path.join(SPECS_DIR, spec.id);
  const specMdPath = path.join(specDirPath, 'spec.md');
  if (!fs.existsSync(specMdPath)) {
    throw new Error('Issue Spec Representation requires spec.md');
  }

  const markdownFiles = walkSpecDirectory(specDirPath).sort();
  if (!markdownFiles.includes('spec.md')) {
    throw new Error('Issue Spec Representation requires spec.md');
  }

  const body = renderIssueSpecFile(
    spec.id,
    'spec.md',
    fs.readFileSync(specMdPath, 'utf-8')
  );
  const comments = markdownFiles
    .filter(relativePath => relativePath !== 'spec.md')
    .map(relativePath => {
      normalizeIssueSpecPath(relativePath);
      return renderIssueSpecFile(
        spec.id,
        relativePath,
        fs.readFileSync(path.join(specDirPath, ...relativePath.split('/')), 'utf-8')
      );
    });

  return {
    title: `[archive] ${spec.id}`,
    labels: [...ISSUE_SPEC_LABELS],
    body,
    comments
  };
}

function issueRepresentationToFiles(issueRepresentation) {
  if (!issueRepresentation || typeof issueRepresentation !== 'object') {
    throw new Error('Issue Spec Representation must be an object');
  }

  const bodyFile = parseIssueSpecFile(issueRepresentation.body, 'issue body');
  if (bodyFile.path !== 'spec.md') {
    throw new Error('Issue body path must be spec.md');
  }
  if (bodyFile.content.length === 0) {
    throw new Error('Missing spec.md content in issue body');
  }

  const files = new Map();
  files.set('spec.md', bodyFile.content);

  const comments = issueRepresentation.comments || [];
  if (!Array.isArray(comments)) {
    throw new Error('Issue Spec comments must be an array');
  }

  for (const [index, comment] of comments.entries()) {
    const commentBody = typeof comment === 'string' ? comment : comment && comment.body;
    const parsed = parseIssueSpecFile(commentBody, `issue comment ${index + 1}`, {
      requireProtocol: false
    });
    if (!parsed) {
      continue;
    }
    if (parsed.specId !== bodyFile.specId) {
      throw new Error(`Mismatched comment spec-id "${parsed.specId}" for ${parsed.path}`);
    }
    if (parsed.path === 'spec.md') {
      throw new Error('Issue comments must not represent spec.md');
    }
    if (files.has(parsed.path)) {
      throw new Error(`Duplicate Issue Spec path: ${parsed.path}`);
    }
    files.set(parsed.path, parsed.content);
  }

  return {
    specId: bodyFile.specId,
    files: [...files.entries()].map(([relativePath, content]) => ({ path: relativePath, content }))
  };
}

function writeIssueRepresentation(issueRepresentation, source) {
  const { specId, files } = issueRepresentationToFiles(issueRepresentation);
  const specDirPath = path.join(SPECS_DIR, specId);
  const tempDirPath = path.join(SPECS_DIR, `.${specId}.tmp-${process.pid}-${Date.now()}`);

  if (fs.existsSync(specDirPath)) {
    throw new Error(`Target Spec directory already exists: ${specDirPath}`);
  }

  try {
    fs.mkdirSync(tempDirPath, { recursive: true });
    for (const file of files) {
      const relativePath = normalizeIssueSpecPath(file.path);
      const targetPath = path.join(tempDirPath, ...relativePath.split('/'));
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.writeFileSync(targetPath, file.content, 'utf-8');
    }
    fs.renameSync(tempDirPath, specDirPath);
  } catch (error) {
    if (fs.existsSync(tempDirPath)) {
      fs.rmSync(tempDirPath, { recursive: true, force: true });
    }
    throw error;
  }

  return {
    ok: true,
    spec: {
      id: specId,
      path: path.join(SPECS_DIR, specId, 'spec.md'),
      active: getActiveChangeSpecId() === specId,
      status: parseSpecFrontmatter(path.join(specDirPath, 'spec.md')).status || 'new'
    },
    source
  };
}

function loadIssueRepresentationFromFile(filePath) {
  if (!filePath) {
    throw new Error('Missing --from-file path');
  }
  if (!fs.existsSync(filePath)) {
    throw new Error(`Issue Spec file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  let parsed;
  try {
    parsed = yaml.load(content);
  } catch (error) {
    throw new Error(`Invalid Issue Spec file ${filePath}: ${error.message}`);
  }

  const issueRepresentation = parsed && parsed.issue ? parsed.issue : parsed;
  return writeIssueRepresentation(issueRepresentation, { type: 'file', path: filePath });
}

function runRequiredCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf-8',
    input: options.input,
    cwd: process.cwd()
  });

  if (result.error) {
    throw new Error(`Failed to run ${command}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const details = [result.stderr, result.stdout].filter(Boolean).join('\n').trim();
    throw new Error(`${command} ${args.join(' ')} failed${details ? `: ${details}` : ''}`);
  }

  return result.stdout.trim();
}

function inferForgeFromOrigin() {
  const result = spawnSync('git', ['remote', 'get-url', 'origin'], {
    encoding: 'utf-8',
    cwd: process.cwd()
  });

  if (result.status !== 0 || result.error) {
    return 'github';
  }

  const remoteUrl = result.stdout.trim();
  if (remoteUrl === '') {
    return 'github';
  }

  const lowerRemoteUrl = remoteUrl.toLowerCase();
  let host = null;
  const sshMatch = lowerRemoteUrl.match(/^[^@]+@([^:]+):/);
  if (sshMatch) {
    host = sshMatch[1];
  } else {
    try {
      host = new URL(lowerRemoteUrl).hostname;
    } catch (error) {
      host = null;
    }
  }

  if (!host) {
    return 'github';
  }
  if (host === 'github.com') {
    return 'github';
  }
  if (host.includes('forgejo') || host === 'codeberg.org') {
    return 'forgejo';
  }

  return `unsupported:${host}`;
}

function requireSupportedForge() {
  const forge = inferForgeFromOrigin();
  if (forge === 'forgejo') {
    throw new Error('Unsupported forge transport: forgejo');
  }
  if (forge.startsWith('unsupported:')) {
    throw new Error(`Unsupported forge transport for remote origin host: ${forge.slice('unsupported:'.length)}`);
  }
  return forge;
}

function requireGhAuth() {
  runRequiredCommand('gh', ['auth', 'status']);
}

function dumpSpec(specIdentifier, options = {}) {
  const issue = specToIssueRepresentation(specIdentifier);
  if (options.dryRun) {
    return { ok: true, issue };
  }

  requireSupportedForge();
  requireGhAuth();

  const createArgs = ['issue', 'create', '--title', issue.title, '--body-file', '-'];
  for (const label of issue.labels) {
    createArgs.push('--label', label);
  }

  const issueUrl = runRequiredCommand('gh', createArgs, { input: issue.body });
  try {
    for (const comment of issue.comments) {
      runRequiredCommand('gh', ['issue', 'comment', issueUrl, '--body-file', '-'], {
        input: comment
      });
    }
    runRequiredCommand('gh', ['issue', 'close', issueUrl]);
  } catch (error) {
    throw new Error(`${error.message}; created issue before failure: ${issueUrl}`);
  }

  return {
    ok: true,
    issue: {
      url: issueUrl,
      title: issue.title,
      labels: issue.labels,
      comments: issue.comments.length,
      closed: true
    }
  };
}

function readGithubIssue(issue) {
  requireSupportedForge();
  requireGhAuth();

  const output = runRequiredCommand('gh', ['issue', 'view', issue, '--json', 'body,comments']);
  let parsed;
  try {
    parsed = JSON.parse(output);
  } catch (error) {
    throw new Error(`gh issue view returned invalid JSON: ${error.message}`);
  }

  return {
    body: parsed.body,
    comments: Array.isArray(parsed.comments) ? parsed.comments : []
  };
}

function loadIssueRepresentation(issueOrOptions, options = {}) {
  if (options.fromFile) {
    return loadIssueRepresentationFromFile(options.fromFile);
  }
  if (!issueOrOptions) {
    throw new Error('Missing issue URL or number');
  }

  const issue = readGithubIssue(issueOrOptions);
  return writeIssueRepresentation(issue, { type: 'github', issue: issueOrOptions });
}

/**
 * Get spec details by ID (full dir name) or "active"
 */
function getSpec(specIdentifier) {
  let specId = normalizeSpecIdentifier(specIdentifier);

  if (specId === 'active' || specId === 'current') {
    specId = getActiveChangeSpecId();
    if (!specId) {
      throw new Error('No active change spec set');
    }
  }

  const specDirs = getSpecDirs();
  const specDir = specDirs.find(dir => dir === specId);

  if (!specDir) {
    throw new Error(`Spec ${specId} not found`);
  }

  const specPath = getSpecFilePath(specDir);
  const frontmatter = parseSpecFrontmatter(specPath);
  const activeId = getActiveChangeSpecId();

  return {
    id: specId,
    name: parseSpecName(specDir),
    path: specPath,
    active: specId === activeId,
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

  const name = parseSpecName(specDirName);
  const date = new Date().toISOString().split('T')[0];
  const replacements = {
    id: specDirName,
    name,
    date
  };

  const specPath = path.join(specDirPath, 'spec.md');
  fs.writeFileSync(specPath, renderTemplate(DEFAULT_TEMPLATE_PATH, replacements), 'utf-8');
  fs.writeFileSync(
    path.join(specDirPath, 'design.md'),
    renderTemplate(DEFAULT_DESIGN_TEMPLATE_PATH, replacements),
    'utf-8'
  );
  fs.writeFileSync(
    path.join(specDirPath, 'steps.md'),
    renderTemplate(DEFAULT_STEPS_TEMPLATE_PATH, replacements),
    'utf-8'
  );

  return {
    ok: true,
    spec: {
      id: specDirName,
      name: name,
      path: specPath,
      active: false,
      status: 'new'
    }
  };
}

/**
 * Set active change spec
 */
function setActiveChangeSpec(specId) {
  specId = normalizeSpecIdentifier(specId);
  const specDirs = getSpecDirs();
  const specDir = specDirs.find(dir => dir === specId);

  if (!specDir) {
    throw new Error(`Spec ${specId} not found`);
  }

  // Remove existing symlinks if they exist
  if (pathExistsIncludingDanglingSymlink(ACTIVE_CHANGE_LINK)) {
    fs.unlinkSync(ACTIVE_CHANGE_LINK);
  }
  if (pathExistsIncludingDanglingSymlink(LEGACY_CURRENT_LINK)) {
    fs.unlinkSync(LEGACY_CURRENT_LINK);
  }

  // Create new symlink
  const linkPath = path.resolve(ACTIVE_CHANGE_LINK);
  const linkDir = path.dirname(linkPath);
  const relativePath = path.relative(linkDir, path.resolve(SPECS_DIR, specDir));

  fs.symlinkSync(relativePath, ACTIVE_CHANGE_LINK);

  return {
    ok: true,
    active_change: specId
  };
}

/**
 * Unset active change spec
 */
function unsetActiveChangeSpec() {
  if (pathExistsIncludingDanglingSymlink(ACTIVE_CHANGE_LINK)) {
    fs.unlinkSync(ACTIVE_CHANGE_LINK);
  }
  if (pathExistsIncludingDanglingSymlink(LEGACY_CURRENT_LINK)) {
    fs.unlinkSync(LEGACY_CURRENT_LINK);
  }

  return {
    ok: true,
    active_change: null
  };
}

/**
 * Get slug from directory name (e.g., "20260224-init-project" -> "init-project")
 */
function getSpecSlug(dirName) {
  return dirName.replace(/^\d{8}-/, '');
}

/**
 * Create a git branch from the active change spec's slug
 */
function createBranchFromActiveChangeSpec() {
  const activeId = getActiveChangeSpecId();
  if (!activeId) {
    throw new Error('No active change spec set');
  }

  const specDirs = getSpecDirs();
  const specDir = specDirs.find(dir => dir === activeId);
  if (!specDir) {
    throw new Error(`Spec ${activeId} not found`);
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

/**
 * List all specs with id, name, status, and active flag
 */
function listSpecs() {
  const specDirs = getSpecDirs();
  const activeId = getActiveChangeSpecId();

  return specDirs.map(dir => {
    const specPath = getSpecFilePath(dir);
    const frontmatter = parseSpecFrontmatter(specPath);
    return {
      id: dir,
      name: parseSpecName(dir),
      status: frontmatter.status || 'new',
      active: dir === activeId
    };
  });
}

module.exports = {
  getSpecsStatus,
  getSpec,
  listSpecs,
  createSpec,
  setActiveChangeSpec,
  unsetActiveChangeSpec,
  updateSpecStatus,
  createBranchFromActiveChangeSpec,
  dumpSpec,
  loadIssueRepresentation,
  // Backwards-compatible internal aliases
  setCurrentSpec: setActiveChangeSpec,
  unsetCurrentSpec: unsetActiveChangeSpec,
  createBranchFromCurrentSpec: createBranchFromActiveChangeSpec
};
