import { writeFile } from 'node:fs/promises';

import { app } from 'electron';

export function createPackageSmokeReadySignal(
  env: NodeJS.ProcessEnv = process.env,
): (() => Promise<void>) | undefined {
  const readyFilePath = env.REPLYBOARD_PACKAGE_SMOKE_READY_FILE;

  if (readyFilePath === undefined || readyFilePath.length === 0) {
    return undefined;
  }

  return async () => {
    await writeFile(
      readyFilePath,
      `${JSON.stringify({
        ready: true,
        pid: process.pid,
        timestamp: new Date().toISOString(),
      })}\n`,
    );

    if (env.REPLYBOARD_PACKAGE_SMOKE_QUIT_AFTER_READY === '1') {
      app.quit();
    }
  };
}
