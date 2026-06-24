import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { beforeEach, describe, expect, test, vi } from 'vitest';

describe('FR-PACKAGE-001 Electron Forge packaging', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test('TEST-PACKAGE-UNIT-001 / AC-PACKAGE-001-02: package smoke readiness writes a marker and quits when requested', async () => {
    const quit = vi.fn();
    vi.doMock('electron', () => ({
      app: { quit },
    }));
    const directory = await mkdtemp(join(tmpdir(), 'replyboard-package-smoke-test-'));
    const readyFilePath = join(directory, 'ready.json');
    const { createPackageSmokeReadySignal } = await import('./package-smoke-ready-signal.js');
    const signalReady = createPackageSmokeReadySignal({
      REPLYBOARD_PACKAGE_SMOKE_READY_FILE: readyFilePath,
      REPLYBOARD_PACKAGE_SMOKE_QUIT_AFTER_READY: '1',
    });

    await signalReady?.();

    const marker = JSON.parse(await readFile(readyFilePath, 'utf8')) as {
      readonly ready: boolean;
      readonly pid: number;
    };
    expect(marker.ready).toBe(true);
    expect(marker.pid).toBe(process.pid);
    expect(quit).toHaveBeenCalledTimes(1);
  });
});
