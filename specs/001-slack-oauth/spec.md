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

### AC-OAUTH-001-03 Slack OAuth code exchange maps to daemon completion input

Given:

- Slack redirects back with an OAuth authorization code.

When:

- The Slack adapter exchanges the code with Slack `oauth.v2.access`.

Then:

- The adapter sends `client_id`, `client_secret`, `code`, and optional `redirect_uri` as form data.
- The Slack response is validated with Runtime Schema.
- A successful response is mapped to `workspaceId` and `accessToken` for daemon OAuth completion.
- A failed Slack response is rejected without returning a token reference.
