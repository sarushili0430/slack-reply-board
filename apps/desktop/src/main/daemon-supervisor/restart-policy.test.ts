import { describe, expect, test } from 'vitest';

import { DaemonRestartPolicy } from './restart-policy.js';

describe('FR-DAEMON-001 Daemon crash supervision', () => {
  test('TEST-DAEMON-UNIT-001 / AC-DAEMON-001-01: daemonの予期しない終了は最大3回だけ再起動する', () => {
    const policy = new DaemonRestartPolicy();

    expect(policy.recordExit({ expected: false })).toEqual({
      action: 'restart',
      restartAttempt: 1,
      reason: 'unexpected-exit',
    });
    expect(policy.recordExit({ expected: false })).toEqual({
      action: 'restart',
      restartAttempt: 2,
      reason: 'unexpected-exit',
    });
    expect(policy.recordExit({ expected: false })).toEqual({
      action: 'restart',
      restartAttempt: 3,
      reason: 'unexpected-exit',
    });
    expect(policy.recordExit({ expected: false })).toEqual({
      action: 'stop',
      restartAttempt: 3,
      reason: 'restart-limit-reached',
    });

    policy.reset();

    expect(policy.recordExit({ expected: true })).toEqual({
      action: 'stop',
      restartAttempt: 0,
      reason: 'expected-stop',
    });
  });
});
