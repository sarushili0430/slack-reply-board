import { app } from 'electron';
import { join } from 'node:path';

import { DaemonSupervisor } from './daemon-supervisor.js';
import { createNodeDaemonProcessStarter } from './node-daemon-process.js';

export function createDesktopDaemonSupervisor(): DaemonSupervisor {
  return new DaemonSupervisor({
    startProcess: createNodeDaemonProcessStarter({
      daemonEntryPath: resolveDaemonEntryPath(),
      nodeExecutablePath: process.execPath,
    }),
  });
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
