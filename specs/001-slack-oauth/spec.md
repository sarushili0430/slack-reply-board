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

### AC-OAUTH-001-02 Daemon completes OAuth without returning the token

Given:

- The daemon receives a successful Slack OAuth result through its session-protected local API.

When:

- The daemon completes the OAuth connection.

Then:

- Runtime Schema validates the local API request body.
- The access token is stored through the Slack token store port.
- The response contains only `workspaceIdHash` and `keychainAccount`.
- The response does not contain the raw Slack access token.
