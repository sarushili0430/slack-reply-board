# 024 Git Flow Branch Policy

## Functional Requirements

### FR-GITFLOW-001 Git flow refs are enforced

The repository must enforce the agreed Git flow branch and release tag strategy through executable
checks.

### AC-GITFLOW-001-01 Branch refs use the approved strategy

Given:

- CI runs for a pull request or branch push.

When:

- The current branch ref is checked.

Then:

- `main` is accepted as the integration branch.
- `feature/<spec-id>-<short-name>` branches are accepted for normal implementation work.
- `feature/<context>-<spec-id>-<short-name>` branches are accepted for spec areas such as
  `feature/sync-009-sqlite-migration-snapshot`.
- `release/vX.Y.Z` branches are accepted for release candidate preparation.
- `hotfix/vX.Y.Z` branches are accepted for emergency fixes.
- Dependabot branches are accepted as an automation exception.
- `develop` and unstructured branch names are rejected.

### AC-GITFLOW-001-02 Release tags use exact semantic version refs

Given:

- The release workflow runs for a tag push.

When:

- The current tag ref is checked.

Then:

- Only exact `vX.Y.Z` tags are accepted.
- Partial, floating, branch-like, and prerelease tag names are rejected.
