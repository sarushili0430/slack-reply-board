# 012 Architecture Boundary Checks

## Functional Requirements

### FR-ARCH-001 Dependency rules are executable in CI

The repository must reject forbidden dependency directions and circular dependencies through the
architecture check.

### AC-ARCH-001-01 Dependency cruiser enforces package boundaries

Given:

- Source code imports another module.

When:

- `pnpm architecture:check` runs.

Then:

- Circular dependencies are rejected.
- Renderer code cannot import Node.js, Electron, Slack SDK, or database APIs.
- Domain code cannot import adapters or external technology SDKs.
- MCP tool handlers cannot import Slack, SQLite, Vector DB, or database APIs directly.
- One adapter cannot depend on another adapter.

## Security Impact

- Privileged APIs remain behind preload, daemon, application ports, or composition roots.
- Architecture drift is rejected before merge.
