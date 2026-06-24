import { describe, expect, test } from 'vitest';

import { createReplyboardPreloadApi } from './replyboard-api.js';

class RecordingIpc {
  readonly channels: string[] = [];

  invoke(channel: 'app:get-version'): Promise<unknown> {
    this.channels.push(channel);
    return Promise.resolve('0.1.0-test');
  }
}

describe('FR-DESKTOP-001 Renderer Slack posting boundary', () => {
  test('TEST-DESKTOP-UNIT-001 / AC-DESKTOP-001-01: preload APIはSlack投稿や任意channel指定を公開しない', async () => {
    const ipc = new RecordingIpc();
    const api = createReplyboardPreloadApi(ipc);
    const exposedMethodNames = Object.keys(api);

    expect(exposedMethodNames).toEqual(['getAppVersion']);
    expect(exposedMethodNames.join(' ')).not.toMatch(/slack|post|send|channel/i);

    await expect(api.getAppVersion()).resolves.toBe('0.1.0-test');
    expect(ipc.channels).toEqual(['app:get-version']);
  });
});
