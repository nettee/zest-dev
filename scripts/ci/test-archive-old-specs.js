#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  archiveSpecs,
  listEarliestSpecs,
  selectSpecsToArchive
} = require('./archive-old-specs');

function noExistingArchiveRunner(calls = []) {
  return (cmd, args) => {
    calls.push({ cmd, args });
    if (cmd === 'gh' && args[0] === 'issue' && args[1] === 'list') {
      return '[]';
    }
    return '';
  };
}

function makeSpec(specsDir, specId) {
  const dir = path.join(specsDir, specId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'spec.md'), '# Test\n');
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zest-archive-specs-'));
  const specsDir = path.join(root, 'specs', 'change');
  fs.mkdirSync(specsDir, { recursive: true });
  return { root, specsDir };
}

function testListsEarliestTenAndExcludesActiveSymlink() {
  const { specsDir } = fixture();
  for (let day = 1; day <= 12; day += 1) {
    makeSpec(specsDir, `202601${String(day).padStart(2, '0')}-spec-${day}`);
  }
  fs.symlinkSync('20260101-spec-1', path.join(specsDir, 'active'));

  assert.deepStrictEqual(listEarliestSpecs({ specsDir }), [
    '20260101-spec-1',
    '20260102-spec-2',
    '20260103-spec-3',
    '20260104-spec-4',
    '20260105-spec-5',
    '20260106-spec-6',
    '20260107-spec-7',
    '20260108-spec-8',
    '20260109-spec-9',
    '20260110-spec-10'
  ]);
}

function testSelectsOnlyMoreThanTenDaysOld() {
  const { specsDir } = fixture();
  makeSpec(specsDir, '20260620-old');
  makeSpec(specsDir, '20260624-exactly-ten-days');
  makeSpec(specsDir, '20260625-newer');

  assert.deepStrictEqual(
    selectSpecsToArchive({ specsDir, now: new Date('2026-07-04T12:00:00Z') }),
    ['20260620-old']
  );
}

function testDeletesOnlyAfterSuccessfulDump() {
  const { specsDir } = fixture();
  makeSpec(specsDir, '20260601-ok');
  makeSpec(specsDir, '20260602-fails');
  const calls = [];

  assert.throws(() => archiveSpecs({
    specsDir,
    now: new Date('2026-07-04T00:00:00Z'),
    runner: (cmd, args) => {
      calls.push({ cmd, args });
      if (cmd === 'gh' && args[0] === 'issue' && args[1] === 'list') {
        return '[]';
      }
      if (cmd === 'zest-dev' && args[1] === '20260602-fails') {
        throw new Error('dump failed');
      }
      return '';
    }
  }), /dump failed/);

  assert.deepStrictEqual(
    calls.filter(call => call.cmd === 'zest-dev').map(call => call.args),
    [['dump', '20260601-ok'], ['dump', '20260602-fails']]
  );
  assert.strictEqual(fs.existsSync(path.join(specsDir, '20260601-ok')), false);
  assert.strictEqual(fs.existsSync(path.join(specsDir, '20260602-fails')), true);
}

function testSkipsActiveAndCurrentTargets() {
  const { specsDir } = fixture();
  makeSpec(specsDir, '20260601-active');
  makeSpec(specsDir, '20260602-current');
  makeSpec(specsDir, '20260603-eligible');
  fs.symlinkSync('20260601-active', path.join(specsDir, 'active'));
  fs.symlinkSync('20260602-current', path.join(specsDir, 'current'));

  assert.deepStrictEqual(
    selectSpecsToArchive({ specsDir, now: new Date('2026-07-04T00:00:00Z') }),
    ['20260603-eligible']
  );
}

function testExistingArchiveIssueDeletesWithoutDumpingAgain() {
  const { specsDir } = fixture();
  makeSpec(specsDir, '20260601-already-archived');
  const calls = [];

  const result = archiveSpecs({
    specsDir,
    now: new Date('2026-07-04T00:00:00Z'),
    runner: (cmd, args) => {
      calls.push({ cmd, args });
      if (cmd === 'gh' && args[0] === 'issue' && args[1] === 'list') {
        return '[{"number":123}]';
      }
      throw new Error(`unexpected command: ${cmd} ${args.join(' ')}`);
    }
  });

  assert.deepStrictEqual(result, {
    archived: [],
    skippedExistingIssue: ['20260601-already-archived']
  });
  assert.strictEqual(calls.length, 1);
  assert.strictEqual(fs.existsSync(path.join(specsDir, '20260601-already-archived')), false);
}

function testMissingSpecsDirectoryFailsFast() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zest-archive-specs-missing-'));
  assert.throws(
    () => listEarliestSpecs({ specsDir: path.join(root, 'specs', 'change') }),
    /Specs directory not found/
  );
}

function testRunsGlobalZestDevDump() {
  const { specsDir } = fixture();
  makeSpec(specsDir, '20260601-eligible');
  const calls = [];

  archiveSpecs({
    specsDir,
    now: new Date('2026-07-04T00:00:00Z'),
    runner: noExistingArchiveRunner(calls)
  });

  assert.deepStrictEqual(
    calls.filter(call => call.cmd === 'zest-dev').map(call => call.args),
    [['dump', '20260601-eligible']]
  );
}

function main() {
  testListsEarliestTenAndExcludesActiveSymlink();
  testSelectsOnlyMoreThanTenDaysOld();
  testDeletesOnlyAfterSuccessfulDump();
  testSkipsActiveAndCurrentTargets();
  testExistingArchiveIssueDeletesWithoutDumpingAgain();
  testMissingSpecsDirectoryFailsFast();
  testRunsGlobalZestDevDump();
  console.log('archive-old-specs tests passed');
}

main();
