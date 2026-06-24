import { spawn, type SpawnOptions } from 'node:child_process';

import type { DaemonProcessStarter, SupervisedDaemonProcess } from './daemon-supervisor.js';
import type { DaemonExit } from './restart-policy.js';

export type SpawnedDaemonProcess = {
  once(
    eventName: 'exit',
    callback: (code: number | null, signal: NodeJS.Signals | null) => void,
  ): SpawnedDaemonProcess;
  kill(signal?: NodeJS.Signals | number): boolean;
};

export type SpawnDaemonProcess = (
  command: string,
  args: string[],
  options: SpawnOptions,
) => SpawnedDaemonProcess;

export type NodeDaemonProcessStarterOptions = {
  readonly daemonEntryPath: string;
  readonly env?: NodeJS.ProcessEnv;
  readonly nodeExecutablePath: string;
  readonly spawnProcess?: SpawnDaemonProcess;
};

class NodeDaemonProcess implements SupervisedDaemonProcess {
  readonly #childProcess: SpawnedDaemonProcess;
  readonly #exitCallbacks: ((exit: DaemonExit) => Promise<void> | void)[] = [];
  #expectedExit = false;

  constructor(childProcess: SpawnedDaemonProcess) {
    this.#childProcess = childProcess;
    childProcess.once('exit', () => {
      void this.#notifyExit({ expected: this.#expectedExit });
    });
  }

  onExit(callback: (exit: DaemonExit) => Promise<void> | void): void {
    this.#exitCallbacks.push(callback);
  }

  stop(): Promise<void> {
    this.#expectedExit = true;
    this.#childProcess.kill('SIGTERM');
    return Promise.resolve();
  }

  async #notifyExit(exit: DaemonExit): Promise<void> {
    for (const callback of this.#exitCallbacks) {
      await callback(exit);
    }
  }
}

export function createNodeDaemonProcessStarter(
  options: NodeDaemonProcessStarterOptions,
): DaemonProcessStarter {
  const spawnProcess = options.spawnProcess ?? spawn;

  return () => {
    const childProcess = spawnProcess(options.nodeExecutablePath, [options.daemonEntryPath], {
      env: {
        ...process.env,
        ...options.env,
        ELECTRON_RUN_AS_NODE: '1',
      },
      stdio: 'ignore',
    });

    return Promise.resolve(new NodeDaemonProcess(childProcess));
  };
}
