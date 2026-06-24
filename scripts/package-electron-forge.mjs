import { readdir, rm } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

const options = parseOptions(process.argv.slice(2));
const repoRoot = process.cwd();
const appDir = resolve(repoRoot, 'apps/desktop');
const outDir = resolve(repoRoot, options.out);
const architectures = options.arch.split(',').filter((arch) => arch.length > 0);

if (architectures.length === 0) {
  throw new Error('At least one --arch value is required.');
}

await rm(outDir, { recursive: true, force: true });

process.chdir(appDir);

const { api } = await import('@electron-forge/core');

for (const architecture of architectures) {
  console.log(`Packaging Electron app for ${options.platform}/${architecture}`);
  await api.package({
    dir: appDir,
    platform: options.platform,
    arch: architecture,
    outDir,
    interactive: false,
  });
}

const appBundles = await listMacosApps(outDir);

if (appBundles.length === 0) {
  throw new Error(`No .app bundle found under ${relative(repoRoot, outDir)}.`);
}

for (const architecture of architectures) {
  const hasArchitectureBundle = appBundles.some((appBundle) =>
    appBundle.split('/').some((segment) => segment.includes(architecture)),
  );

  if (!hasArchitectureBundle) {
    throw new Error(`No .app bundle found for architecture ${architecture}.`);
  }
}

for (const appBundle of appBundles) {
  console.log(`Packaged macOS app: ${relative(repoRoot, appBundle)}`);
}

function parseOptions(args) {
  const parsed = {};

  for (const arg of args) {
    if (arg.startsWith('--platform=')) {
      parsed.platform = arg.slice('--platform='.length);
      continue;
    }

    if (arg.startsWith('--arch=')) {
      parsed.arch = arg.slice('--arch='.length);
      continue;
    }

    if (arg.startsWith('--out=')) {
      parsed.out = arg.slice('--out='.length);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (parsed.platform === undefined || parsed.platform.length === 0) {
    throw new Error('--platform is required.');
  }

  if (parsed.arch === undefined || parsed.arch.length === 0) {
    throw new Error('--arch is required.');
  }

  if (parsed.out === undefined || parsed.out.length === 0) {
    throw new Error('--out is required.');
  }

  return parsed;
}

async function listMacosApps(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch((error) => {
    throw new Error(
      `Unable to read ${directory}: ${error instanceof Error ? error.message : String(error)}`,
    );
  });
  const apps = [];

  for (const entry of entries) {
    const path = resolve(directory, entry.name);

    if (entry.isDirectory() && entry.name.endsWith('.app')) {
      apps.push(path);
      continue;
    }

    if (entry.isDirectory() && !shouldSkipDirectory(entry.name)) {
      apps.push(...(await listMacosApps(path)));
    }
  }

  return apps.sort();
}

function shouldSkipDirectory(name) {
  return name === 'node_modules' || name === '.git' || name === 'dSYMs';
}
