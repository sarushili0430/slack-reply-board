import { daemonHealthSchema, type DaemonHealthContract } from '@replyboard/contracts';

export type DaemonHealthClientOptions = {
  readonly fetch?: typeof fetch;
  readonly origin: string;
  readonly sessionToken: string;
};

export async function fetchDaemonHealth(
  options: DaemonHealthClientOptions,
): Promise<DaemonHealthContract> {
  const fetchImplementation = options.fetch ?? fetch;
  const response = await fetchImplementation(new URL('/health', options.origin), {
    headers: {
      authorization: `Bearer ${options.sessionToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Daemon health check failed with status ${String(response.status)}.`);
  }

  return daemonHealthSchema.parse(await response.json());
}
