import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { beforeEach, describe, expect, test, vi } from 'vitest';

describe('FR-PACKAGE-001 Electron Forge packaging', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test('TEST-PACKAGE-UNIT-002 / AC-PACKAGE-001-02: package smoke main process waits for daemon marker and exits cleanly', async () => {
    const exit = vi.fn();
    vi.doMock('electron', () => ({
      app: { exit },
    }));
    const directory = await mkdtemp(join(tmpdir(), 'replyboard-package-smoke-main-test-'));
    const appReadyFilePath = join(directory, 'app-ready.json');
    const daemonReadyFilePath = join(directory, 'daemon-ready.json');
    const startDaemon = vi.fn(async () => {
      await writeFile(daemonReadyFilePath, `${JSON.stringify({ ready: true })}\n`);
    });
    const stopDaemon = vi.fn(() => Promise.resolve());
    const { runPackageSmokeMainProcess } = await import('./package-smoke-main-process.js');

    await runPackageSmokeMainProcess({
      env: {
        REPLYBOARD_PACKAGE_SMOKE_DAEMON_READY_FILE: daemonReadyFilePath,
        REPLYBOARD_PACKAGE_SMOKE_READY_FILE: appReadyFilePath,
      },
      startDaemon,
      stopDaemon,
      timeoutMs: 1_000,
    });

    const marker = JSON.parse(await readFile(appReadyFilePath, 'utf8')) as {
      readonly ready: boolean;
    };
    expect(marker.ready).toBe(true);
    expect(startDaemon).toHaveBeenCalledTimes(1);
    expect(stopDaemon).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(0);
  });
});
