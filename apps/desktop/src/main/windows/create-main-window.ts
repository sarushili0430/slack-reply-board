import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BrowserWindow } from 'electron';

const currentDirectory = dirname(fileURLToPath(import.meta.url));

export async function createMainWindow(): Promise<void> {
  const mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 900,
    minHeight: 600,
    show: false,
    webPreferences: {
      preload: join(currentDirectory, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL !== undefined) {
    await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    return;
  }

  await mainWindow.loadFile(
    join(currentDirectory, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
  );
}
