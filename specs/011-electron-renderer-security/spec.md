# 011 Electron Renderer Security

## Functional Requirements

### FR-ELECTRON-001 Renderer is isolated from Node and arbitrary navigation

The desktop Renderer must run with Electron security boundaries and must not display arbitrary URLs
inside the application window.

### AC-ELECTRON-001-01 Main window enforces Renderer isolation and navigation restrictions

Given:

- The desktop main process creates the main BrowserWindow.

When:

- The Renderer is loaded or attempts to open or navigate to another URL.

Then:

- `nodeIntegration` is disabled.
- `contextIsolation` is enabled.
- Renderer sandboxing is enabled.
- New windows are denied.
- Navigation outside the packaged file URL or development server origin is prevented.

## Security Impact

- Slack tokens and local privileged APIs remain inaccessible to untrusted Renderer content.
- External links must be handled outside this window by a separately reviewed flow.
