# 007 Local API Security

## Functional Requirements

### FR-LOCAL-001 Local API session protection

The daemon local API must reject requests that do not present the current random session token.

### AC-LOCAL-001-01 Bearer token authorization

Given:

- The daemon has generated a local API session token.

When:

- A local API request is authorized.

Then:

- The request is accepted only when it presents `Authorization: Bearer <session_token>`.
- Missing, malformed, or mismatched tokens are rejected.
- The session token conforms to the local API Runtime Schema.

## Security Impact

- The local API is not reachable without the random session token.
- Renderer code must not generate or store the token directly.
