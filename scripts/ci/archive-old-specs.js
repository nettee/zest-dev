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

function listEarliestSpecs({ specsDir = DEFAULT_SPECS_DIR, limit = 10 } = {}) {
  if (!fs.existsSync(specsDir)) {
    throw new Error(`Specs directory not found: ${specsDir}`);
  }

  return fs.readdirSync(specsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && SPEC_ID_PATTERN.test(entry.name))
    .map(entry => entry.name)
    .sort()
    .slice(0, limit);
}

function selectSpecsToArchive({ specsDir = DEFAULT_SPECS_DIR, now = new Date(), limit = 10, maxAgeDays = 10 } = {}) {
  const cutoff = cutoffTimestamp(now, maxAgeDays);
  return listEarliestSpecs({ specsDir, limit })
    .filter(specId => parseUtcDatePrefix(specId) < cutoff);
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

function archiveSpecs({ specsDir = DEFAULT_SPECS_DIR, now = new Date(), limit = 10, maxAgeDays = 10, runner = execFileSync, postDumpIssueLookupAttempts = POST_DUMP_ISSUE_LOOKUP_ATTEMPTS, postDumpIssueLookupDelayMs = POST_DUMP_ISSUE_LOOKUP_DELAY_MS, sleep = sleepMs } = {}) {
  const specIds = selectSpecsToArchive({ specsDir, now, limit, maxAgeDays });
  const archived = [];
  const skippedExistingIssue = [];
  const associatedIssues = [];

  for (const specId of specIds) {
    const existingIssue = findArchiveIssue(specId, { runner });
    if (existingIssue) {
      fs.rmSync(path.join(specsDir, specId), { recursive: true, force: false });
      skippedExistingIssue.push(specId);
      associatedIssues.push({ specId, issueNumber: existingIssue.number });
      continue;
    }

    runner('zest-dev', ['dump', specId], { stdio: 'inherit' });
    const archiveIssue = findArchiveIssueWithRetry(specId, { runner, attempts: postDumpIssueLookupAttempts, delayMs: postDumpIssueLookupDelayMs, sleep });
    if (!archiveIssue) throw new Error(`Archive issue was not created for ${specId}`);
    fs.rmSync(path.join(specsDir, specId), { recursive: true, force: false });
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
  cutoffTimestamp,
  findArchiveIssue,
  findArchiveIssueWithRetry,
  formatIssueLine,
  listEarliestSpecs,
  parseUtcDatePrefix,
  selectSpecsToArchive
};
