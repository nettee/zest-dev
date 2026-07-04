#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fail(message) {
  throw new Error(message);
}

function readVersion(packageJsonPath) {
  const absolutePath = path.resolve(packageJsonPath);
  const fileContents = fs.readFileSync(absolutePath, 'utf8');
  const packageJson = JSON.parse(fileContents);

  if (typeof packageJson.version !== 'string' || packageJson.version.length === 0) {
    fail(`Missing package.json version in ${absolutePath}`);
  }

  return packageJson.version;
}

function parseSemver(version, label) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    fail(`Invalid ${label} version: ${version}. Expected exact semver major.minor.patch`);
  }

  return match.slice(1).map(part => Number.parseInt(part, 10));
}

function compareSemver(leftVersion, rightVersion) {
  const left = parseSemver(leftVersion, 'left');
  const right = parseSemver(rightVersion, 'right');

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] > right[index]) {
      return 1;
    }

    if (left[index] < right[index]) {
      return -1;
    }
  }

  return 0;
}

function checkVersionFreshness(baseVersion, headVersion) {
  if (baseVersion === headVersion) {
    return {
      ok: true,
      status: 'unchanged',
      message: `package.json version unchanged at ${headVersion}; skipping freshness failure.`
    };
  }

  if (compareSemver(headVersion, baseVersion) <= 0) {
    return {
      ok: false,
      status: 'stale',
      message: `PR package.json version ${headVersion} must be greater than base version ${baseVersion}.`
    };
  }

  return {
    ok: true,
    status: 'ahead',
    message: `PR package.json version ${headVersion} is ahead of base version ${baseVersion}.`
  };
}

function main() {
  const [, , basePackageJsonPath, headPackageJsonPath] = process.argv;

  if (!basePackageJsonPath || !headPackageJsonPath) {
    fail('Usage: node scripts/ci/check-version-freshness.js <base-package-json> <head-package-json>');
  }

  const baseVersion = readVersion(basePackageJsonPath);
  const headVersion = readVersion(headPackageJsonPath);
  const result = checkVersionFreshness(baseVersion, headVersion);

  if (!result.ok) {
    fail(result.message);
  }

  console.log(result.message);
}

if (require.main === module) {
  main();
}

module.exports = {
  checkVersionFreshness,
  compareSemver,
  parseSemver,
  readVersion
};
