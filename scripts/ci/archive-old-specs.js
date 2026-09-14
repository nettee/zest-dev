#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DEFAULT_SPECS_DIR = path.join('specs', 'change');
const SPEC_ID_PATTERN = /^\d{8}-[a-z0-9][a-z0-9-]*$/;
const DAY_MS = 24 * 60 * 60 * 1000;
const POST_DUMP_ISSUE_LOOKUP_ATTEMPTS = 3;
const POST_DUMP_ISSUE_LOOKUP_DELAY_MS = 1000;

function sleepMs(delayMs) {
  if (delayMs <= 0) return;
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delayMs);
}

function parseUtcDatePrefix(specId) {
  const prefix = specId.slice(0, 8);
  const year = Number(prefix.slice(0, 4));
  const month = Number(prefix.slice(4, 6));
  const day = Number(prefix.slice(6, 8));
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid spec date prefix: ${specId}`);
  }

  return timestamp;
}

function cutoffTimestamp(now = new Date(), maxAgeDays = 10) {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - maxAgeDays * DAY_MS;
}

function archiveSpecId(specIdentifier) {
  return specIdentifier.endsWith('.md') ? specIdentifier.slice(0, -3) : specIdentifier;
}

function archiveSourcePath(specsDir, specIdentifier) {
  return path.join(specsDir, specIdentifier);
}

function dumpIdentifier(specsDir, specIdentifier) {
  return specIdentifier.endsWith('.md')
    ? archiveSourcePath(specsDir, specIdentifier)
    : specIdentifier;
}

function removeArchivedSource(sourcePath) {
  const stat = fs.lstatSync(sourcePath);
  if (stat.isDirectory()) {
    fs.rmSync(sourcePath, { recursive: true, force: false });
    return;
  }
  fs.unlinkSync(sourcePath);
}

function listEarliestSpecs({ specsDir = DEFAULT_SPECS_DIR, limit = 10 } = {}) {
  if (!fs.existsSync(specsDir)) {
    throw new Error(`Specs directory not found: ${specsDir}`);
  }

  const candidates = fs.readdirSync(specsDir, { withFileTypes: true })
    .filter(entry => (
      (entry.isDirectory() && SPEC_ID_PATTERN.test(entry.name)) ||
      (entry.isFile() && entry.name.endsWith('.md') && SPEC_ID_PATTERN.test(archiveSpecId(entry.name)))
    ))
    .map(entry => entry.name)
    .sort((left, right) => archiveSpecId(left).localeCompare(archiveSpecId(right)));

  const seenIds = new Set();
  for (const candidate of candidates) {
    const specId = archiveSpecId(candidate);
    if (seenIds.has(specId)) {
      throw new Error(`Ambiguous archive Spec ID: both ${specId} and ${specId}.md exist in ${specsDir}`);
    }
    seenIds.add(specId);
  }

  return candidates.slice(0, limit);
}

function selectSpecsToArchive({ specsDir = DEFAULT_SPECS_DIR, now = new Date(), limit = 10, maxAgeDays = 10 } = {}) {
  const cutoff = cutoffTimestamp(now, maxAgeDays);
  return listEarliestSpecs({ specsDir, limit })
    .filter(specIdentifier => parseUtcDatePrefix(archiveSpecId(specIdentifier)) < cutoff);
}

function findArchiveIssue(specId, { runner = execFileSync } = {}) {
  const title = `[archive] ${specId}`;
  const output = runner('gh', [
    'issue',
    'list',
    '--state',
    'all',
    '--search',
    `${JSON.stringify(title)} in:title`,
    '--json',
    'number',
    '--limit',
    '1'
  ], { encoding: 'utf8' });
  const issues = JSON.parse(output);
  if (!Array.isArray(issues)) {
    throw new Error(`Unexpected gh issue list output for ${specId}`);
  }
  return issues[0] ?? null;
}

function archiveIssueExists(specId, { runner = execFileSync } = {}) {
  return findArchiveIssue(specId, { runner }) !== null;
}

function findArchiveIssueWithRetry(specId, { runner = execFileSync, attempts = POST_DUMP_ISSUE_LOOKUP_ATTEMPTS, delayMs = POST_DUMP_ISSUE_LOOKUP_DELAY_MS, sleep = sleepMs } = {}) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const issue = findArchiveIssue(specId, { runner });
    if (issue || attempt === attempts) return issue;
    sleep(delayMs);
  }
  return null;
}

function formatIssueLine({ specId, issueNumber }) {
  return `- #${issueNumber} \`${specId}\``;
}

