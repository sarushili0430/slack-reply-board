import { app } from 'electron';

export type RegisterAppLifecycleOptions = {
  readonly afterReady?: () => Promise<void>;
  readonly createMainWindow: () => Promise<void>;
  readonly startDaemon?: () => Promise<void>;
  readonly stopDaemon?: () => Promise<void>;
};

export function registerAppLifecycle(options: RegisterAppLifecycleOptions): void {
  app
    .whenReady()
    .then(async () => {
      await options.startDaemon?.();
      await options.createMainWindow();
      await options.afterReady?.();
    })
    .catch((error: unknown) => {
      throw error;
    });

  app.on('activate', () => {
    if (app.isReady()) {
      void options.createMainWindow();
    }
  });

  app.on('before-quit', () => {
    void options.stopDaemon?.();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
