# 010 Electron Forge Packaging

## Functional Requirements

### FR-PACKAGE-001 Electron Forge is the desktop packaging entrypoint

The desktop application must be packaged through Electron Forge in CI and release automation.

### AC-PACKAGE-001-01 CI and release workflows use Forge packaging

Given:

- The package workflow builds a macOS artifact.
- The release workflow builds signed and notarized macOS artifacts from a `vX.Y.Z` tag.

When:

- Workflow packaging steps are executed.

Then:

- Packaging is invoked through `@replyboard/desktop`'s Electron Forge package script.
- Workflows do not call `electron-packager` directly.
- macOS bundle ID, signing, hardened runtime, entitlements, and notarization are configured in
  `apps/desktop/forge.config.ts`.

### AC-PACKAGE-001-02 Package and release workflows smoke test the packaged app

Given:

- Electron Forge has produced a macOS `.app` bundle.

When:

- Package or release automation completes the Forge packaging step.

Then:

- Automation launches the packaged `.app` with Playwright Electron.
- The smoke verifies the reply board shell renders.
- The smoke verifies the preload API can return the application version.
- The smoke verifies Renderer Node globals remain unavailable.
- The smoke exits the application cleanly before artifact upload or release publication.

## Security Impact

- Release signing and notarization secrets remain provided by the protected `release` environment.
- Signing credentials are consumed only by the packaging process and are not committed to the
  repository.
- Packaged app smoke coverage exercises the signed artifact path without exposing Slack, database,
  filesystem, or daemon internals to the Renderer.
