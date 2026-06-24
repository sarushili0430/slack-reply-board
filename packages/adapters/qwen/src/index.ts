import { URL } from 'node:url';

export type QwenRuntimeConfig = {
  readonly baseUrl: string;
  readonly model: string;
};

const qwenLoopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

export function createQwenRuntimeConfig(config: QwenRuntimeConfig): QwenRuntimeConfig {
  let url: URL;

  try {
    url = new URL(config.baseUrl);
  } catch (error) {
    throw new Error('Qwen baseUrl must be a valid URL.', { cause: error });
  }

  if (!qwenLoopbackHosts.has(url.hostname)) {
    throw new Error('Qwen baseUrl must use a loopback host.');
  }

  return config;
}
