import { readFile, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

import { app } from 'electron';

export type PackageSmokeMainProcessOptions = {
  readonly env?: NodeJS.ProcessEnv;
  readonly startDaemon: () => Promise<void>;
  readonly stopDaemon: () => Promise<void>;
  readonly timeoutMs?: number;
};

export function shouldRunPackageSmokeMainProcess(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.REPLYBOARD_PACKAGE_SMOKE_MAIN_PROCESS === '1';
}

export async function runPackageSmokeMainProcess(
  options: PackageSmokeMainProcessOptions,
): Promise<void> {
  const env = options.env ?? process.env;
  const timeoutMs = options.timeoutMs ?? readPackageSmokeTimeoutMs(env);

  await options.startDaemon();

  try {
    await waitForReadyMarker(requiredEnvPath(env, 'REPLYBOARD_PACKAGE_SMOKE_DAEMON_READY_FILE'), {
      timeoutMs,
    });
    await writeReadyMarker(requiredEnvPath(env, 'REPLYBOARD_PACKAGE_SMOKE_READY_FILE'));
  } finally {
    await options.stopDaemon();
  }

  app.exit(0);
}

async function waitForReadyMarker(path: string, options: { readonly timeoutMs: number }) {
  const deadline = Date.now() + options.timeoutMs;

  while (Date.now() < deadline) {
    const marker = await readJsonMarker(path);

    if (marker?.ready === true) {
      return;
    }

    await delay(100);
  }

  throw new Error(`Timed out waiting for package smoke marker: ${path}`);
}

async function readJsonMarker(path: string): Promise<{ readonly ready?: unknown } | undefined> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as { readonly ready?: unknown };
  } catch {
    return undefined;
  }
}

async function writeReadyMarker(path: string): Promise<void> {
  await writeFile(
    path,
    `${JSON.stringify({
      ready: true,
      pid: process.pid,
      timestamp: new Date().toISOString(),
    })}\n`,
  );
}

function requiredEnvPath(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name];

  if (value === undefined || value.length === 0) {
    throw new Error(`${name} must be set for package smoke.`);
  }

  return value;
}

function readPackageSmokeTimeoutMs(env: NodeJS.ProcessEnv): number {
  const configuredTimeoutMs = env.REPLYBOARD_PACKAGE_SMOKE_TIMEOUT_MS;

  if (configuredTimeoutMs === undefined || configuredTimeoutMs.length === 0) {
    return 10_000;
  }

  const timeoutMs = Number.parseInt(configuredTimeoutMs, 10);

  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error('REPLYBOARD_PACKAGE_SMOKE_TIMEOUT_MS must be a positive integer.');
  }

  return timeoutMs;
}
