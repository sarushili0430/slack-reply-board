# 023 Electron E2E Smoke

## Functional Requirements

### FR-E2E-001 Electron desktop has an executable launch smoke test

The desktop application must have a Playwright Electron smoke test that proves the built Electron
main process can launch the Renderer with the expected security boundary.

### AC-E2E-001-01 Playwright launches the built desktop app

Given:

- The desktop and daemon packages have been built.
- The E2E test runner starts Electron from the desktop app directory.

When:

- The Playwright Electron smoke test launches the desktop main process.

Then:

- A main window is created and renders the reply board shell.
- The Renderer exposes a stable readiness marker for smoke tests.
- Node globals such as `require` are not available in the Renderer.
- The narrow preload API can return the application version.
- CI runs the E2E smoke test as a required workflow job.

## Security Impact

- The E2E test verifies Renderer isolation from the running Electron app rather than only unit
  testing BrowserWindow options.
- The test exercises the preload boundary without exposing Slack, database, filesystem, or daemon
  internals to the Renderer.