function writeGitHubOutput(result) {
  if (!process.env.GITHUB_OUTPUT) return;
  const issueLines = result.associatedIssues.map(formatIssueLine).join('\n');
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `archive_issue_lines<<EOF\n${issueLines}\nEOF\n`);
}

function commandErrorDetails(error) {
  const details = [error && error.stderr, error && error.stdout, error && error.message]
    .map(value => {
      if (Buffer.isBuffer(value)) return value.toString('utf8').trim();
      return typeof value === 'string' ? value.trim() : '';
    })
    .filter(Boolean);

  return details[0] || 'unknown error';
}

function preflightSpecs(specIdentifiers, { specsDir = DEFAULT_SPECS_DIR, runner = execFileSync } = {}) {
  // Date-named directories and standalone Markdown files are candidates by contract; invalid candidates are
  // rejected here instead of being silently skipped or partially archived.
  for (const specIdentifier of specIdentifiers) {
    try {
      runner('zest-dev', ['dump', dumpIdentifier(specsDir, specIdentifier), '--dry-run'], { encoding: 'utf8' });
    } catch (error) {
      const candidatePath = archiveSourcePath(specsDir, specIdentifier);
      throw new Error(`Archive preflight failed for ${candidatePath}: ${commandErrorDetails(error)}`);
    }
  }
}

function archiveSpecs({ specsDir = DEFAULT_SPECS_DIR, now = new Date(), limit = 10, maxAgeDays = 10, runner = execFileSync, postDumpIssueLookupAttempts = POST_DUMP_ISSUE_LOOKUP_ATTEMPTS, postDumpIssueLookupDelayMs = POST_DUMP_ISSUE_LOOKUP_DELAY_MS, sleep = sleepMs } = {}) {
  const specIdentifiers = selectSpecsToArchive({ specsDir, now, limit, maxAgeDays });
  preflightSpecs(specIdentifiers, { specsDir, runner });

  const archived = [];
  const skippedExistingIssue = [];
  const associatedIssues = [];

  for (const specIdentifier of specIdentifiers) {
    const specId = archiveSpecId(specIdentifier);
    const sourcePath = archiveSourcePath(specsDir, specIdentifier);
    const existingIssue = findArchiveIssue(specId, { runner });
    if (existingIssue) {
      removeArchivedSource(sourcePath);
      skippedExistingIssue.push(specId);
      associatedIssues.push({ specId, issueNumber: existingIssue.number });
      continue;
    }

    runner('zest-dev', ['dump', dumpIdentifier(specsDir, specIdentifier)], { stdio: 'inherit' });
    const archiveIssue = findArchiveIssueWithRetry(specId, { runner, attempts: postDumpIssueLookupAttempts, delayMs: postDumpIssueLookupDelayMs, sleep });
    if (!archiveIssue) throw new Error(`Archive issue was not created for ${specId}`);
    removeArchivedSource(sourcePath);
    archived.push(specId);
    associatedIssues.push({ specId, issueNumber: archiveIssue.number });
  }

  return { archived, skippedExistingIssue, associatedIssues };
}

function main() {
  const result = archiveSpecs();
  writeGitHubOutput(result);
  if (result.archived.length === 0 && result.skippedExistingIssue.length === 0) {
    console.log('No old specs eligible for archival.');
    return;
  }
  if (result.archived.length > 0) {
    console.log(`Archived and removed ${result.archived.length} spec(s): ${result.archived.join(', ')}`);
  }
  if (result.skippedExistingIssue.length > 0) {
    console.log(`Removed ${result.skippedExistingIssue.length} spec(s) with existing archive issue: ${result.skippedExistingIssue.join(', ')}`);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  archiveIssueExists,
  archiveSpecs,
  commandErrorDetails,
  cutoffTimestamp,
  findArchiveIssue,
  findArchiveIssueWithRetry,
  formatIssueLine,
  listEarliestSpecs,
  preflightSpecs,
  parseUtcDatePrefix,
  selectSpecsToArchive
};
