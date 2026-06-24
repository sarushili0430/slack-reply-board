import started from 'electron-squirrel-startup';
import { app } from 'electron';

import { registerAppLifecycle } from './app-lifecycle/register-app-lifecycle.js';
import { registerAppIpc } from './ipc/register-app-ipc.js';
import { createMainWindow } from './windows/create-main-window.js';

if (started) {
  app.quit();
}

registerAppIpc();
registerAppLifecycle(createMainWindow);
