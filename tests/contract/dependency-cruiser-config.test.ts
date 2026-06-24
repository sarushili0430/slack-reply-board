import { readFile } from 'node:fs/promises';

import { describe, expect, test } from 'vitest';

describe('FR-ARCH-001 Dependency rules are executable in CI', () => {
  test('TEST-ARCH-CONTRACT-001 / AC-ARCH-001-01: dependency-cruiser enforces architecture boundaries', async () => {
    const [configText, packageJsonText] = await Promise.all([
      readFile('.dependency-cruiser.cjs', 'utf8'),
      readFile('package.json', 'utf8'),
    ]);
    const packageJson = JSON.parse(packageJsonText) as { scripts?: Record<string, string> };

    expect(packageJson.scripts?.['architecture:check']).toContain(
      'dependency-cruiser --config .dependency-cruiser.cjs apps packages',
    );
    expect(configText).toContain('no-circular');
    expect(configText).toContain('renderer-not-to-node-electron-or-data-apis');
    expect(configText).toContain('domain-not-to-adapters-or-technology-sdks');
    expect(configText).toContain('mcp-tools-not-to-direct-data-apis');
    expect(configText).toContain('adapter-not-to-other-adapter');
  });
});
