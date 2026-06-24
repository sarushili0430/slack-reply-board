# Release Runbook

Release builds run from the protected `release` GitHub Environment.

Required environment secrets:

- `APPLE_CERTIFICATE_BASE64`: Base64 encoded Developer ID Application `.p12`.
- `APPLE_CERTIFICATE_PASSWORD`: Password for the `.p12` certificate.
- `APPLE_SIGNING_IDENTITY`: Exact `codesign` identity name.
- `APPLE_ID`: Apple Developer account email.
- `APPLE_ID_PASSWORD`: App-specific password for notarization.
- `APPLE_TEAM_ID`: Apple Developer Team ID used for notarization.
- `KEYCHAIN_PASSWORD`: Temporary CI keychain password.

Release tags must use the `v*` pattern. The release workflow verifies the full
quality gate, imports the signing certificate into a temporary keychain, signs
and notarizes the macOS application, emits SHA-256 checksums, creates artifact
attestation, uploads build artifacts, and publishes tagged builds to GitHub
Releases.

Production releases are triggered only by pushing a `vX.Y.Z` tag. Use a
`release/vX.Y.Z` branch to stabilize a release candidate, merge it back to
`main`, and tag the merged commit.
