#!/usr/bin/env node

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function fail(message) {
  throw new Error(message);
}

function readPackageMetadata(packageJsonPath) {
  const absolutePath = path.resolve(packageJsonPath);
  const packageJson = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));

  if (typeof packageJson.name !== 'string' || packageJson.name.length === 0) {
    fail(`Missing package name in ${absolutePath}`);
  }

  if (typeof packageJson.version !== 'string' || packageJson.version.length === 0) {
    fail(`Missing package version in ${absolutePath}`);
  }

  return {
    name: packageJson.name,
    version: packageJson.version
  };
}

function packageSpec(name, version) {
  return `${name}@${version}`;
}

function writeOutputs(result) {
  if (!process.env.GITHUB_OUTPUT) {
    return;
  }

  const lines = [
    `exists=${result.exists ? 'true' : 'false'}`,
    `name=${result.name}`,
    `version=${result.version}`,
    `spec=${result.spec}`,
    `message=${result.message}`
  ];

  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`);
}

function checkNpmVersionExists(name, version, exec = execFileSync) {
  const spec = packageSpec(name, version);

  try {
    const output = exec('npm', ['view', spec, 'version', '--json'], { encoding: 'utf8' }).trim();
    const publishedVersion = JSON.parse(output);

    if (publishedVersion !== version) {
      fail(`npm returned unexpected version for ${spec}: ${JSON.stringify(publishedVersion)}`);
    }

    return {
      exists: true,
      name,
      version,
      spec,
      message: `npm already has ${spec}; skipping publish.`
    };
  } catch (error) {
    const stderr = typeof error.stderr === 'string' ? error.stderr : '';
    const stdout = typeof error.stdout === 'string' ? error.stdout : '';
    const combinedOutput = `${stdout}\n${stderr}`;

    if (/E404/.test(combinedOutput) || /404 Not Found/.test(combinedOutput)) {
      return {
        exists: false,
        name,
        version,
        spec,
        message: `npm does not have ${spec}; publish is required.`
      };
    }

    throw error;
  }
}

function main() {
  const [, , packageJsonPath = 'package.json'] = process.argv;
  const { name, version } = readPackageMetadata(packageJsonPath);
  const result = checkNpmVersionExists(name, version);
  writeOutputs(result);
  console.log(result.message);
}

if (require.main === module) {
  main();
}

module.exports = {
  checkNpmVersionExists,
  packageSpec,
  readPackageMetadata
};
