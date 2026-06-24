import { beforeEach, describe, expect, test, vi } from 'vitest';

type BrowserWindowOptions = {
  readonly webPreferences?: {
    readonly contextIsolation?: boolean;
    readonly nodeIntegration?: boolean;
    readonly sandbox?: boolean;
  };
};

type WindowOpenHandler = (details: { readonly url: string }) => { readonly action: 'deny' };
type NavigationEvent = {
  preventDefault(): void;
};
type NavigationHandler = (event: NavigationEvent, url: string) => void;

class FakeBrowserWindow {
  static instances: FakeBrowserWindow[] = [];

  readonly loadFile = vi.fn(() => Promise.resolve());
  readonly loadURL = vi.fn(() => Promise.resolve());
  readonly once = vi.fn();
  readonly show = vi.fn();
  readonly webContents = {
    on: vi.fn((eventName: string, handler: NavigationHandler) => {
      if (eventName === 'will-navigate') {
        this.navigationHandler = handler;
      }
    }),
    setWindowOpenHandler: vi.fn((handler: WindowOpenHandler) => {
      this.windowOpenHandler = handler;
    }),
  };
  navigationHandler: NavigationHandler | null = null;
  windowOpenHandler: WindowOpenHandler | null = null;

  constructor(readonly options: BrowserWindowOptions) {
    FakeBrowserWindow.instances.push(this);
  }
}

function getCreatedWindow(): FakeBrowserWindow {
  const window = FakeBrowserWindow.instances[0];

  if (window === undefined) {
    throw new Error('Expected a BrowserWindow to be created.');
  }

  return window;
}

describe('FR-ELECTRON-001 Renderer is isolated from Node and arbitrary navigation', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    FakeBrowserWindow.instances = [];
    vi.stubGlobal('MAIN_WINDOW_VITE_DEV_SERVER_URL', undefined);
    vi.stubGlobal('MAIN_WINDOW_VITE_NAME', 'main_window');
  });

  test('TEST-ELECTRON-UNIT-001 / AC-ELECTRON-001-01: main window denies arbitrary renderer navigation', async () => {
    vi.doMock('electron', () => ({ BrowserWindow: FakeBrowserWindow }));

    const { createMainWindow } = await import('./create-main-window.js');

    await createMainWindow();

    const mainWindow = getCreatedWindow();
    expect(mainWindow.options.webPreferences).toMatchObject({
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    });
    expect(mainWindow.windowOpenHandler?.({ url: 'https://example.com' })).toEqual({
      action: 'deny',
    });

    const externalNavigationEvent = { preventDefault: vi.fn() };
    mainWindow.navigationHandler?.(externalNavigationEvent, 'https://example.com');

    expect(externalNavigationEvent.preventDefault).toHaveBeenCalledTimes(1);

    const fileNavigationEvent = { preventDefault: vi.fn() };
    mainWindow.navigationHandler?.(
      fileNavigationEvent,
      'file:///Applications/SlackReplyBoard/index.html',
    );

    expect(fileNavigationEvent.preventDefault).not.toHaveBeenCalled();
  });
});
