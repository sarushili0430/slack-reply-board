import started from 'electron-squirrel-startup';
import { app } from 'electron';

import {
  runPackageSmokeMainProcess,
  shouldRunPackageSmokeMainProcess,
} from './app-lifecycle/package-smoke-main-process.js';
import { createPackageSmokeReadySignal } from './app-lifecycle/package-smoke-ready-signal.js';
import { registerAppLifecycle } from './app-lifecycle/register-app-lifecycle.js';
import { createDesktopDaemonSupervisor } from './daemon-supervisor/create-desktop-daemon-supervisor.js';
import { registerAppIpc } from './ipc/register-app-ipc.js';
import { createMainWindow } from './windows/create-main-window.js';

if (started) {
  app.quit();
}

const daemonSupervisor = createDesktopDaemonSupervisor();
const packageSmokeReadySignal = createPackageSmokeReadySignal();

if (shouldRunPackageSmokeMainProcess()) {
  void runPackageSmokeMainProcess({
    startDaemon: () => daemonSupervisor.start(),
    stopDaemon: () => daemonSupervisor.stop(),
  }).catch((error: unknown) => {
    const message = error instanceof Error ? (error.stack ?? error.message) : String(error);

    process.stderr.write(`Package smoke main process failed: ${message}\n`);
    app.exit(1);
  });
} else {
  registerAppIpc();
  registerAppLifecycle({
    createMainWindow,
    startDaemon: () => daemonSupervisor.start(),
    stopDaemon: () => daemonSupervisor.stop(),
    ...(packageSmokeReadySignal === undefined ? {} : { afterReady: packageSmokeReadySignal }),
  });
}
