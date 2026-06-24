import { access, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const workflowText = await readFile('.github/workflows/release.yml', 'utf8');
const packageWorkflowText = await readFile('.github/workflows/package.yml', 'utf8');
const forgeConfigText = await readFile('apps/desktop/forge.config.ts', 'utf8');
const errors = [];
const packagingWorkflowText = `${packageWorkflowText}\n${workflowText}`;

if (!/build-macos:[\s\S]*?environment:\s*release/u.test(workflowText)) {
  errors.push('release / macos must use the protected release environment');
}

if (/workflow_dispatch:/u.test(workflowText)) {
  errors.push('release workflow must not allow manual production releases');
}

if (!/tags:\s*\n\s*-\s*'v\*'/u.test(workflowText)) {
  errors.push('release workflow must be triggered by v* tags');
}

const releaseWorkflowRequirements = [
  'APPLE_CERTIFICATE_BASE64',
  'APPLE_CERTIFICATE_PASSWORD',
  'APPLE_ID',
  'APPLE_ID_PASSWORD',
  'APPLE_SIGNING_IDENTITY',
  'APPLE_TEAM_ID',
  'KEYCHAIN_PASSWORD',
  'security import',
  'pnpm package:smoke',
  'shasum -a 256',
  'node scripts/generate-sbom.mjs apps/desktop/out/sbom.spdx.json',
  'actions/attest-build-provenance',
  'actions/upload-artifact',
  'softprops/action-gh-release',
];

for (const requiredText of releaseWorkflowRequirements) {
  if (!workflowText.includes(requiredText)) {
    errors.push(`release workflow is missing: ${requiredText}`);
  }
}

if (!packagingWorkflowText.includes('pnpm --filter @replyboard/desktop package')) {
  errors.push(
    'package and release workflows must invoke Electron Forge through the desktop package script',
  );
}

if (
  !packageWorkflowText.includes('pnpm package:smoke') ||
  !workflowText.includes('pnpm package:smoke')
) {
  errors.push('package and release workflows must smoke test the packaged macOS app');
}

if (packagingWorkflowText.includes('electron-packager')) {
  errors.push('package and release workflows must not call electron-packager directly');
}

const forgeConfigRequirements = [
  "name: 'SlackReplyBoard'",
  "appBundleId = 'com.sarushili0430.slack-reply-board'",
  'osxSign',
  'hardenedRuntime: true',
  "join(projectDir, 'build/entitlements.mac.plist')",
  'osxNotarize',
  'appleIdPassword',
  'teamId',
];

for (const requiredText of forgeConfigRequirements) {
  if (!forgeConfigText.includes(requiredText)) {
    errors.push(`Forge config is missing: ${requiredText}`);
  }
}

if (errors.length > 0) {
  console.error('Release workflow verification failed.');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

const artifactDirectory = process.argv[2] ?? 'out';
const files = await readdir(artifactDirectory).catch(() => []);
const checksum = files.find((file) => file.endsWith('.sha256'));
const sbom = files.find((file) => file === 'sbom.spdx.json');

if (files.length > 0) {
  if (checksum === undefined) {
    console.error(`No SHA-256 checksum found in ${artifactDirectory}`);
    process.exit(1);
  }

  if (sbom === undefined) {
    console.error(`No SBOM found in ${artifactDirectory}`);
    process.exit(1);
  }

  await access(join(artifactDirectory, checksum));
  await access(join(artifactDirectory, sbom));
  console.log(`Release artifact checksum present: ${checksum}`);
  console.log(`Release artifact SBOM present: ${sbom}`);
}
