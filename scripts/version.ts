#!/usr/bin/env node --experimental-strip-types
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const semverType = process.argv[2];
if (!['patch', 'minor', 'major'].includes(semverType)) {
  console.error('Usage: node version.ts [patch|minor|major]');
  process.exit(1);
}

const rootDir = process.cwd();
const rootPackageJsonPath = join(rootDir, 'package.json');
const rootPackageJson = JSON.parse(readFileSync(rootPackageJsonPath, 'utf-8'));

// Calculate new version
const currentVersion = rootPackageJson.version || '0.0.0';
const [major, minor, patch] = currentVersion.split('.').map(Number);

let newVersion: string;
switch (semverType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
  default:
    throw new Error(`Invalid semver type: ${semverType}`);
}

console.log(`Updating version from ${currentVersion} to ${newVersion}`);

// Update root package.json
rootPackageJson.version = newVersion;
writeFileSync(rootPackageJsonPath, JSON.stringify(rootPackageJson, null, 2) + '\n');

// Update all workspace packages
const workspaces = rootPackageJson.workspaces?.packages || rootPackageJson.workspaces || [];
for (const workspace of workspaces) {
  const pattern = workspace.replace('/*', '');
  const dirs = execSync(`ls -d ${pattern}/*/`, { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);
  
  for (const dir of dirs) {
    const packageJsonPath = join(rootDir, dir, 'package.json');
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      packageJson.version = newVersion;
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`Updated ${packageJson.name} to ${newVersion}`);
    } catch (error) {
      console.warn(`Skipping ${dir} - could not update package.json`);
    }
  }
}


console.log(`\n✓ Version updated to ${newVersion}`);