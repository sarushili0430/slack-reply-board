import { existsSync } from 'node:fs';
import { readdir, readFile, realpath } from 'node:fs/promises';
import { join } from 'node:path';

const allowedLicenses = new Set([
  '0BSD',
  'Apache-2.0',
  'BlueOak-1.0.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'CC-BY-3.0',
  'CC-BY-4.0',
  'CC0-1.0',
  'ISC',
  'MIT',
  'MIT-0',
  'MPL-2.0',
  'Python-2.0',
  'Unicode-DFS-2016',
]);
const workspacePackagePrefix = '@replyboard/';
const violations = [];
const packageManifests = new Map();

async function listPackageDirectories(nodeModulesPath) {
  if (!existsSync(nodeModulesPath)) {
    return [];
  }

  const directories = [];
  const entries = await readdir(nodeModulesPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === '.bin' || entry.name === '.pnpm') {
      continue;
    }

    const entryPath = join(nodeModulesPath, entry.name);

    if (entry.name.startsWith('@')) {
      const scopedEntries = await readdir(entryPath, { withFileTypes: true });

      for (const scopedEntry of scopedEntries) {
        if (scopedEntry.isDirectory()) {
          directories.push(join(entryPath, scopedEntry.name));
        }
      }

      continue;
    }

    directories.push(entryPath);
  }

  return directories;
}

async function collectPackageManifests() {
  for (const packageDirectory of await listPackageDirectories('node_modules')) {
    await addPackageManifest(packageDirectory);
  }

  const virtualStorePath = 'node_modules/.pnpm';

  if (!existsSync(virtualStorePath)) {
    return;
  }

  const virtualStoreEntries = await readdir(virtualStorePath, { withFileTypes: true });

  for (const entry of virtualStoreEntries) {
    if (!entry.isDirectory()) {
      continue;
    }

    for (const packageDirectory of await listPackageDirectories(
      join(virtualStorePath, entry.name, 'node_modules'),
    )) {
      await addPackageManifest(packageDirectory);
    }
  }
}

async function addPackageManifest(packageDirectory) {
  const packageJsonPath = join(packageDirectory, 'package.json');

  if (!existsSync(packageJsonPath)) {
    return;
  }

  const canonicalPath = await realpath(packageJsonPath);
  packageManifests.set(canonicalPath, packageJsonPath);
}

function readLicenseExpression(manifest) {
  if (typeof manifest.license === 'string' && manifest.license.length > 0) {
    return manifest.license;
  }

  if (Array.isArray(manifest.licenses)) {
    const licenseTypes = manifest.licenses
      .map((license) => (typeof license?.type === 'string' ? license.type : undefined))
      .filter((license) => license !== undefined);

    if (licenseTypes.length > 0) {
      return licenseTypes.join(' OR ');
    }
  }

  if (typeof manifest.licenses?.type === 'string') {
    return manifest.licenses.type;
  }

  return undefined;
}

function isLicenseExpressionAllowed(expression) {
  const normalizedExpression = expression
    .replace(/\s+WITH\s+[A-Za-z0-9-.+]+/giu, '')
    .replace(/[()]/gu, '');
  const alternatives = normalizedExpression.split(/\s+OR\s+/iu);

  return alternatives.some((alternative) => {
    const requiredLicenses = alternative
      .split(/\s+AND\s+/iu)
      .map((license) => license.trim())
      .filter((license) => license.length > 0);

    return (
      requiredLicenses.length > 0 &&
      requiredLicenses.every((license) => allowedLicenses.has(license))
    );
  });
}

await collectPackageManifests();

if (packageManifests.size === 0) {
  violations.push('No installed dependency manifests found. Run pnpm install first.');
}

for (const [canonicalPath, displayPath] of packageManifests) {
  const manifest = JSON.parse(await readFile(canonicalPath, 'utf8'));

  if (typeof manifest.name !== 'string' || manifest.name.startsWith(workspacePackagePrefix)) {
    continue;
  }

  const licenseExpression = readLicenseExpression(manifest);
  const packageId = `${manifest.name}@${String(manifest.version ?? 'unknown')}`;

  if (licenseExpression === undefined) {
    violations.push(`${packageId}: missing license (${displayPath})`);
    continue;
  }

  if (!isLicenseExpressionAllowed(licenseExpression)) {
    violations.push(`${packageId}: disallowed license ${licenseExpression} (${displayPath})`);
  }
}

if (violations.length > 0) {
  console.error('License policy violations found.');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(`License policy passed for ${String(packageManifests.size)} installed manifests.`);
