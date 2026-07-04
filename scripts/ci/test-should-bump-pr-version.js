#!/usr/bin/env node

const assert = require('assert');

const {
  evaluateBumpRequirement,
  hasVersionChange,
  isPackageShippedPath,
  normalizeRepoPath,
  readVersionFromPackageJson
} = require('./should-bump-pr-version');

function testNormalizeRepoPath() {
  assert.strictEqual(normalizeRepoPath('./bin/zest-dev.js'), 'bin/zest-dev.js');
  assert.strictEqual(normalizeRepoPath('commands\\init.md'), 'commands/init.md');
}

function testShippedPathMatch() {
  const packageFiles = ['bin/', 'README.md'];
  assert.strictEqual(isPackageShippedPath('bin/zest-dev.js', packageFiles), true);
  assert.strictEqual(isPackageShippedPath('docs/guide.md', packageFiles), false);
}

function testBumpRequiredForCliChangeWithoutVersionChange() {
  const result = evaluateBumpRequirement({
    changedFiles: ['bin/zest-dev.js', 'docs/notes.md'],
    packageFiles: ['package.json', 'pnpm-lock.yaml', 'bin/', 'README.md'],
    versionChanged: false
  });

  assert.deepStrictEqual(result, {
    shouldBump: true,
    reason: 'Package-shipped CLI changes detected with unchanged package version.',
    matchedFiles: ['bin/zest-dev.js']
  });
}

function testVersionChangeSkipsBump() {
  const result = evaluateBumpRequirement({
    changedFiles: ['commands/release.md', 'package.json'],
    packageFiles: ['package.json', 'pnpm-lock.yaml', 'commands/'],
    versionChanged: true
  });

  assert.deepStrictEqual(result, {
    shouldBump: false,
    reason: 'PR already changes package.json version.',
    matchedFiles: ['commands/release.md']
  });
}

function testVersionOnlyChangeDoesNotLoop() {
  const result = evaluateBumpRequirement({
    changedFiles: ['package.json', 'pnpm-lock.yaml'],
    packageFiles: ['package.json', 'pnpm-lock.yaml', 'bin/'],
    versionChanged: true
  });

  assert.deepStrictEqual(result, {
    shouldBump: false,
    reason: 'No package-shipped CLI changes detected.',
    matchedFiles: []
  });
}

function testHasVersionChange() {
  assert.strictEqual(hasVersionChange('1.0.0', '1.0.1'), true);
  assert.strictEqual(hasVersionChange('1.0.0', '1.0.0'), false);
}

function testReadVersionFromPackageJsonFailsFast() {
  assert.strictEqual(readVersionFromPackageJson('{"version":"1.2.3"}', 'fixture'), '1.2.3');
  assert.throws(
    () => readVersionFromPackageJson('{"name":"zest-dev"}', 'fixture'),
    /Missing version in fixture package\.json/
  );
}

function main() {
  testNormalizeRepoPath();
  testShippedPathMatch();
  testBumpRequiredForCliChangeWithoutVersionChange();
  testVersionChangeSkipsBump();
  testVersionOnlyChangeDoesNotLoop();
  testHasVersionChange();
  testReadVersionFromPackageJsonFailsFast();
  console.log('should-bump-pr-version tests passed');
}

main();
