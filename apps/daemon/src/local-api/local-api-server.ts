import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';

import { daemonHealthSchema, type DaemonHealthContract } from '@replyboard/contracts';

import { getDaemonHealth } from '../health/daemon-health.js';
import { createLocalApiListenOptions, type LocalApiListenOptions } from './listen-options.js';
import { isLocalApiRequestAuthorized } from './session-token.js';

export type LocalApiServerOptions = LocalApiListenOptions & {
  readonly sessionToken: string;
  readonly getHealth?: () => DaemonHealthContract;
};

export type LocalApiRuntime = {
  readonly origin: string;
  stop(): Promise<void>;
};

export async function startLocalApiServer(
  options: LocalApiServerOptions,
): Promise<LocalApiRuntime> {
  const listenOptions = createLocalApiListenOptions(options);
  const getHealth = options.getHealth ?? getDaemonHealth;
  const server = createServer((request, response) => {
    handleLocalApiRequest({
      getHealth,
      request,
      response,
      sessionToken: options.sessionToken,
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(listenOptions.port, listenOptions.host, () => {
      server.off('error', reject);
      resolve();
    });
  });

  const address = server.address();

  if (address === null || typeof address === 'string') {
    await closeServer(server);
    throw new Error('Local API server did not bind to a TCP address.');
  }

  return {
    origin: toLocalApiOrigin(listenOptions.host, address),
    stop(): Promise<void> {
      return closeServer(server);
    },
  };
}

type LocalApiRequestContext = {
  readonly getHealth: () => DaemonHealthContract;
  readonly request: IncomingMessage;
  readonly response: ServerResponse;
  readonly sessionToken: string;
};

function handleLocalApiRequest(context: LocalApiRequestContext): void {
  if (
    !isLocalApiRequestAuthorized({
      authorizationHeader: context.request.headers.authorization,
      sessionToken: context.sessionToken,
    })
  ) {
    writeJson(context.response, 401, { error: 'unauthorized' });
    return;
  }

  if (context.request.method === 'GET' && context.request.url === '/health') {
    writeJson(context.response, 200, daemonHealthSchema.parse(context.getHealth()));
    return;
  }

  writeJson(context.response, 404, { error: 'not_found' });
}

function writeJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

function toLocalApiOrigin(host: string, address: AddressInfo): string {
  const normalizedHost = host === '::1' ? '[::1]' : host;

  return `http://${normalizedHost}:${String(address.port)}`;
}

function closeServer(server: ReturnType<typeof createServer>): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error !== undefined) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
