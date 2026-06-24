import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const outputPath = process.argv[2] ?? 'sbom.spdx.json';
const repositoryName = 'slack-reply-board';
const packageManifests = await findPackageManifests();
const packages = [];
const seenPackageIds = new Set();

for (const manifestPath of packageManifests) {
  const manifest = await readPackageManifest(manifestPath);

  if (manifest === null || manifest.name === undefined || manifest.version === undefined) {
    continue;
  }

  const packageId = `${manifest.name}@${manifest.version}`;

  if (seenPackageIds.has(packageId)) {
    continue;
  }

  seenPackageIds.add(packageId);
  packages.push({
    SPDXID: createSpdxPackageId(packageId),
    name: manifest.name,
    versionInfo: manifest.version,
    downloadLocation: 'NOASSERTION',
    filesAnalyzed: false,
    licenseConcluded: 'NOASSERTION',
    licenseDeclared: normalizeLicense(manifest.license),
    copyrightText: 'NOASSERTION',
    externalRefs: [
      {
        referenceCategory: 'PACKAGE-MANAGER',
        referenceType: 'purl',
        referenceLocator: createPackageUrl(manifest.name, manifest.version),
      },
    ],
  });
}

packages.sort((left, right) => {
  const nameComparison = left.name.localeCompare(right.name);

  if (nameComparison !== 0) {
    return nameComparison;
  }

  return left.versionInfo.localeCompare(right.versionInfo);
});

const sbom = {
  spdxVersion: 'SPDX-2.3',
  dataLicense: 'CC0-1.0',
  SPDXID: 'SPDXRef-DOCUMENT',
  name: `${repositoryName}-release-sbom`,
  documentNamespace: createDocumentNamespace(packages),
  creationInfo: {
    created: new Date().toISOString(),
    creators: ['Tool: slack-reply-board/scripts/generate-sbom.mjs'],
  },
  packages,
  relationships: packages.map((packageInfo) => ({
    spdxElementId: 'SPDXRef-DOCUMENT',
    relationshipType: 'DESCRIBES',
    relatedSpdxElement: packageInfo.SPDXID,
  })),
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(sbom, null, 2)}\n`);

async function findPackageManifests() {
  const manifests = new Set();
  await addIfReadable(manifests, 'package.json');
  await addWorkspaceManifests(manifests, 'apps');
  await addWorkspaceManifests(manifests, 'packages');
  await addWorkspaceManifests(manifests, 'packages/adapters');
  await addPnpmStoreManifests(manifests);
  return [...manifests].sort();
}

async function addIfReadable(manifests, manifestPath) {
  try {
    await readFile(manifestPath, 'utf8');
    manifests.add(manifestPath);
  } catch (error) {
    if (isMissingFileError(error)) {
      return;
    }

    throw error;
  }
}

async function addWorkspaceManifests(manifests, directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true }).catch((error) => {
    if (isMissingFileError(error)) {
      return [];
    }

    throw error;
  });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    await addIfReadable(manifests, join(directoryPath, entry.name, 'package.json'));
  }
}

async function addPnpmStoreManifests(manifests) {
  const pnpmStorePath = 'node_modules/.pnpm';
  const storeEntries = await readdir(pnpmStorePath, { withFileTypes: true }).catch((error) => {
    if (isMissingFileError(error)) {
      return [];
    }

    throw error;
  });

  for (const storeEntry of storeEntries) {
    if (!storeEntry.isDirectory()) {
      continue;
    }

    await addPackageManifestsFromNodeModules(
      manifests,
      join(pnpmStorePath, storeEntry.name, 'node_modules'),
    );
  }
}

async function addPackageManifestsFromNodeModules(manifests, nodeModulesPath) {
  const entries = await readdir(nodeModulesPath, { withFileTypes: true }).catch((error) => {
    if (isMissingFileError(error)) {
      return [];
    }

    throw error;
  });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (entry.name.startsWith('@')) {
      await addScopedPackageManifests(manifests, join(nodeModulesPath, entry.name));
      continue;
    }

    await addIfReadable(manifests, join(nodeModulesPath, entry.name, 'package.json'));
  }
}

async function addScopedPackageManifests(manifests, scopePath) {
  const packageEntries = await readdir(scopePath, { withFileTypes: true }).catch((error) => {
    if (isMissingFileError(error)) {
      return [];
    }

    throw error;
  });

  for (const packageEntry of packageEntries) {
    if (!packageEntry.isDirectory()) {
      continue;
    }

    await addIfReadable(manifests, join(scopePath, packageEntry.name, 'package.json'));
  }
}

async function readPackageManifest(manifestPath) {
  const manifestText = await readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestText);

  if (!isPackageManifest(manifest)) {
    return null;
  }

  return manifest;
}

function isPackageManifest(input) {
  return (
    typeof input === 'object' &&
    input !== null &&
    (!('name' in input) || typeof input.name === 'string') &&
    (!('version' in input) || typeof input.version === 'string')
  );
}

function normalizeLicense(license) {
  if (typeof license === 'string' && license.trim().length > 0) {
    return license.trim();
  }

  return 'NOASSERTION';
}

function createSpdxPackageId(packageId) {
  return `SPDXRef-Package-${packageId.replaceAll(/[^A-Za-z0-9.-]/gu, '-')}`;
}

function createPackageUrl(packageName, packageVersion) {
  const encodedName = packageName
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `pkg:npm/${encodedName}@${encodeURIComponent(packageVersion)}`;
}

function createDocumentNamespace(packagesToDescribe) {
  const packageHash = createHash('sha256')
    .update(JSON.stringify(packagesToDescribe.map((packageInfo) => packageInfo.SPDXID)))
    .digest('hex');

  return `https://github.com/sarushili0430/${repositoryName}/sbom/${packageHash}`;
}

function isMissingFileError(error) {
  return (
    error instanceof Error &&
    'code' in error &&
    (error.code === 'ENOENT' || error.code === 'ENOTDIR')
  );
}
