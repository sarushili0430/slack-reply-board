import { app } from 'electron';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';

import { localApiSessionTokenSchema } from '@replyboard/contracts';

import { DaemonSupervisor } from './daemon-supervisor.js';
import { createNodeDaemonProcessStarter, type SpawnDaemonProcess } from './node-daemon-process.js';

export type DaemonLocalApiConnection = {
  readonly origin: string;
  readonly sessionToken: string;
};

export type DesktopDaemonSupervisor = {
  readonly localApiConnection: DaemonLocalApiConnection;
  start(): Promise<void>;
  stop(): Promise<void>;
};

export type DesktopDaemonSupervisorOptions = {
  readonly createSessionToken?: () => string;
  readonly daemonEntryPath?: string;
  readonly localApiHost?: string;
  readonly localApiPort?: number;
  readonly nodeExecutablePath?: string;
  readonly spawnProcess?: SpawnDaemonProcess;
};

const defaultLocalApiHost = '127.0.0.1';
const defaultLocalApiPort = 43123;

export function createDesktopDaemonSupervisor(
  options: DesktopDaemonSupervisorOptions = {},
): DesktopDaemonSupervisor {
  const localApiHost =
    options.localApiHost ?? process.env.REPLYBOARD_LOCAL_API_HOST ?? defaultLocalApiHost;
  const localApiPort = options.localApiPort ?? getLocalApiPort();
  const sessionToken = localApiSessionTokenSchema.parse(
    options.createSessionToken?.() ?? randomBytes(32).toString('base64url'),
  );
  const supervisor = new DaemonSupervisor({
    startProcess: createNodeDaemonProcessStarter({
      daemonEntryPath: options.daemonEntryPath ?? resolveDaemonEntryPath(),
      env: {
        REPLYBOARD_LOCAL_API_HOST: localApiHost,
        REPLYBOARD_LOCAL_API_PORT: String(localApiPort),
        REPLYBOARD_LOCAL_API_SESSION_TOKEN: sessionToken,
      },
      nodeExecutablePath: options.nodeExecutablePath ?? process.execPath,
      ...(options.spawnProcess === undefined ? {} : { spawnProcess: options.spawnProcess }),
    }),
  });

  return {
    localApiConnection: {
      origin: toLocalApiOrigin(localApiHost, localApiPort),
      sessionToken,
    },
    start(): Promise<void> {
      return supervisor.start();
    },
    stop(): Promise<void> {
      return supervisor.stop();
    },
  };
}

function resolveDaemonEntryPath(): string {
  const override = process.env.REPLYBOARD_DAEMON_ENTRY_PATH;

  if (override !== undefined && override.length > 0) {
    return override;
  }

  if (app.isPackaged) {
    return join(process.resourcesPath, 'daemon', 'daemon-entrypoint.js');
  }

  return join(process.cwd(), '..', 'daemon', 'dist', 'bootstrap', 'daemon-entrypoint.js');
}

function getLocalApiPort(): number {
  const configuredPort = process.env.REPLYBOARD_LOCAL_API_PORT;

  if (configuredPort === undefined || configuredPort.length === 0) {
    return defaultLocalApiPort;
  }

  const port = Number.parseInt(configuredPort, 10);

  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new Error('REPLYBOARD_LOCAL_API_PORT must be an integer between 0 and 65535.');
  }

  return port;
}

function toLocalApiOrigin(host: string, port: number): string {
  const normalizedHost = host === '::1' ? '[::1]' : host;

  return `http://${normalizedHost}:${String(port)}`;
}
