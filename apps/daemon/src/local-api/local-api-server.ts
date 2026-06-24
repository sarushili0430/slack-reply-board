import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';

import {
  completeSlackOAuthRequestSchema,
  completeSlackOAuthResponseSchema,
  daemonHealthSchema,
  type CompleteSlackOAuthRequestContract,
  type CompleteSlackOAuthResponseContract,
  type DaemonHealthContract,
} from '@replyboard/contracts';

import { getDaemonHealth } from '../health/daemon-health.js';
import { createLocalApiListenOptions, type LocalApiListenOptions } from './listen-options.js';
import { isLocalApiRequestAuthorized } from './session-token.js';

const maxRequestBodyBytes = 64 * 1024;

export type CompleteSlackOAuthHandler = (
  request: CompleteSlackOAuthRequestContract,
) => CompleteSlackOAuthResponseContract | Promise<CompleteSlackOAuthResponseContract>;

export type LocalApiServerOptions = LocalApiListenOptions & {
  readonly sessionToken: string;
  readonly getHealth?: () => DaemonHealthContract;
  readonly completeSlackOAuth?: CompleteSlackOAuthHandler;
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
    void handleLocalApiRequest({
      completeSlackOAuth: options.completeSlackOAuth,
      getHealth,
      request,
      response,
      sessionToken: options.sessionToken,
    }).catch(() => {
      if (response.headersSent) {
        response.destroy();
        return;
      }

      writeJson(response, 500, { error: 'internal_error' });
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
  readonly completeSlackOAuth: CompleteSlackOAuthHandler | undefined;
  readonly getHealth: () => DaemonHealthContract;
  readonly request: IncomingMessage;
  readonly response: ServerResponse;
  readonly sessionToken: string;
};

async function handleLocalApiRequest(context: LocalApiRequestContext): Promise<void> {
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

  if (context.request.method === 'POST' && context.request.url === '/slack/oauth/complete') {
    await handleCompleteSlackOAuthRequest(context);
    return;
  }

  writeJson(context.response, 404, { error: 'not_found' });
}

async function handleCompleteSlackOAuthRequest(context: LocalApiRequestContext): Promise<void> {
  if (context.completeSlackOAuth === undefined) {
    writeJson(context.response, 404, { error: 'not_found' });
    return;
  }

  const body = await readJsonRequestBody(context.request);
  const request = completeSlackOAuthRequestSchema.safeParse(body);

  if (!request.success) {
    writeJson(context.response, 400, { error: 'invalid_request' });
    return;
  }

  const result = await context.completeSlackOAuth(request.data);

  writeJson(context.response, 200, completeSlackOAuthResponseSchema.parse(result));
}

async function readJsonRequestBody(request: IncomingMessage): Promise<unknown> {
  const rawBody = await readRequestBody(request);

  if (rawBody.length === 0) {
    return null;
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    return null;
  }
}

function readRequestBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    let totalBytes = 0;

    request.setEncoding('utf8');
    request.on('data', (chunk: string | Buffer) => {
      const text = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
      totalBytes += Buffer.byteLength(text);

      if (totalBytes > maxRequestBodyBytes) {
        reject(new Error('Local API request body is too large.'));
        request.destroy();
        return;
      }

      chunks.push(text);
    });
    request.once('end', () => {
      resolve(chunks.join(''));
    });
    request.once('error', reject);
  });
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
