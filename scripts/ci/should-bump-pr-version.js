#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function fail(message) {
  throw new Error(message);
}

function normalizeRepoPath(filePath) {
  return filePath.replace(/\\/g, '/').replace(/^\.\//, '');
}

function readPackageFiles(packageJsonPath) {
  const absolutePath = path.resolve(packageJsonPath);
  const packageJson = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));

  if (!Array.isArray(packageJson.files) || packageJson.files.length === 0) {
    fail(`Missing package.json files allowlist in ${absolutePath}`);
  }

  return packageJson.files.map(entry => normalizeRepoPath(entry));
}

function hasVersionChange(baseVersion, headVersion) {
  if (typeof baseVersion !== 'string' || baseVersion.length === 0) {
    fail('Base version is required');
  }

  if (typeof headVersion !== 'string' || headVersion.length === 0) {
    fail('Head version is required');
  }

  return baseVersion !== headVersion;
}

function isPackageShippedPath(filePath, packageFiles) {
  const normalizedPath = normalizeRepoPath(filePath);

  return packageFiles.some(packageFile => {
    if (packageFile.endsWith('/')) {
      return normalizedPath.startsWith(packageFile);
    }

    return normalizedPath === packageFile;
  });
}

function evaluateBumpRequirement({ changedFiles, packageFiles, versionChanged }) {
  if (!Array.isArray(changedFiles)) {
    fail('changedFiles must be an array');
  }

  if (!Array.isArray(packageFiles) || packageFiles.length === 0) {
    fail('packageFiles must be a non-empty array');
  }

  const releaseChangedFiles = changedFiles
    .map(normalizeRepoPath)
    .filter(filePath => isPackageShippedPath(filePath, packageFiles));

  const nonVersionReleaseFiles = releaseChangedFiles.filter(
    filePath => filePath !== 'package.json' && filePath !== 'pnpm-lock.yaml'
  );

  if (nonVersionReleaseFiles.length === 0) {
    return {
      shouldBump: false,
      reason: 'No package-shipped CLI changes detected.',
      matchedFiles: []
    };
  }

  if (versionChanged) {
    return {
      shouldBump: false,
      reason: 'PR already changes package.json version.',
      matchedFiles: nonVersionReleaseFiles
    };
  }

  return {
    shouldBump: true,
    reason: 'Package-shipped CLI changes detected with unchanged package version.',
    matchedFiles: nonVersionReleaseFiles
  };
}

function runGit(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function readVersionFromPackageJson(packageJsonContent, label) {
  const packageJson = JSON.parse(packageJsonContent);
  if (typeof packageJson.version !== 'string' || packageJson.version.length === 0) {
    fail(`Missing version in ${label} package.json`);
  }

  return packageJson.version;
}

function writeOutputs(result) {
  if (!process.env.GITHUB_OUTPUT) {
    return;
  }

  const lines = [
    `should_bump=${result.shouldBump ? 'true' : 'false'}`,
    `reason=${result.reason}`,
    `matched_files=${JSON.stringify(result.matchedFiles)}`
  ];

  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`);
}

function main() {
  const [, , baseRef, headRef = 'HEAD'] = process.argv;

  if (!baseRef) {
    fail('Usage: node scripts/ci/should-bump-pr-version.js <base-ref> [head-ref]');
  }

  const changedFilesOutput = runGit(['diff', '--name-only', `${baseRef}...${headRef}`]);
  const changedFiles = changedFilesOutput.length === 0 ? [] : changedFilesOutput.split('\n');
  const basePackageJsonContent = runGit(['show', `${baseRef}:package.json`]);
  const headPackageJsonContent = fs.readFileSync(path.resolve('package.json'), 'utf8');
  const baseVersion = readVersionFromPackageJson(basePackageJsonContent, 'base');
  const headVersion = readVersionFromPackageJson(headPackageJsonContent, 'head');
  const packageFiles = ['package.json', 'pnpm-lock.yaml', ...readPackageFiles('package.json')];
  const result = evaluateBumpRequirement({
    changedFiles,
    packageFiles,
    versionChanged: hasVersionChange(baseVersion, headVersion)
  });

  writeOutputs(result);
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = {
  evaluateBumpRequirement,
  hasVersionChange,
  isPackageShippedPath,
  normalizeRepoPath,
  readPackageFiles,
  readVersionFromPackageJson
};
