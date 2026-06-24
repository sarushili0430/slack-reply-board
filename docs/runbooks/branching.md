# Branching Runbook

## Branches

- `main`: protected integration branch. It must stay Green and releasable.
- `feature/<spec-id>-<short-name>`: normal implementation branch, for example
  `feature/sync-009-sqlite-migration-snapshot`.
- `release/vX.Y.Z`: release candidate branch.
- `hotfix/vX.Y.Z`: urgent fix branch cut from an existing release tag.
- `vX.Y.Z`: signed and notarized production release tag.

Do not use a long-lived `develop` branch.

## Feature Work

1. Pick one spec task.
2. Create a branch from `main`.
3. Follow SDD and TDD: spec, Red, Green, Refactor, traceability.
4. Open a pull request to `main`.
5. Merge only after required checks and review pass.

```bash
git switch main
git pull --ff-only
git switch -c feature/sync-009-sqlite-migration-snapshot
```

## Release Candidate

1. Create `release/vX.Y.Z` from a Green `main`.
2. Allow only release preparation changes: version, signing, notarization, checksums, smoke fixes,
   and release-blocking defects.
3. Run full CI and package checks on the release branch.
4. Merge the release branch back to `main`.
5. Tag the merged release commit as `vX.Y.Z`.

```bash
git switch main
git pull --ff-only
git switch -c release/v0.1.0
```

## Hotfix

1. Create `hotfix/vX.Y.Z` from the affected release tag.
2. Add the smallest spec and test change that reproduces the problem.
3. Fix with the normal Red, Green, Refactor loop.
4. Tag the hotfix release.
5. Merge the hotfix change back to `main`.

```bash
git switch -c hotfix/v0.1.1 v0.1.0
```

## Production Release

Production releases are created only by pushing a `vX.Y.Z` tag. The release workflow signs and
notarizes the macOS app, generates SHA-256 checksums, emits artifact attestation, and publishes the
GitHub Release.
