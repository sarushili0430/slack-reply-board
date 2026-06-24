# 014 License Policy

## Functional Requirements

### FR-LICENSE-001 Dependency licenses are checked in CI

Third-party dependency licenses must be checked against an explicit allowlist before merge.

### AC-LICENSE-001-01 Security workflow runs the license policy

Given:

- Dependencies are installed from `pnpm-lock.yaml`.

When:

- Security checks run locally or in CI.

Then:

- Third-party package licenses are read from installed package manifests.
- Missing or disallowed third-party licenses fail the check.
- Workspace `@replyboard/*` packages are excluded from third-party license enforcement.
- The security workflow exposes a `security / license-policy` job.

## Security Impact

- Unreviewed copyleft, proprietary, or unknown licenses are rejected before merge.
- License policy changes remain reviewable as code.
