import { readFile } from 'node:fs/promises';

import { describe, expect, test } from 'vitest';

const packageWorkflowPath = '.github/workflows/package.yml';
const releaseWorkflowPath = '.github/workflows/release.yml';
const forgeConfigPath = 'apps/desktop/forge.config.ts';
const forgePackageScriptPath = 'scripts/package-electron-forge.mjs';

describe('FR-PACKAGE-001 Electron Forge packaging', () => {
  test('TEST-PACKAGE-CONTRACT-001 AC-PACKAGE-001-01: workflows package desktop through Forge only', async () => {
    const [packageWorkflow, releaseWorkflow, forgeConfig] = await Promise.all([
      readFile(packageWorkflowPath, 'utf8'),
      readFile(releaseWorkflowPath, 'utf8'),
      readFile(forgeConfigPath, 'utf8'),
    ]);
    const workflowText = `${packageWorkflow}\n${releaseWorkflow}`;

    expect(workflowText).toContain('node scripts/package-electron-forge.mjs');
    expect(forgeConfig).toContain(
      "import type { ForgeConfig } from '@electron-forge/shared-types'",
    );
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
    const [packageWorkflow, releaseWorkflow, smokeScript] = await Promise.all([
      readFile(packageWorkflowPath, 'utf8'),
      readFile(releaseWorkflowPath, 'utf8'),
      readFile('scripts/smoke-macos-app.mjs', 'utf8'),
    ]);

    expect(packageWorkflow).toContain('pnpm package:smoke');
    expect(releaseWorkflow).toContain('pnpm package:smoke');
    expect(packageWorkflow.indexOf('pnpm package:smoke')).toBeLessThan(
      packageWorkflow.indexOf('actions/upload-artifact@'),
    );
    expect(releaseWorkflow.indexOf('pnpm package:smoke')).toBeLessThan(
      releaseWorkflow.indexOf('actions/upload-artifact@'),
    );
    expect(smokeScript).toContain("import { spawn } from 'node:child_process'");
    expect(smokeScript).not.toContain("from 'playwright'");
    expect(smokeScript).toContain('REPLYBOARD_PACKAGE_SMOKE_MAIN_PROCESS');
    expect(smokeScript).toContain('REPLYBOARD_PACKAGE_SMOKE_READY_FILE');
    expect(smokeScript).toContain('REPLYBOARD_PACKAGE_SMOKE_DAEMON_READY_FILE');
    expect(smokeScript).toContain('REPLYBOARD_PACKAGE_SMOKE_QUIT_AFTER_READY');
    expect(smokeScript).toContain('waitForProcessExit');
  });

  test('TEST-PACKAGE-CONTRACT-003 AC-PACKAGE-001-03: workflows pass Forge an explicit output directory', async () => {
    const [packageWorkflow, releaseWorkflow, releaseVerifier] = await Promise.all([
      readFile(packageWorkflowPath, 'utf8'),
      readFile(releaseWorkflowPath, 'utf8'),
      readFile('scripts/verify-release.mjs', 'utf8'),
    ]);

    expect(packageWorkflow).toContain(
      'node scripts/package-electron-forge.mjs --platform=darwin --arch=arm64 --out=apps/desktop/out',
    );
    expect(releaseWorkflow).toContain(
      'node scripts/package-electron-forge.mjs --platform=darwin --arch=arm64,x64 --out=apps/desktop/out',
    );
    expect(packageWorkflow).toContain('apps/desktop/out');
    expect(releaseWorkflow).toContain('apps/desktop/out');
    expect(releaseVerifier).toContain('--out=apps/desktop/out');
  });

  test('TEST-PACKAGE-CONTRACT-004 AC-PACKAGE-001-05: workflows package from the desktop workspace directory', async () => {
    const [packageWorkflow, releaseWorkflow, forgePackageScript] = await Promise.all([
      readFile(packageWorkflowPath, 'utf8'),
      readFile(releaseWorkflowPath, 'utf8'),
      readFile(forgePackageScriptPath, 'utf8'),
    ]);

    expect(packageWorkflow).toContain(
      'node scripts/package-electron-forge.mjs --platform=darwin --arch=arm64 --out=apps/desktop/out',
    );
    expect(releaseWorkflow).toContain(
      'node scripts/package-electron-forge.mjs --platform=darwin --arch=arm64,x64 --out=apps/desktop/out',
    );
    expect(forgePackageScript).toContain('process.chdir(appDir)');
    expect(forgePackageScript).toContain('outDir');
  });

  test('TEST-PACKAGE-CONTRACT-005 AC-PACKAGE-001-06: workflows package through a verified Forge Core script', async () => {
    const [packageWorkflow, releaseWorkflow, forgePackageScript] = await Promise.all([
      readFile(packageWorkflowPath, 'utf8'),
      readFile(releaseWorkflowPath, 'utf8'),
      readFile(forgePackageScriptPath, 'utf8'),
    ]);

    expect(packageWorkflow).toContain(
      'node scripts/package-electron-forge.mjs --platform=darwin --arch=arm64 --out=apps/desktop/out',
    );
    expect(releaseWorkflow).toContain(
      'node scripts/package-electron-forge.mjs --platform=darwin --arch=arm64,x64 --out=apps/desktop/out',
    );
    expect(forgePackageScript).toContain("await import('@electron-forge/core')");
    expect(forgePackageScript).toContain('await api.package');
    expect(forgePackageScript).toContain('process.chdir(appDir)');
    expect(forgePackageScript).toContain('No .app bundle found');
  });

  test('TEST-PACKAGE-CONTRACT-006 AC-PACKAGE-001-07: workflows isolate the Forge packaging Node runtime', async () => {
    const [packageWorkflow, releaseWorkflow, releaseVerifier] = await Promise.all([
      readFile(packageWorkflowPath, 'utf8'),
      readFile(releaseWorkflowPath, 'utf8'),
      readFile('scripts/verify-release.mjs', 'utf8'),
    ]);

    expect(packageWorkflow).toContain('name: Setup Forge packaging Node.js');
    expect(releaseWorkflow).toContain('name: Setup Forge packaging Node.js');
    expect(packageWorkflow).toContain('node-version: 24.2.0');
    expect(releaseWorkflow).toContain('node-version: 24.2.0');
    expect(packageWorkflow.indexOf('name: Setup Forge packaging Node.js')).toBeLessThan(
      packageWorkflow.indexOf('node scripts/package-electron-forge.mjs'),
    );
    expect(releaseWorkflow.indexOf('name: Setup Forge packaging Node.js')).toBeLessThan(
      releaseWorkflow.indexOf('node scripts/package-electron-forge.mjs'),
    );
    expect(releaseVerifier).toContain('Setup Forge packaging Node.js');
  });
});
