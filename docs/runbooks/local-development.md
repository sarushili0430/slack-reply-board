# Local Development Runbook

## Requirements

- Node.js `24.17.0`
- pnpm `11.9.0`

## Commands

```bash
pnpm install --frozen-lockfile
pnpm quality:fast
pnpm test:unit
pnpm --filter @replyboard/desktop dev
```

## Expected Boundaries

Renderer code must not import `electron`, `node:*`, Slack SDKs, SQLite, or Vector DB clients.
