import { createCompositionRoot } from '../composition-root/create-composition-root.js';

export type DaemonRuntime = {
  stop(): Promise<void>;
};

export function startDaemon(): Promise<DaemonRuntime> {
  const compositionRoot = createCompositionRoot();

  return Promise.resolve({
    stop(): Promise<void> {
      return compositionRoot.dispose();
    },
  });
}
