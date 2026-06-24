import { readdir, readFile } from 'node:fs/promises';
import { relative } from 'node:path';

const fullShaPattern = /^[0-9a-f]{40}$/u;
const dockerDigestPattern = /@sha256:[0-9a-f]{64}$/u;
const violations = [];

const workflowFiles = (await readdir('.github/workflows', { withFileTypes: true }))
  .filter((entry) => entry.isFile() && /\.(?:yml|yaml)$/u.test(entry.name))
  .map((entry) => `.github/workflows/${entry.name}`);

for (const file of workflowFiles) {
  const content = await readFile(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const match = line.match(/^\s*uses:\s*([^#\s]+)/u);

    if (match === null) {
      return;
    }

    const reference = match[1];
    const atIndex = reference.lastIndexOf('@');

    if (atIndex === -1) {
      violations.push(`${relative(process.cwd(), file)}:${index + 1} uses has no ref`);
      return;
    }

    const ref = reference.slice(atIndex + 1);

    if (!fullShaPattern.test(ref) && !dockerDigestPattern.test(reference)) {
      violations.push(`${relative(process.cwd(), file)}:${index + 1} ${reference}`);
    }
  });
}

if (violations.length > 0) {
  console.error('GitHub Actions must use full commit SHAs or Docker digests.');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exitCode = 1;
}
