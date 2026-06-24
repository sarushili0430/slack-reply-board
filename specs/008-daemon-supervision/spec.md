# 008 Daemon Supervision

## Functional Requirements

### FR-DAEMON-001 Daemon crash supervision

The desktop main process must supervise the separate daemon process and avoid unbounded restart
loops.

### AC-DAEMON-001-01 Maximum restart attempts

Given:

- The daemon process exits unexpectedly.

When:

- The supervisor records daemon exits.

Then:

- The first three unexpected exits request a restart.
- The fourth unexpected exit stops automatic restart.
- An expected shutdown does not request a restart.

### AC-DAEMON-001-02 Desktop hands local API connection settings to daemon

Given:

- The Electron main process starts the daemon as a separate process.
- The desktop main process owns the local API session token.

When:

- The daemon process is spawned.

Then:

- The daemon receives the local API host, port, and session token through process environment.
- The desktop main process keeps the matching local API origin and session token for health checks.
- The session token is not exposed to the Renderer.

## Non-Functional Requirements

### NFR-DAEMON-001 Restart ceiling

The daemon supervisor must restart a crashed daemon at most three times for one crash sequence.
