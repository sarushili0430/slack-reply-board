import { readdir, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { relative, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { packager } = require('@electron/packager');

const repoDir = process.cwd();
const appDir = resolve(repoDir, 'apps/desktop');
const outDir = resolve(appDir, 'out');
const platform = process.env.ELECTRON_PACKAGE_PLATFORM ?? process.platform;
const archList = (
  process.env.ELECTRON_PACKAGE_ARCHES ??
  process.env.ELECTRON_PACKAGE_ARCH ??
  process.arch
)
  .split(',')
  .map((arch) => arch.trim())
  .filter((arch) => arch.length > 0);

if (archList.length === 0) {
  throw new Error('No Electron package target architecture was configured.');
}

await rm(outDir, { force: true, recursive: true });

for (const arch of archList) {
  await packager({
    arch,
    asar: true,
    dir: appDir,
    ignore: [
      /^\/coverage(?:\/|$)/,
      /^\/dist(?:\/|$)/,
      /^\/node_modules(?:\/|$)/,
      /^\/out(?:\/|$)/,
      /^\/src(?:\/|$)/,
    ],
    name: 'SlackReplyBoard',
    out: outDir,
    overwrite: true,
    platform,
    prune: true,
  });
}

const entries = await readdir(outDir, { withFileTypes: true }).catch(() => []);
const packages = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

if (packages.length === 0) {
  throw new Error(`Electron Packager did not create package output at ${outDir}.`);
}

for (const packageName of packages) {
  console.log(relative(repoDir, resolve(outDir, packageName)));
}
