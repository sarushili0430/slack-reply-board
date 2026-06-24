export type LocalApiListenOptions = {
  readonly host: string;
  readonly port: number;
};

const localApiLoopbackHosts = new Set(['localhost', '127.0.0.1', '::1']);

export function createLocalApiListenOptions(options: LocalApiListenOptions): LocalApiListenOptions {
  if (!localApiLoopbackHosts.has(options.host)) {
    throw new Error('Local API host must use a loopback interface.');
  }

  return options;
}
