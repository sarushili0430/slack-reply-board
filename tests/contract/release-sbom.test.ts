import { access, readFile } from 'node:fs/promises';

import { describe, expect, test } from 'vitest';

describe('FR-RELEASE-001 Release SBOM generation', () => {
  test('TEST-RELEASE-CONTRACT-001 / AC-RELEASE-001-01: release workflow generates and publishes an SBOM', async () => {
    const releaseWorkflow = await readFile('.github/workflows/release.yml', 'utf8');
    const releaseVerifier = await readFile('scripts/verify-release.mjs', 'utf8');

    await expect(access('scripts/generate-sbom.mjs')).resolves.toBeUndefined();
    expect(releaseWorkflow).toContain(
      'node scripts/generate-sbom.mjs apps/desktop/out/sbom.spdx.json',
    );
    expect(releaseWorkflow).toContain('apps/desktop/out/sbom.spdx.json');
    expect(releaseVerifier).toContain('generate-sbom.mjs');
    expect(releaseVerifier).toContain('sbom.spdx.json');
  });
});
