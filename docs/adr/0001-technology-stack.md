# ADR-0001 Technology Stack

## Status

Accepted

## Context

The product combines Electron UI, local daemon orchestration, Slack sync, local RAG, Qwen, and
Hermes MCP. The codebase needs clear package ownership and repeatable supply-chain controls.

## Decision

- Use a TypeScript monorepo with pnpm workspace.
- Pin Node.js to `24.17.0` and pnpm to `11.9.0`.
- Use Electron + React for the desktop app and Electron Forge for packaging.
- Run backend work in a separate Node.js daemon.
- Use Zod for runtime schemas.
- Use Vitest, Playwright Electron, Prettier, ESLint Flat Config, Lefthook, GitHub Actions, and
  dependency-cruiser.

## Consequences

- UI, daemon, adapters, domain packages, and MCP boundaries are independently testable.
- GitHub Actions and pnpm install behavior are subject to explicit supply-chain policy.
- Release signing and notarization require protected GitHub Environment secrets.
