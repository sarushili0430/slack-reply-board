import type { SpawnOptions } from 'node:child_process';
import { EventEmitter } from 'node:events';

import { describe, expect, test, vi } from 'vitest';

import type { SpawnedDaemonProcess } from './node-daemon-process.js';

class FakeSpawnedDaemonProcess extends EventEmitter implements SpawnedDaemonProcess {
  kill(): boolean {
    return true;
  }
}

type SpawnCall = {
  readonly args: string[];
  readonly command: string;
  readonly options: SpawnOptions;
};

describe('FR-DAEMON-001 Daemon crash supervision', () => {
  test('TEST-DAEMON-UNIT-005 / AC-DAEMON-001-02: desktop daemon supervisor hands local API settings to daemon process', async () => {
    vi.doMock('electron', () => ({
      app: {
        isPackaged: false,
        resourcesPath: '/replyboard/resources',
      },
    }));
    const spawnCalls: SpawnCall[] = [];
    const spawnProcess = (
      command: string,
      args: string[],
      options: SpawnOptions,
    ): SpawnedDaemonProcess => {
      spawnCalls.push({ args, command, options });
      return new FakeSpawnedDaemonProcess();
    };
    const { createDesktopDaemonSupervisor } = await import('./create-desktop-daemon-supervisor.js');
    const daemonSupervisor = createDesktopDaemonSupervisor({
      createSessionToken: () => 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      daemonEntryPath: '/replyboard/daemon-entrypoint.js',
      localApiHost: '127.0.0.1',
      localApiPort: 43123,
      nodeExecutablePath: '/usr/local/bin/node',
      spawnProcess,
    });

    await daemonSupervisor.start();

    expect(daemonSupervisor.localApiConnection).toEqual({
      origin: 'http://127.0.0.1:43123',
      sessionToken: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    });
    expect(spawnCalls).toHaveLength(1);
    expect(spawnCalls[0]?.options.env).toMatchObject({
      REPLYBOARD_LOCAL_API_HOST: '127.0.0.1',
      REPLYBOARD_LOCAL_API_PORT: '43123',
      REPLYBOARD_LOCAL_API_SESSION_TOKEN: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    });
  });
});
