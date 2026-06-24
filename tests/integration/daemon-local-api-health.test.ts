import { afterEach, describe, expect, test } from 'vitest';

import {
  createLocalApiSessionToken,
  startDaemon,
  startLocalApiServer,
} from '../../apps/daemon/src/index.js';
import { fetchDaemonHealth } from '../../apps/desktop/src/main/daemon-supervisor/daemon-health-client.js';

const runtimes: { stop(): Promise<void> }[] = [];

afterEach(async () => {
  while (runtimes.length > 0) {
    await runtimes.pop()?.stop();
  }
});

describe('FR-LOCAL-001 Local API session protection', () => {
  test('TEST-LOCAL-INTEGRATION-001 AC-LOCAL-001-02: daemon health requires the current local API token', async () => {
    const sessionToken = createLocalApiSessionToken({
      randomBytes: () => Buffer.alloc(32, 3),
    });
    const runtime = await startLocalApiServer({
      host: '127.0.0.1',
      port: 0,
      sessionToken,
    });
    runtimes.push(runtime);

    const unauthorizedResponse = await fetch(`${runtime.origin}/health`);

    expect(unauthorizedResponse.status).toBe(401);

    const authorizedResponse = await fetch(`${runtime.origin}/health`, {
      headers: {
        authorization: `Bearer ${sessionToken}`,
      },
    });
    const healthPayload: unknown = await authorizedResponse.json();

    expect(authorizedResponse.status).toBe(200);
    expect(healthPayload).toMatchObject({
      status: 'ok',
      indexerConnected: false,
      qwenConnected: false,
    });

    await runtime.stop();
    runtimes.pop();
  });

  test('TEST-LOCAL-INTEGRATION-002 AC-LOCAL-001-02: daemon runtime exposes an authenticated health endpoint', async () => {
    const sessionToken = createLocalApiSessionToken({
      randomBytes: () => Buffer.alloc(32, 4),
    });
    const runtime = await startDaemon({
      databasePath: ':memory:',
      localApi: {
        host: '127.0.0.1',
        port: 0,
        sessionToken,
      },
    });
    runtimes.push(runtime);

    const response = await fetch(`${runtime.localApi.origin}/health`, {
      headers: {
        authorization: `Bearer ${runtime.localApi.sessionToken}`,
      },
    });
    const healthPayload: unknown = await response.json();

    expect(response.status).toBe(200);
    expect(healthPayload).toMatchObject({ status: 'ok' });

    await runtime.stop();
    runtimes.pop();
  });

  test('TEST-LOCAL-INTEGRATION-003 AC-LOCAL-001-02: desktop main can verify daemon health with the current token', async () => {
    const sessionToken = createLocalApiSessionToken({
      randomBytes: () => Buffer.alloc(32, 5),
    });
    const runtime = await startLocalApiServer({
      host: '127.0.0.1',
      port: 0,
      sessionToken,
    });
    runtimes.push(runtime);

    const healthPayload = await fetchDaemonHealth({
      origin: runtime.origin,
      sessionToken,
    });

    expect(healthPayload.status).toBe('ok');

    await runtime.stop();
    runtimes.pop();
  });
});
