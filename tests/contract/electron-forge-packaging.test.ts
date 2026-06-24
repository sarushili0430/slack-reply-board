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

    expect(workflowText).toContain('pnpm --filter @replyboard/desktop package');
    expect(workflowText).not.toContain('electron-packager');

    expect(forgeConfig).toContain("name: 'SlackReplyBoard'");
    expect(forgeConfig).toContain("'com.sarushili0430.slack-reply-board'");
    expect(forgeConfig).toContain('osxSign');
    expect(forgeConfig).toContain('hardenedRuntime: true');
    expect(forgeConfig).toContain("join(projectDir, 'build/entitlements.mac.plist')");
    expect(forgeConfig).toContain('osxNotarize');
  });
});
