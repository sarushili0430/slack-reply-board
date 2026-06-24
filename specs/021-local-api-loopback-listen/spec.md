# 021 Local API Loopback Listen

## Functional Requirements

### FR-LOCAL-002 Local API listens only on loopback

The daemon local API must reject TCP listen configuration that binds to non-loopback interfaces.

### AC-LOCAL-002-01 Non-loopback local API hosts are rejected

Given:

- The daemon composes local API listen options.

When:

- The configured host is a non-loopback address or wildcard interface.

Then:

- Config creation fails before the API server can start.
- `localhost`, `127.0.0.1`, and `::1` are accepted.

## Security Impact

- The session-token protected local API is not accidentally exposed to the local network.
- Wildcard host overrides such as `0.0.0.0` fail before a server is started.
