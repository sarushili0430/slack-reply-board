import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

import { describe, expect, test } from 'vitest';

const execFileAsync = promisify(execFile);

describe('FR-GITFLOW-001 Git flow refs are enforced', () => {
  test('TEST-GITFLOW-CONTRACT-001 / AC-GITFLOW-001-01 / AC-GITFLOW-001-02: branch and release refs are checked in CI', async () => {
    const [packageJsonText, ciWorkflow, packageWorkflow, releaseWorkflow] = await Promise.all([
      readFile('package.json', 'utf8'),
      readFile('.github/workflows/ci.yml', 'utf8'),
      readFile('.github/workflows/package.yml', 'utf8'),
      readFile('.github/workflows/release.yml', 'utf8'),
    ]);
    const packageJson = JSON.parse(packageJsonText) as { scripts?: Record<string, string> };

    expect(packageJson.scripts?.['gitflow:check']).toBe('node scripts/check-git-flow-ref.mjs');
    expect(ciWorkflow).toContain('name: ci / gitflow');
    expect(ciWorkflow).toContain('pnpm gitflow:check');
    expect(packageWorkflow).toContain('pnpm gitflow:check');
    expect(releaseWorkflow).toContain('pnpm gitflow:check');

    await expect(
      execFileAsync(process.execPath, [
        'scripts/check-git-flow-ref.mjs',
        '--branch',
        'feature/024-git-flow-branch-policy',
      ]),
    ).resolves.toBeDefined();
    await expect(
      execFileAsync(process.execPath, [
        'scripts/check-git-flow-ref.mjs',
        '--branch',
        'feature/sync-009-sqlite-migration-snapshot',
      ]),
    ).resolves.toBeDefined();
    await expect(
      execFileAsync(process.execPath, ['scripts/check-git-flow-ref.mjs', '--branch', 'develop']),
    ).rejects.toBeDefined();
    await expect(
      execFileAsync(process.execPath, ['scripts/check-git-flow-ref.mjs', '--tag', 'v1.2.3']),
    ).resolves.toBeDefined();
    await expect(
      execFileAsync(process.execPath, ['scripts/check-git-flow-ref.mjs', '--tag', 'v1.2.3-rc.1']),
    ).rejects.toBeDefined();
  });
});
