# 019 Localhost Runtime Bindings

## Functional Requirements

### FR-RUNTIME-001 Local model services stay on loopback

Qwen and Vector Store runtime configuration must reject endpoints that point to non-loopback hosts.

### AC-RUNTIME-001-01 Qwen endpoint is loopback-only

Given:

- The daemon composes a Qwen runtime config.

When:

- The configured Qwen base URL points to a non-loopback host.

Then:

- Config creation fails before the runtime can be used.
- `localhost`, `127.0.0.1`, and `::1` are accepted.

### AC-RUNTIME-001-02 Vector Store endpoint is loopback-only

Given:

- The daemon composes a Vector Store runtime config.

When:

- The configured Vector Store endpoint points to a non-loopback host.

Then:

- Config creation fails before the runtime can be used.
- `localhost`, `127.0.0.1`, and `::1` are accepted.

## Security Impact

- Local AI and retrieval services are not accidentally configured through externally reachable
  network interfaces.
- A malicious or mistaken environment override cannot redirect model or vector traffic to a remote
  host without failing fast.
