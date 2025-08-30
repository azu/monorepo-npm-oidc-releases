#!/usr/bin/env node --experimental-strip-types
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const rootDir = process.cwd();
const lernaConfig = JSON.parse(readFileSync(join(rootDir, 'lerna.json'), 'utf-8'));
const packages = lernaConfig.packages || ['packages/*'];

// Get all package directories
const packageDirs: string[] = [];
for (const pattern of packages) {
  const baseDir = pattern.replace('/*', '');
  const dirs = execSync(`ls -d ${baseDir}/*/`, { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);
  packageDirs.push(...dirs);
}

console.log(`Found ${packageDirs.length} packages to publish`);

// Check each package and publish if needed
for (const dir of packageDirs) {
  const packageJsonPath = join(rootDir, dir, 'package.json');
  if (!existsSync(packageJsonPath)) {
    console.log(`Skipping ${dir} - no package.json found`);
    continue;
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const packageName = packageJson.name;
  const packageVersion = packageJson.version;

  if (packageJson.private) {
    console.log(`Skipping ${packageName} - private package`);
    continue;
  }

  console.log(`\nChecking ${packageName}@${packageVersion}...`);

  // Check if package is already published
  try {
    const npmViewOutput = execSync(
      `npm view ${packageName}@${packageVersion} version 2>/dev/null`,
      { encoding: 'utf-8', stdio: 'pipe' }
    ).trim();
    
    if (npmViewOutput === packageVersion) {
      console.log(`✓ ${packageName}@${packageVersion} is already published`);
      continue;
    }
  } catch (error) {
    // Package not found, proceed with publishing
  }

  // Publish the package with pnpm
  console.log(`Publishing ${packageName}@${packageVersion}...`);
  try {
    execSync('pnpm publish --no-git-checks', {
      cwd: join(rootDir, dir),
      stdio: 'inherit',
      env: {
        ...process.env,
        NPM_CONFIG_PROVENANCE: 'true'
      }
    });
    console.log(`✓ Successfully published ${packageName}@${packageVersion}`);
  } catch (error) {
    console.error(`✗ Failed to publish ${packageName}@${packageVersion}`);
    process.exit(1);
  }
}

console.log('\n✓ All packages published successfully');