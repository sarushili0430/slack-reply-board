# Slack Reply Board

Local-first Slack reply board for triage, retrieval, and draft generation.

## Toolchain

- Node.js `24.17.0`
- pnpm `11.9.0`
- TypeScript monorepo with pnpm workspace
- Electron + React desktop app
- Separate Node.js daemon, indexer worker, and Hermes MCP app

## Bootstrap

```bash
pnpm install --frozen-lockfile
pnpm quality
```

Implementation follows `AGENTS.md` and `.specify/memory/constitution.md`.
