import { spawn } from 'node:child_process';
import { access, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const defaultOutDirectory = join('apps', 'desktop', 'out');
const outDirectory = process.argv[2] ?? process.env.REPLYBOARD_MACOS_OUT_DIR ?? defaultOutDirectory;
const appPath = process.env.REPLYBOARD_MACOS_APP_PATH ?? (await findMacosApp(outDirectory));
const appExecutablePath = join(appPath, 'Contents', 'MacOS', 'SlackReplyBoard');
const appAsarPath = join(appPath, 'Contents', 'Resources', 'app.asar');
const smokeDirectory = await mkdtemp(join(tmpdir(), 'replyboard-package-smoke-'));
const daemonReadyFilePath = join(smokeDirectory, 'daemon-ready.json');
const smokeDaemonEntryPath = await createSmokeDaemonEntry(smokeDirectory);
const timeoutMs = readTimeoutMs();

await Promise.all([access(appExecutablePath), access(appAsarPath)]);

const output = [];
const child = spawn(appExecutablePath, [smokeDaemonEntryPath], {
  env: {
    ...process.env,
    ELECTRON_RUN_AS_NODE: '1',
    REPLYBOARD_PACKAGE_SMOKE_DAEMON_READY_FILE: daemonReadyFilePath,
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

child.stdout?.on('data', (chunk) => {
  output.push(String(chunk));
});
child.stderr?.on('data', (chunk) => {
  output.push(String(chunk));
});

let childExit = undefined;
const childExitPromise = new Promise((resolve) => {
  child.once('exit', (code, signal) => {
    childExit = { code, signal };
    resolve(childExit);
  });
});

try {
  await waitForDaemonSmokeMarker({
    daemonReadyFilePath,
    getChildExit: () => childExit,
    timeoutMs,
  });
  const exit = await waitForProcessExit(childExitPromise, 30_000);

  if (exit.code !== 0) {
    throw new Error(
      `Packaged Electron Node-mode smoke exited with code ${String(exit.code)} and signal ${
        exit.signal
      }.`,
    );
  }

  console.log(`Packaged macOS app smoke passed: ${relative(process.cwd(), appPath)}`);
} catch (error) {
  await stopProcess(child, childExitPromise);
  throw new Error(
    `${error instanceof Error ? error.message : String(error)}${formatOutput(output)}`,
    {
      cause: error,
    },
  );
} finally {
  await rm(smokeDirectory, { recursive: true, force: true });
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

async function waitForDaemonSmokeMarker(options) {
  const deadline = Date.now() + options.timeoutMs;

  while (Date.now() < deadline) {
    const daemonReady = await readJsonMarker(options.daemonReadyFilePath);

    if (daemonReady?.ready === true) {
      return;
    }

    const childExit = options.getChildExit();

    if (childExit !== undefined) {
      throw new Error(
        `Packaged Electron Node-mode smoke exited before marker was written: code ${String(
          childExit.code,
        )}, signal ${childExit.signal}.`,
      );
    }

    await delay(100);
  }

  throw new Error(
    `Timed out after ${String(options.timeoutMs)}ms waiting for package smoke marker.`,
  );
}

async function readJsonMarker(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return undefined;
  }
}

async function waitForProcessExit(exitPromise, timeoutMs) {
  const timeout = delay(timeoutMs).then(() => undefined);
  const exit = await Promise.race([exitPromise, timeout]);

  if (exit === undefined) {
    throw new Error(
      `Packaged Electron Node-mode smoke did not exit within ${String(
        timeoutMs,
      )}ms after readiness.`,
    );
  }

  return exit;
}

async function stopProcess(childProcess, exitPromise) {
  if (childProcess.exitCode !== null || childProcess.signalCode !== null) {
    return;
  }

  childProcess.kill('SIGTERM');
  const stopped = await Promise.race([
    exitPromise.then(() => true),
    delay(5_000).then(() => false),
  ]);

  if (!stopped && childProcess.exitCode === null && childProcess.signalCode === null) {
    childProcess.kill('SIGKILL');
  }
}

async function createSmokeDaemonEntry(directory) {
  const entryPath = join(directory, 'daemon-entrypoint.mjs');

  await writeFile(
    entryPath,
    [
      "import { writeFileSync } from 'node:fs';",
      '',
      'const readyFilePath = process.env.REPLYBOARD_PACKAGE_SMOKE_DAEMON_READY_FILE;',
      'if (readyFilePath === undefined || readyFilePath.length === 0) {',
      "  throw new Error('REPLYBOARD_PACKAGE_SMOKE_DAEMON_READY_FILE must be set.');",
      '}',
      'writeFileSync(readyFilePath, `${JSON.stringify({ ready: true, pid: process.pid })}\\n`);',
      '',
    ].join('\n'),
  );

  return entryPath;
}

function readTimeoutMs() {
  const configuredTimeoutMs = process.env.REPLYBOARD_PACKAGE_SMOKE_TIMEOUT_MS;

  if (configuredTimeoutMs === undefined || configuredTimeoutMs.length === 0) {
    return 60_000;
  }

  const timeout = Number.parseInt(configuredTimeoutMs, 10);

  if (!Number.isInteger(timeout) || timeout <= 0) {
    throw new Error('REPLYBOARD_PACKAGE_SMOKE_TIMEOUT_MS must be a positive integer.');
  }

  return timeout;
}

function formatOutput(output) {
  if (output.length === 0) {
    return '';
  }

  return `\n\nApp output:\n${output.join('').trim()}`;
}
