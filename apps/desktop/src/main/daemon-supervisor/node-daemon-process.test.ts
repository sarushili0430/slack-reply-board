import type { SpawnOptions } from 'node:child_process';
import { EventEmitter } from 'node:events';

import { describe, expect, test, vi } from 'vitest';

import type { DaemonExit } from './restart-policy.js';
import {
  createNodeDaemonProcessStarter,
  type SpawnedDaemonProcess,
} from './node-daemon-process.js';

class FakeSpawnedDaemonProcess extends EventEmitter implements SpawnedDaemonProcess {
  readonly kill = vi.fn(() => true);
}

type SpawnCall = {
  readonly command: string;
  readonly args: string[];
  readonly options: SpawnOptions;
};

function getSpawnCall(calls: readonly SpawnCall[], index: number): SpawnCall {
  const call = calls[index];

  if (call === undefined) {
    throw new Error(`Expected spawn call at index ${String(index)}.`);
  }

  return call;
}

describe('FR-DAEMON-001 Daemon crash supervision', () => {
  test('TEST-DAEMON-UNIT-004 / AC-DAEMON-001-01: Node daemon process starter spawns and reports daemon exits', async () => {
    const firstChildProcess = new FakeSpawnedDaemonProcess();
    const secondChildProcess = new FakeSpawnedDaemonProcess();
    const childProcesses = [firstChildProcess, secondChildProcess];
    const spawnCalls: SpawnCall[] = [];
    const spawnProcess = (
      command: string,
      args: string[],
      options: SpawnOptions,
    ): SpawnedDaemonProcess => {
      spawnCalls.push({ command, args, options });
      const childProcess = childProcesses.shift();

      if (childProcess === undefined) {
        throw new Error('Unexpected daemon process spawn.');
      }

      return childProcess;
    };
    const startProcess = createNodeDaemonProcessStarter({
      daemonEntryPath: '/replyboard/daemon-entrypoint.js',
      env: { REPLYBOARD_TEST: '1' },
      nodeExecutablePath: '/usr/local/bin/node',
      spawnProcess,
    });

    const firstDaemonProcess = await startProcess();
    const exits: DaemonExit[] = [];
    firstDaemonProcess.onExit((exit) => {
      exits.push(exit);
    });

    const firstSpawn = getSpawnCall(spawnCalls, 0);

    expect(firstSpawn.command).toBe('/usr/local/bin/node');
    expect(firstSpawn.args).toEqual(['/replyboard/daemon-entrypoint.js']);
    expect(firstSpawn.options.env).toMatchObject({
      ELECTRON_RUN_AS_NODE: '1',
      REPLYBOARD_TEST: '1',
    });
    expect(firstSpawn.options.stdio).toBe('ignore');

    firstChildProcess.emit('exit', 1, null);

    expect(exits).toEqual([{ expected: false }]);

    const secondDaemonProcess = await startProcess();
    secondDaemonProcess.onExit((exit) => {
      exits.push(exit);
    });
    await secondDaemonProcess.stop();
    secondChildProcess.emit('exit', null, 'SIGTERM');

    expect(secondChildProcess.kill).toHaveBeenCalledWith('SIGTERM');
    expect(exits).toEqual([{ expected: false }, { expected: true }]);
  });
});
