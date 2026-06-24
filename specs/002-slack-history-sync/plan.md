# Technical Plan

## Target Requirements

- FR-SYNC-001

## Packages

- Domain: `packages/slack-sync/src/domain`
- Application: `packages/slack-sync/src/application`
- Ports: `packages/slack-sync/src/ports`
- Adapters: `packages/adapters/slack`, `packages/adapters/sqlite`
- Composition Root: `apps/daemon/src/composition-root`
- Interface: Local API and Electron IPC in later tasks

## Dependency Direction

`slack-sync` defines ports and use cases. Slack and SQLite adapters implement contracts outside the
domain package. The daemon composition root instantiates concrete adapters.

## Verification

- Unit: idempotent event handling.
- Contract: Slack event fixture to contract schema.
- Integration: SQLite uniqueness and outbox transaction.
- Acceptance: duplicate event does not create duplicate cards or index jobs.
