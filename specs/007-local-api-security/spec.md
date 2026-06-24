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

### AC-LOCAL-001-02 Health endpoint requires the session token

Given:

- The daemon local API is listening on a loopback interface.
- The daemon has generated a random local API session token.

When:

- The desktop main process requests `GET /health`.

Then:

- Requests without the current `Authorization: Bearer <session_token>` header are rejected.
- Requests with the current session token return a Runtime Schema validated daemon health payload.
- The local API runtime can be stopped cleanly.

## Security Impact

- The local API is not reachable without the random session token.
- Renderer code must not generate or store the token directly.
- The desktop main process can verify daemon readiness without exposing the token to Renderer code.
