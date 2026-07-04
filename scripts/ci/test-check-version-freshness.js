#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { checkVersionFreshness, parseSemver, readVersion } = require('./check-version-freshness');

function writePackageJson(dirPath, version) {
  const filePath = path.join(dirPath, 'package.json');
  fs.writeFileSync(filePath, JSON.stringify({ version }, null, 2));
  return filePath;
}

function testAheadVersionPasses() {
  const result = checkVersionFreshness('1.0.0', '1.0.1');
  assert.deepStrictEqual(result, {
    ok: true,
    status: 'ahead',
    message: 'PR package.json version 1.0.1 is ahead of base version 1.0.0.'
  });
}

function testUnchangedVersionSkipsFailure() {
  const result = checkVersionFreshness('1.0.0', '1.0.0');
  assert.deepStrictEqual(result, {
    ok: true,
    status: 'unchanged',
    message: 'package.json version unchanged at 1.0.0; skipping freshness failure.'
  });
}

function testBehindVersionFails() {
  const result = checkVersionFreshness('1.0.1', '1.0.0');
  assert.deepStrictEqual(result, {
    ok: false,
    status: 'stale',
    message: 'PR package.json version 1.0.0 must be greater than base version 1.0.1.'
  });
}

function testReadVersionFromFixture() {
  const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zest-version-freshness-'));
  const packageJsonPath = writePackageJson(fixtureDir, '2.3.4');
  assert.strictEqual(readVersion(packageJsonPath), '2.3.4');
}

function testInvalidVersionFailsFast() {
  assert.throws(
    () => parseSemver('1.0', 'fixture'),
    /Invalid fixture version: 1\.0/
  );
}

function main() {
  testAheadVersionPasses();
  testUnchangedVersionSkipsFailure();
  testBehindVersionFails();
  testReadVersionFromFixture();
  testInvalidVersionFailsFast();
  console.log('check-version-freshness tests passed');
}

main();
