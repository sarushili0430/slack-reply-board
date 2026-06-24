import { DaemonRestartPolicy, type DaemonExit } from './restart-policy.js';

export type SupervisedDaemonProcess = {
  onExit(callback: (exit: DaemonExit) => Promise<void> | void): void;
  stop(): Promise<void>;
};

export type DaemonProcessStarter = () => Promise<SupervisedDaemonProcess>;

export type DaemonSupervisorOptions = {
  readonly startProcess: DaemonProcessStarter;
  readonly restartPolicy?: DaemonRestartPolicy;
};

export class DaemonSupervisor {
  readonly #startProcess: DaemonProcessStarter;
  readonly #restartPolicy: DaemonRestartPolicy;
  #process: SupervisedDaemonProcess | null = null;
  #stopping = false;

  constructor(options: DaemonSupervisorOptions) {
    this.#startProcess = options.startProcess;
    this.#restartPolicy = options.restartPolicy ?? new DaemonRestartPolicy();
  }

  async start(): Promise<void> {
    if (this.#process !== null) {
      return;
    }

    this.#stopping = false;
    await this.#startProcessOnce();
  }

  async stop(): Promise<void> {
    this.#stopping = true;
    const process = this.#process;
    this.#process = null;

    if (process !== null) {
      await process.stop();
    }
  }

  async #startProcessOnce(): Promise<void> {
    const process = await this.#startProcess();
    this.#process = process;
    process.onExit((exit) => this.#recordExit(exit));
  }

  async #recordExit(exit: DaemonExit): Promise<void> {
    this.#process = null;

    const decision = this.#restartPolicy.recordExit({
      expected: this.#stopping || exit.expected,
    });

    if (decision.action === 'restart') {
      await this.#startProcessOnce();
    }
  }
}
