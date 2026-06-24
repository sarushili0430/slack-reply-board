import { access, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const workflowText = await readFile('.github/workflows/release.yml', 'utf8');
const errors = [];

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
  'APPLE_SIGNING_IDENTITY',
  'KEYCHAIN_PASSWORD',
  'security import',
  '--osx-sign.identity',
  '--osx-sign.hardenedRuntime=true',
  '--osx-sign.entitlements=apps/desktop/build/entitlements.mac.plist',
  '--osx-notarize.appleId',
  '--osx-notarize.appleIdPassword',
  '--osx-notarize.teamId',
  'shasum -a 256',
  'actions/attest-build-provenance',
  'actions/upload-artifact',
  'softprops/action-gh-release',
];

for (const requiredText of releaseWorkflowRequirements) {
  if (!workflowText.includes(requiredText)) {
    errors.push(`release workflow is missing: ${requiredText}`);
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

if (files.length > 0) {
  if (checksum === undefined) {
    console.error(`No SHA-256 checksum found in ${artifactDirectory}`);
    process.exit(1);
  }

  await access(join(artifactDirectory, checksum));
  console.log(`Release artifact checksum present: ${checksum}`);
}
