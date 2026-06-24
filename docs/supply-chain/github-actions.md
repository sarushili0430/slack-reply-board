# GitHub Actions Supply Chain

- All `uses:` references must be full 40-character commit SHAs.
- Comments may record the reviewed release tag.
- `pull_request_target` is forbidden.
- Workflow default permission is `contents: read`.
- Release secrets are limited to the `release` GitHub Environment.
- CODEOWNER approval is required for workflow changes.

Run:

```bash
node scripts/check-action-pins.mjs
```
