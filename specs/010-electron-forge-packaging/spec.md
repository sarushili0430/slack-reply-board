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

- Packaging is invoked through the `@replyboard/desktop` workspace's Electron Forge CLI.
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

### AC-PACKAGE-001-03 Package workflows use the same explicit output directory

Given:

- Package and release workflows invoke Electron Forge.

When:

- Forge packaging completes on macOS CI.

Then:

- Both workflows pass an explicit `--out=out` argument to Forge packaging.
- Both workflows wait for and smoke test `apps/desktop/out`.
- A successful Forge command cannot be treated as a successful package workflow unless
  `apps/desktop/out` exists and contains at least one packaged artifact.

### AC-PACKAGE-001-04 Package workflows pass Forge arguments directly

Given:

- Package and release workflows invoke Electron Forge through pnpm.

When:

- Platform, architecture, and output arguments are passed to Forge.

Then:

- Workflows use `pnpm exec electron-forge package`.
- Workflows pass `--platform` and `--arch` directly to Forge.
- Workflows pass packager-only `--out=out` after Forge's `--` argument separator.

### AC-PACKAGE-001-05 Package workflows run from the desktop workspace directory

Given:

- Package and release workflows invoke Electron Forge on macOS CI.
- The workflow later smoke tests and uploads `apps/desktop/out`.

When:

- Forge packaging runs.

Then:

- The packaging step uses `working-directory: apps/desktop`.
- The packaging command uses `pnpm exec electron-forge package`.
- The packaging step waits for the relative `out` directory from `apps/desktop`.
- The root-level smoke and upload steps continue to consume `apps/desktop/out`.

## Security Impact

- Release signing and notarization secrets remain provided by the protected `release` environment.
- Signing credentials are consumed only by the packaging process and are not committed to the
  repository.
- Packaged app smoke coverage exercises the signed artifact path without exposing Slack, database,
  filesystem, or daemon internals to the Renderer.
