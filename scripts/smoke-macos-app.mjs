import { access, mkdtemp, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';

import { _electron as electron } from 'playwright';

const defaultOutDirectory = join('apps', 'desktop', 'out');
const outDirectory = process.argv[2] ?? process.env.REPLYBOARD_MACOS_OUT_DIR ?? defaultOutDirectory;
const appPath = process.env.REPLYBOARD_MACOS_APP_PATH ?? (await findMacosApp(outDirectory));
const appExecutablePath = join(appPath, 'Contents', 'MacOS', 'SlackReplyBoard');
const smokeDaemonEntryPath = await createSmokeDaemonEntry();

await access(appExecutablePath);

const app = await electron.launch({
  executablePath: appExecutablePath,
  env: {
    ...process.env,
    REPLYBOARD_DAEMON_ENTRY_PATH: smokeDaemonEntryPath,
    REPLYBOARD_E2E: '1',
  },
});

try {
  const window = await app.firstWindow({ timeout: 30_000 });

  await window.locator('[data-testid="reply-board-ready"]').waitFor({
    state: 'visible',
    timeout: 30_000,
  });

  const nodeRequireType = await window.evaluate(() => typeof globalThis.require);

  if (nodeRequireType !== 'undefined') {
    throw new Error(`Renderer must not expose require; got ${nodeRequireType}.`);
  }

  const appVersion = await window.evaluate(async () => {
    const api = window.replyBoard;

    return api.getAppVersion();
  });

  if (!/^\d+\.\d+\.\d+/u.test(appVersion)) {
    throw new Error(`Expected packaged app version, got ${appVersion}.`);
  }

  console.log(`Packaged macOS app smoke passed: ${relative(process.cwd(), appPath)}`);
} finally {
  await app.close();
}

async function findMacosApp(directory) {
  const apps = await listMacosApps(directory);

  if (apps.length === 0) {
    throw new Error(`No .app bundle found under ${directory}.`);
  }

  const preferredArchitecture = process.arch === 'arm64' ? 'arm64' : 'x64';
  const preferredApp = apps.find((candidate) =>
    candidate.split('/').some((segment) => segment.includes(preferredArchitecture)),
  );

  return preferredApp ?? apps[0];
}

async function listMacosApps(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch((error) => {
    throw new Error(
      `Unable to read ${directory}: ${error instanceof Error ? error.message : error}`,
    );
  });
  const apps = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);

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

async function createSmokeDaemonEntry() {
  const directory = await mkdtemp(join(tmpdir(), 'replyboard-daemon-smoke-'));
  const entryPath = join(directory, 'daemon-entrypoint.mjs');

  await writeFile(
    entryPath,
    [
      'const keepAlive = setInterval(() => undefined, 60_000);',
      "process.once('SIGTERM', () => {",
      '  clearInterval(keepAlive);',
      '  process.exit(0);',
      '});',
      "process.once('SIGINT', () => {",
      '  clearInterval(keepAlive);',
      '  process.exit(0);',
      '});',
      '',
    ].join('\n'),
  );

  return entryPath;
}
