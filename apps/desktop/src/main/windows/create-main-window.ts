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

  registerMainWindowNavigationGuards(mainWindow);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL !== undefined) {
    await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    return;
  }

  await mainWindow.loadFile(
    join(currentDirectory, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
  );
}

function registerMainWindowNavigationGuards(mainWindow: BrowserWindow): void {
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, targetUrl) => {
    if (!isAllowedMainWindowNavigation(targetUrl)) {
      event.preventDefault();
    }
  });
}

function isAllowedMainWindowNavigation(targetUrl: string): boolean {
  try {
    const parsedTargetUrl = new URL(targetUrl);

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL !== undefined) {
      const devServerUrl = new URL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
      return parsedTargetUrl.origin === devServerUrl.origin;
    }

    return parsedTargetUrl.protocol === 'file:';
  } catch {
    return false;
  }
}
