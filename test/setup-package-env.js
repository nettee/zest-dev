#!/usr/bin/env node

/**
 * Setup Package Environment
 * Creates a clean npm package installation for testing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function log(message) {
  console.log(`${GREEN}[setup]${RESET} ${message}`);
}

function info(message) {
  console.log(`${YELLOW}[info]${RESET} ${message}`);
}

const rootDir = path.join(__dirname, '..');
const testEnvDir = path.join(rootDir, 'test-package-env');
const npmCacheDir = path.join(rootDir, '.npm');
const npmEnv = {
  ...process.env,
  npm_config_cache: npmCacheDir
};

function withNpmEnv(options = {}) {
  return {
    ...options,
    env: {
      ...npmEnv,
      ...(options.env || {})
    }
  };
}

function setup() {
  try {
    fs.mkdirSync(npmCacheDir, { recursive: true });

    // Clean up existing environment
    if (fs.existsSync(testEnvDir)) {
      log('Removing existing test environment...');
      fs.rmSync(testEnvDir, { recursive: true, force: true });
    }

    // Pack the CLI
    log('Packing CLI...');
    execSync('npm pack', withNpmEnv({ cwd: rootDir, stdio: 'pipe' }));

    const tarball = fs.readdirSync(rootDir).find(f => f.startsWith('zest-spec-') && f.endsWith('.tgz'));
    if (!tarball) {
      throw new Error('Package tarball not found');
    }
    info(`Package created: ${tarball}`);

    // Create test environment
    log('Creating test environment...');
    fs.mkdirSync(testEnvDir, { recursive: true });
    execSync('npm init -y', withNpmEnv({ cwd: testEnvDir, stdio: 'pipe' }));

    // Install packaged CLI
    log('Installing packaged CLI...');
    const tarballPath = path.join(rootDir, tarball);
    execSync(`npm install ${tarballPath}`, withNpmEnv({ cwd: testEnvDir, stdio: 'pipe' }));

    // Verify CLI is executable
    log('Verifying CLI...');
    const versionOutput = execSync('npx zest-spec --version', withNpmEnv({
      cwd: testEnvDir,
      encoding: 'utf-8'
    })).trim();
    info(`CLI version: ${versionOutput}`);

    // Create symlink for easy access
    const cliPath = path.join(testEnvDir, 'node_modules', '.bin', 'zest-spec');
    if (fs.existsSync(cliPath)) {
      log('CLI is ready to use');
    }

    // Clean up tarball
    fs.unlinkSync(tarballPath);

    log('Package environment setup complete');
    info(`Test environment: ${testEnvDir}`);
    info(`Next: Integration tests will use packaged CLI from ${testEnvDir}`);

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function cleanup() {
  if (fs.existsSync(testEnvDir)) {
    log('Cleaning up test environment...');
    fs.rmSync(testEnvDir, { recursive: true, force: true });
    info('Test environment cleaned up');
  }
}

// CLI usage: node setup-package-env.js [setup|cleanup]
if (require.main === module) {
  const command = process.argv[2] || 'setup';
  
  if (command === 'cleanup') {
    cleanup();
  } else {
    setup();
  }
}

module.exports = { setup, cleanup };
