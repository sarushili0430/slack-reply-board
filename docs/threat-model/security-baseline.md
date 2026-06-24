# Security Baseline

## Secrets

- Slack tokens are stored in OS Keychain.
- Tokens must not be stored in SQLite, Renderer state, logs, or prompts.

## Electron

- `nodeIntegration: false`
- `contextIsolation: true`
- Renderer sandbox enabled
- Preload exposes only limited typed APIs
- Arbitrary URLs are not displayed inside Electron

## MCP

- Slack posting tools are not exposed.
- Tool calls are allowlisted.
- Direct DB access from MCP tools is forbidden.

## Logging

Normal logs must not contain Slack text, Draft text, tokens, DM names, file bodies, full prompts, or
raw Qwen input.
