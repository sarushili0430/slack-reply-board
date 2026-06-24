import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

import { describe, expect, test } from 'vitest';

const execFileAsync = promisify(execFile);

describe('FR-LICENSE-001 Dependency licenses are checked in CI', () => {
  test('TEST-LICENSE-CONTRACT-001 / AC-LICENSE-001-01: security workflow runs explicit license policy', async () => {
    const [packageJsonText, workflowText, scriptText] = await Promise.all([
      readFile('package.json', 'utf8'),
      readFile('.github/workflows/security.yml', 'utf8'),
      readFile('scripts/check-license-policy.mjs', 'utf8'),
    ]);
    const packageJson = JSON.parse(packageJsonText) as { scripts?: Record<string, string> };

    expect(packageJson.scripts?.['security:licenses']).toBe(
      'node scripts/check-license-policy.mjs',
    );
    expect(workflowText).toContain('name: security / license-policy');
    expect(workflowText).toContain('pnpm security:licenses');
    expect(scriptText).toContain('allowedLicenses');
    expect(scriptText).toContain('@replyboard/');

    await expect(
      execFileAsync(process.execPath, ['scripts/check-license-policy.mjs']),
    ).resolves.toBeDefined();
  });
});
