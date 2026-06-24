import { describe, expect, test } from 'vitest';

import { DaemonSupervisor, type SupervisedDaemonProcess } from './daemon-supervisor.js';
import type { DaemonExit } from './restart-policy.js';

class FakeDaemonProcess implements SupervisedDaemonProcess {
  readonly #exitCallbacks: ((exit: DaemonExit) => Promise<void> | void)[] = [];
  stopCount = 0;

  onExit(callback: (exit: DaemonExit) => Promise<void> | void): void {
    this.#exitCallbacks.push(callback);
  }

  stop(): Promise<void> {
    this.stopCount += 1;
    return Promise.resolve();
  }

  async exit(exit: DaemonExit): Promise<void> {
    for (const callback of this.#exitCallbacks) {
      await callback(exit);
    }
  }
}

function getProcess(processes: readonly FakeDaemonProcess[], index: number): FakeDaemonProcess {
  const process = processes[index];

  if (process === undefined) {
    throw new Error(`Expected daemon process at index ${String(index)}.`);
  }

  return process;
}

describe('FR-DAEMON-001 Daemon crash supervision', () => {
  test('TEST-DAEMON-UNIT-002 / AC-DAEMON-001-01: supervisorは予期しないexitを最大3回だけ再起動する', async () => {
    const processes: FakeDaemonProcess[] = [];
    const supervisor = new DaemonSupervisor({
      startProcess: () => {
        const process = new FakeDaemonProcess();
        processes.push(process);
        return Promise.resolve(process);
      },
    });

    await supervisor.start();
    await getProcess(processes, 0).exit({ expected: false });
    await getProcess(processes, 1).exit({ expected: false });
    await getProcess(processes, 2).exit({ expected: false });
    await getProcess(processes, 3).exit({ expected: false });

    expect(processes).toHaveLength(4);

    await supervisor.stop();

    expect(getProcess(processes, 3).stopCount).toBe(0);
  });
});
