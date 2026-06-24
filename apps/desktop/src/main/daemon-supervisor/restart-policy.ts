export type DaemonExit = {
  readonly expected: boolean;
};

export type DaemonRestartDecision =
  | {
      readonly action: 'restart';
      readonly restartAttempt: number;
      readonly reason: 'unexpected-exit';
    }
  | {
      readonly action: 'stop';
      readonly restartAttempt: number;
      readonly reason: 'expected-stop' | 'restart-limit-reached';
    };

export type DaemonRestartPolicyOptions = {
  readonly maxRestarts?: number;
};

const defaultMaxRestarts = 3;

export class DaemonRestartPolicy {
  readonly #maxRestarts: number;
  #restartAttempts = 0;

  constructor(options: DaemonRestartPolicyOptions = {}) {
    this.#maxRestarts = options.maxRestarts ?? defaultMaxRestarts;

    if (!Number.isInteger(this.#maxRestarts) || this.#maxRestarts < 0) {
      throw new Error('maxRestarts must be a non-negative integer.');
    }
  }

  recordExit(exit: DaemonExit): DaemonRestartDecision {
    if (exit.expected) {
      return {
        action: 'stop',
        restartAttempt: this.#restartAttempts,
        reason: 'expected-stop',
      };
    }

    if (this.#restartAttempts >= this.#maxRestarts) {
      return {
        action: 'stop',
        restartAttempt: this.#restartAttempts,
        reason: 'restart-limit-reached',
      };
    }

    this.#restartAttempts += 1;

    return {
      action: 'restart',
      restartAttempt: this.#restartAttempts,
      reason: 'unexpected-exit',
    };
  }

  reset(): void {
    this.#restartAttempts = 0;
  }
}
