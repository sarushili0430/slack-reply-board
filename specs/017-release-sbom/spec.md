# 017 Release SBOM

## Functional Requirements

### FR-RELEASE-001 Release SBOM generation

The release workflow must generate a software bill of materials for each production release artifact.

### AC-RELEASE-001-01 Release artifact includes SBOM

Given:

- A `vX.Y.Z` release tag triggers the production release workflow.

When:

- The macOS release job packages the app.

Then:

- An SBOM file is generated into the release output directory.
- The SBOM is included in uploaded artifacts and GitHub Release files.
- The release verifier rejects workflows that omit SBOM generation.

## Security Impact

- Release consumers can inspect packaged dependency metadata.
- SBOM generation runs locally in the workflow without adding a new third-party GitHub Action.
