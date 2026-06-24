# Tasks

## TASK-DAEMON-001 Restart policy ceiling

Target spec:

- FR-DAEMON-001
- AC-DAEMON-001-01
- NFR-DAEMON-001

### Red

- [x] Add `TEST-DAEMON-UNIT-001`.
- [x] Confirm desktop has no daemon restart policy.

### Green

- [x] Add a daemon restart policy with a default maximum of three restarts.
- [x] Restart only unexpected daemon exits.
- [x] Stop restarting after the third unexpected exit.

### Refactor

- [x] Keep restart-count policy separate from process-spawn mechanics.

### Verification

- [x] Unit Test

## TASK-DAEMON-002 Supervisor restart orchestration

Target spec:

- FR-DAEMON-001
- AC-DAEMON-001-01
- NFR-DAEMON-001

### Red

- [x] Add `TEST-DAEMON-UNIT-002`.
- [x] Confirm desktop has no supervisor that restarts daemon processes through the restart policy.

### Green

- [x] Start the daemon process through an injected process runner.
- [x] Restart the daemon after unexpected exits while the policy allows it.
- [x] Stop restarting after the policy reaches the restart ceiling.

### Refactor

- [x] Keep process orchestration separate from restart-count policy.

### Verification

- [x] Unit Test

## TASK-DAEMON-003 Electron main daemon lifecycle wiring

Target spec:

- FR-DAEMON-001
- AC-DAEMON-001-01
- NFR-DAEMON-001

### Red

- [x] Add `TEST-DAEMON-UNIT-003`.
- [x] Add `TEST-DAEMON-UNIT-004`.
- [x] Confirm Electron lifecycle does not start or stop the daemon supervisor.
- [x] Confirm no Node daemon process starter exists.

### Green

- [x] Start the daemon supervisor before creating the first main window.
- [x] Stop the daemon supervisor when Electron quits.
- [x] Spawn the daemon entrypoint as a separate Node-compatible process.
- [x] Add a daemon entrypoint that keeps the daemon runtime alive until shutdown.

### Refactor

- [x] Keep Electron lifecycle hooks separate from child process mechanics.

### Verification

- [x] Unit Test
- [x] Quality
