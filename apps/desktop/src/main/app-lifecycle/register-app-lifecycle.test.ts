import { beforeEach, describe, expect, test, vi } from 'vitest';

function createElectronAppMock() {
  const callbacks = new Map<string, () => void>();
  const appMock = {
    whenReady: vi.fn(() => Promise.resolve()),
    on: vi.fn((eventName: string, callback: () => void) => {
      callbacks.set(eventName, callback);
    }),
    isReady: vi.fn(() => true),
    quit: vi.fn(),
  };

  return {
    appMock,
    callbacks,
  };
}

describe('FR-DAEMON-001 Daemon crash supervision', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test('TEST-DAEMON-UNIT-003 / AC-DAEMON-001-01: Electron lifecycle starts and stops the daemon supervisor', async () => {
    const { appMock, callbacks } = createElectronAppMock();
    vi.doMock('electron', () => ({ app: appMock }));

    const { registerAppLifecycle } = await import('./register-app-lifecycle.js');
    const events: string[] = [];
    const startDaemon = vi.fn((): Promise<void> => {
      events.push('daemon:start');
      return Promise.resolve();
    });
    const stopDaemon = vi.fn((): Promise<void> => {
      events.push('daemon:stop');
      return Promise.resolve();
    });
    const createMainWindow = vi.fn((): Promise<void> => {
      events.push('window:create');
      return Promise.resolve();
    });

    registerAppLifecycle({
      createMainWindow,
      startDaemon,
      stopDaemon,
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(events).toEqual(['daemon:start', 'window:create']);

    callbacks.get('before-quit')?.();

    expect(stopDaemon).toHaveBeenCalledTimes(1);
  });
});
