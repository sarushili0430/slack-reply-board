import type { DaemonHealthContract } from '@replyboard/contracts';

export function getDaemonHealth(): DaemonHealthContract {
  return {
    status: 'ok',
    daemonVersion: '0.1.0',
    indexerConnected: false,
    qwenConnected: false,
  };
}
