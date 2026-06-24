import { app } from 'electron';

export function registerAppLifecycle(createMainWindow: () => Promise<void>): void {
  app
    .whenReady()
    .then(createMainWindow)
    .catch((error: unknown) => {
      throw error;
    });

  app.on('activate', () => {
    if (app.isReady()) {
      void createMainWindow();
    }
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
