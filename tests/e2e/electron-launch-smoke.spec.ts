import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { _electron as electron, expect, test } from '@playwright/test';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(currentDirectory, '..', '..');
const desktopDirectory = join(repositoryRoot, 'apps', 'desktop');
const desktopMainEntry = join(desktopDirectory, '.vite', 'build', 'main.js');

type ReplyBoardWindow = Window & {
  readonly replyBoard: {
    getAppVersion(): Promise<string>;
  };
};

test('TEST-E2E-ELECTRON-001 AC-E2E-001-01: launches the Electron desktop shell with an isolated Renderer', async () => {
  const app = await electron.launch({
    args: [desktopMainEntry],
    cwd: desktopDirectory,
    env: {
      ...process.env,
      REPLYBOARD_E2E: '1',
    },
  });

  try {
    const window = await app.firstWindow();

    await expect(window.getByTestId('reply-board-ready')).toBeVisible();
    await expect(window.getByRole('heading', { name: 'Reply Board' })).toBeVisible();
    await expect(window.getByRole('button', { name: 'Sync' })).toBeVisible();

    await expect
      .poll(async () =>
        window.evaluate(() => typeof (globalThis as { readonly require?: unknown }).require),
      )
      .toBe('undefined');

    const version = await window.evaluate(async () => {
      const api = (window as ReplyBoardWindow).replyBoard;

      return api.getAppVersion();
    });

    expect(version).toMatch(/^\d+\.\d+\.\d+/u);
  } finally {
    await app.close();
  }
});
