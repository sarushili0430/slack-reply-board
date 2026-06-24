# 018 Electron Production DevTools

## Functional Requirements

### FR-ELECTRON-002 Production DevTools disabled

The desktop app must disable Chromium DevTools in production packaged builds.

### AC-ELECTRON-002-01 Packaged main window closes DevTools

Given:

- The Electron app is running as a packaged production build.

When:

- The main window is created or DevTools are opened.

Then:

- DevTools are closed for the main window.
- The Renderer security settings remain `nodeIntegration: false`, `contextIsolation: true`, and
  `sandbox: true`.

## Security Impact

- Production users cannot inspect local Renderer state through DevTools by default.
- Development builds can still use DevTools for debugging.
