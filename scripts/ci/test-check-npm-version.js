#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  checkNpmVersionExists,
  packageSpec,
  readPackageMetadata
} = require('./check-npm-version');

function writePackageJson(dirPath, contents) {
  const filePath = path.join(dirPath, 'package.json');
  fs.writeFileSync(filePath, JSON.stringify(contents, null, 2));
  return filePath;
}

function testPackageSpec() {
  assert.strictEqual(packageSpec('zest-dev', '1.2.3'), 'zest-dev@1.2.3');
}

function testReadPackageMetadata() {
  const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zest-npm-version-'));
  const packageJsonPath = writePackageJson(fixtureDir, { name: 'zest-dev', version: '1.2.3' });

  assert.deepStrictEqual(readPackageMetadata(packageJsonPath), {
    name: 'zest-dev',
    version: '1.2.3'
  });
}

function testMissingVersionFailsFast() {
  const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zest-npm-version-'));
  const packageJsonPath = writePackageJson(fixtureDir, { name: 'zest-dev' });

  assert.throws(
    () => readPackageMetadata(packageJsonPath),
    /Missing package version/
  );
}

function testExistingVersionSkipsPublish() {
  const result = checkNpmVersionExists('zest-dev', '1.2.3', () => '"1.2.3"\n');

  assert.deepStrictEqual(result, {
    exists: true,
    name: 'zest-dev',
    version: '1.2.3',
    spec: 'zest-dev@1.2.3',
    message: 'npm already has zest-dev@1.2.3; skipping publish.'
  });
}

function testMissingVersionRequiresPublish() {
  const result = checkNpmVersionExists('zest-dev', '1.2.3', () => {
    const error = new Error('not found');
    error.stderr = 'npm error code E404\nnpm error 404 Not Found';
    throw error;
  });

  assert.deepStrictEqual(result, {
    exists: false,
    name: 'zest-dev',
    version: '1.2.3',
    spec: 'zest-dev@1.2.3',
    message: 'npm does not have zest-dev@1.2.3; publish is required.'
  });
}

function testUnexpectedNpmFailurePropagates() {
  const networkError = new Error('socket hang up');
  networkError.stderr = 'npm error code ECONNRESET';

  assert.throws(
    () => checkNpmVersionExists('zest-dev', '1.2.3', () => {
      throw networkError;
    }),
    /socket hang up/
  );
}

function main() {
  testPackageSpec();
  testReadPackageMetadata();
  testMissingVersionFailsFast();
  testExistingVersionSkipsPublish();
  testMissingVersionRequiresPublish();
  testUnexpectedNpmFailurePropagates();
  console.log('check-npm-version tests passed');
}

main();
