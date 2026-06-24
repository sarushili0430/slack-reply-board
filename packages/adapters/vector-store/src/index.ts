import { URL } from 'node:url';

export type VectorStoreConfig = {
  readonly endpoint: string;
  readonly indexVersion: string;
};

const vectorStoreLoopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

export function createVectorStoreConfig(config: VectorStoreConfig): VectorStoreConfig {
  let url: URL;

  try {
    url = new URL(config.endpoint);
  } catch (error) {
    throw new Error('Vector Store endpoint must be a valid URL.', { cause: error });
  }

  if (!vectorStoreLoopbackHosts.has(url.hostname)) {
    throw new Error('Vector Store endpoint must use a loopback host.');
  }

  return config;
}
