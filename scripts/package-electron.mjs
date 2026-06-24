import { readdir, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { relative, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { packager } = require('@electron/packager');

const repoDir = process.cwd();
const appDir = resolve(repoDir, 'apps/desktop');
const outDir = resolve(appDir, 'out');
const platform = process.env.ELECTRON_PACKAGE_PLATFORM ?? process.platform;
const packageTimeoutMs = 10 * 60 * 1000;
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

const keepAlive = setInterval(() => undefined, 1000);

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    clearInterval(keepAlive);
  });

async function main() {
  await rm(outDir, { force: true, recursive: true });

  for (const arch of archList) {
    await withTimeout(
      packager({
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
      }),
      packageTimeoutMs,
      `Electron Packager timed out for ${platform}/${arch}.`,
    );
  }

  const entries = await readdir(outDir, { withFileTypes: true }).catch(() => []);
  const packages = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

  if (packages.length === 0) {
    throw new Error(`Electron Packager did not create package output at ${outDir}.`);
  }

  for (const packageName of packages) {
    console.log(relative(repoDir, resolve(outDir, packageName)));
  }
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
