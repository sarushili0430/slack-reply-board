import started from 'electron-squirrel-startup';
import { app } from 'electron';

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

registerAppIpc();
registerAppLifecycle({
  createMainWindow,
  startDaemon: () => daemonSupervisor.start(),
  stopDaemon: () => daemonSupervisor.stop(),
  ...(packageSmokeReadySignal === undefined ? {} : { afterReady: packageSmokeReadySignal }),
});
