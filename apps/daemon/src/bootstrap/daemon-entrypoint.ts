import { startDaemon, type DaemonRuntime } from './start-daemon.js';

const keepAlive = setInterval(() => undefined, 60_000);
let runtime: DaemonRuntime | null = null;
let stopping = false;

async function shutdown(): Promise<void> {
  if (stopping) {
    return;
  }

  stopping = true;
  clearInterval(keepAlive);

  if (runtime !== null) {
    await runtime.stop();
  }
}

function registerShutdownSignal(signal: NodeJS.Signals): void {
  process.once(signal, () => {
    void shutdown()
      .then(() => {
        process.exit(0);
      })
      .catch(() => {
        process.exit(1);
      });
  });
}

registerShutdownSignal('SIGINT');
registerShutdownSignal('SIGTERM');

runtime = await startDaemon();
