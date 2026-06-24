# 001 Slack OAuth

## Functional Requirements

### FR-OAUTH-001 Slack OAuth connection

The system must connect a Slack workspace without exposing Slack tokens to the Renderer.

### AC-OAUTH-001-01 Token storage

Given:

- A Slack OAuth exchange succeeds.

When:

- The access token is received.

Then:

- The token is stored in OS Keychain.
- The token is not stored in SQLite.
- The token is not returned to Renderer.
