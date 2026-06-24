# Architecture Boundaries

```text
Domain
  ^
Application / Ports
  ^
Adapters
  ^
Composition Root
  ^
Interface: Electron / MCP / Local API
```

## Apps

- `apps/desktop`: display, notifications, tray, and IPC only.
- `apps/daemon`: composition root and local API host.
- `apps/indexer-worker`: chunking, embedding, reconciliation, and re-indexing.
- `apps/hermes-mcp`: MCP entrypoint that calls application use cases.

## Packages

- `packages/board`: reply board domain and use cases.
- `packages/slack-sync`: Slack sync domain, application, and ports.
- `packages/knowledge`: retrieval and knowledge domain.
- `packages/drafting`: draft version and sendability domain.
- `packages/hermes-harness`: tool execution policies.
- `packages/contracts`: IPC, local API, event, and MCP runtime schemas.
- `packages/adapters/*`: external technology implementations.
