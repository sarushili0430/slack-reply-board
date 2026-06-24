import { readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { relative, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { api } = require('@electron-forge/core');

const repoDir = process.cwd();
const appDir = resolve(repoDir, 'apps/desktop');
const outDir = resolve(appDir, 'out');
const platform = process.env.FORGE_PLATFORM ?? process.platform;
const archList = (process.env.FORGE_ARCHES ?? process.env.FORGE_ARCH ?? process.arch)
  .split(',')
  .map((arch) => arch.trim())
  .filter((arch) => arch.length > 0);

if (archList.length === 0) {
  throw new Error('No Electron Forge target architecture was configured.');
}

process.chdir(appDir);

for (const arch of archList) {
  await api.package({
    arch,
    dir: appDir,
    interactive: false,
    platform,
  });
}

const entries = await readdir(outDir, { withFileTypes: true }).catch(() => []);
const packages = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

if (packages.length === 0) {
  throw new Error(`Electron Forge did not create package output at ${outDir}.`);
}

for (const packageName of packages) {
  console.log(relative(repoDir, resolve(outDir, packageName)));
}
