# ADR-0003 Branching and Release Flow

## Status

Accepted

## Context

The repository is governed by executable specs, traceability checks, branch protection, release
signing, and notarization. The workflow needs stable release candidates without keeping a long-lived
`develop` branch that can drift from the source of truth.

## Decision

Use a lightweight Git Flow variant:

- `main` is always Green and always releasable.
- `feature/<spec-id>-<short-name>` is the default branch format for implementation work.
- `release/vX.Y.Z` freezes a release candidate and only accepts version, signing, notarization,
  release smoke, and critical release-blocking fixes.
- `hotfix/vX.Y.Z` starts from a released tag for urgent production fixes and must be merged back to
  `main`.
- `vX.Y.Z` tags are the only production release trigger.

Do not create a long-lived `develop` branch. Spec and implementation must converge through pull
requests into `main`.

## Consequences

- Each feature branch should map to one spec task or a tightly related set of tasks.
- Release branches reduce late release churn while keeping `main` as the integration source.
- Hotfixes preserve traceability by returning changes to `main` after the patched release.
- The release workflow must not expose a manual production release path.
