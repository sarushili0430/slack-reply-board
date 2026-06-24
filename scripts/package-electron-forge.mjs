import { readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { relative, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { api } = require('@electron-forge/core');

const repoDir = process.cwd();
const appDir = resolve(repoDir, 'apps/desktop');
const outDir = resolve(appDir, 'out');
const platform = process.env.FORGE_PLATFORM ?? process.platform;
const packageTimeoutMs = 10 * 60 * 1000;
const archList = (process.env.FORGE_ARCHES ?? process.env.FORGE_ARCH ?? process.arch)
  .split(',')
  .map((arch) => arch.trim())
  .filter((arch) => arch.length > 0);

if (archList.length === 0) {
  throw new Error('No Electron Forge target architecture was configured.');
}

process.chdir(appDir);

const keepAlive = setInterval(() => undefined, 1000);

try {
  for (const arch of archList) {
    await withTimeout(
      api.package({
        arch,
        dir: appDir,
        interactive: false,
        platform,
      }),
      packageTimeoutMs,
      `Electron Forge package timed out for ${platform}/${arch}.`,
    );
  }
} finally {
  clearInterval(keepAlive);
}

const entries = await readdir(outDir, { withFileTypes: true }).catch(() => []);
const packages = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

if (packages.length === 0) {
  throw new Error(`Electron Forge did not create package output at ${outDir}.`);
}

for (const packageName of packages) {
  console.log(relative(repoDir, resolve(outDir, packageName)));
}

function withTimeout(promise, timeoutMs, message) {
  let timeout;
  const timeoutPromise = new Promise((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeout);
  });
}
