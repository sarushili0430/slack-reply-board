import { readFile } from 'node:fs/promises';

import { describe, expect, test } from 'vitest';

const packageWorkflowPath = '.github/workflows/package.yml';
const releaseWorkflowPath = '.github/workflows/release.yml';
const forgeConfigPath = 'apps/desktop/forge.config.ts';

describe('FR-PACKAGE-001 Electron Forge packaging', () => {
  test('TEST-PACKAGE-CONTRACT-001 AC-PACKAGE-001-01: workflows package desktop through Forge only', async () => {
    const [packageWorkflow, releaseWorkflow, forgeConfig] = await Promise.all([
      readFile(packageWorkflowPath, 'utf8'),
      readFile(releaseWorkflowPath, 'utf8'),
      readFile(forgeConfigPath, 'utf8'),
    ]);
    const workflowText = `${packageWorkflow}\n${releaseWorkflow}`;

    expect(workflowText).toContain('pnpm --filter @replyboard/desktop exec electron-forge package');
    expect(workflowText).not.toContain('package -- --platform=darwin');
    expect(workflowText).not.toContain('electron-packager');

    expect(forgeConfig).toContain("name: 'SlackReplyBoard'");
    expect(forgeConfig).toContain("'com.sarushili0430.slack-reply-board'");
    expect(forgeConfig).toContain('osxSign');
    expect(forgeConfig).toContain('hardenedRuntime: true');
    expect(forgeConfig).toContain("join(projectDir, 'build/entitlements.mac.plist')");
    expect(forgeConfig).toContain('osxNotarize');
  });

  test('TEST-PACKAGE-CONTRACT-002 AC-PACKAGE-001-02: workflows smoke test packaged macOS app before upload or release', async () => {
    const [packageWorkflow, releaseWorkflow] = await Promise.all([
      readFile(packageWorkflowPath, 'utf8'),
      readFile(releaseWorkflowPath, 'utf8'),
    ]);

    expect(packageWorkflow).toContain('pnpm package:smoke');
    expect(releaseWorkflow).toContain('pnpm package:smoke');
    expect(packageWorkflow.indexOf('pnpm package:smoke')).toBeLessThan(
      packageWorkflow.indexOf('actions/upload-artifact@'),
    );
    expect(releaseWorkflow.indexOf('pnpm package:smoke')).toBeLessThan(
      releaseWorkflow.indexOf('actions/upload-artifact@'),
    );
  });

  test('TEST-PACKAGE-CONTRACT-003 AC-PACKAGE-001-03: workflows pass Forge an explicit output directory', async () => {
    const [packageWorkflow, releaseWorkflow, releaseVerifier] = await Promise.all([
      readFile(packageWorkflowPath, 'utf8'),
      readFile(releaseWorkflowPath, 'utf8'),
      readFile('scripts/verify-release.mjs', 'utf8'),
    ]);

    expect(packageWorkflow).toContain(
      'pnpm --filter @replyboard/desktop exec electron-forge package --platform=darwin --arch=arm64 -- --out=out',
    );
    expect(releaseWorkflow).toContain(
      'pnpm --filter @replyboard/desktop exec electron-forge package --platform=darwin --arch=arm64,x64 -- --out=out',
    );
    expect(packageWorkflow).toContain('apps/desktop/out');
    expect(releaseWorkflow).toContain('apps/desktop/out');
    expect(releaseVerifier).toContain('--out=out');
  });
});
