import { completeSlackOAuth } from '@replyboard/slack-sync';

import { createCompositionRoot } from '../composition-root/create-composition-root.js';
import { startLocalApiServer, type LocalApiRuntime } from '../local-api/local-api-server.js';
import { createLocalApiSessionToken } from '../local-api/session-token.js';

export type DaemonRuntime = {
  readonly localApi: {
    readonly origin: string;
    readonly sessionToken: string;
  };
  stop(): Promise<void>;
};

export type StartDaemonOptions = {
  readonly databasePath?: string;
  readonly localApi?: {
    readonly host?: string;
    readonly port?: number;
    readonly sessionToken?: string;
  };
};

export async function startDaemon(options: StartDaemonOptions = {}): Promise<DaemonRuntime> {
  const compositionRoot = createCompositionRoot(
    options.databasePath === undefined ? {} : { databasePath: options.databasePath },
  );
  let localApiRuntime: LocalApiRuntime | null = null;

  try {
    const sessionToken =
      options.localApi?.sessionToken ??
      process.env.REPLYBOARD_LOCAL_API_SESSION_TOKEN ??
      createLocalApiSessionToken();
    localApiRuntime = await startLocalApiServer({
      completeSlackOAuth: (request) =>
        completeSlackOAuth({
          ...request,
          tokenStore: compositionRoot.slackTokenStore,
        }),
      host: options.localApi?.host ?? process.env.REPLYBOARD_LOCAL_API_HOST ?? '127.0.0.1',
      port: options.localApi?.port ?? getLocalApiPort(),
      sessionToken,
    });

    return {
      localApi: {
        origin: localApiRuntime.origin,
        sessionToken,
      },
      async stop(): Promise<void> {
        await localApiRuntime?.stop();
        await compositionRoot.dispose();
      },
    };
  } catch (error) {
    await localApiRuntime?.stop();
    await compositionRoot.dispose();
    throw error;
  }
}

function getLocalApiPort(): number {
  const configuredPort = process.env.REPLYBOARD_LOCAL_API_PORT;

  if (configuredPort === undefined || configuredPort.length === 0) {
    return 0;
  }

  const port = Number.parseInt(configuredPort, 10);

  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new Error('REPLYBOARD_LOCAL_API_PORT must be an integer between 0 and 65535.');
  }

  return port;
}
