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
    if (/^\s*pull_request_target\s*:/u.test(line)) {
      violations.push(
        `${relative(process.cwd(), file)}:${index + 1} pull_request_target is forbidden`,
      );
    }

    if (/\b(?:curl|wget)\b.*\|\s*(?:bash|sh)\b/u.test(line)) {
      violations.push(`${relative(process.cwd(), file)}:${index + 1} curl/wget piped to shell`);
    }

    const imageMatch = line.match(/^\s*image:\s*([^#\s]+)/u);

    if (imageMatch !== null && !dockerDigestPattern.test(imageMatch[1])) {
      violations.push(
        `${relative(process.cwd(), file)}:${index + 1} Docker image must be pinned by digest`,
      );
    }

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

  const rootPermissionsLine = lines.findIndex((line) => /^permissions:\s*$/u.test(line));

  if (rootPermissionsLine !== -1) {
    for (let index = rootPermissionsLine + 1; index < lines.length; index += 1) {
      const line = lines[index];

      if (/^\S/u.test(line)) {
        break;
      }

      if (/^\s+\S+:\s*write\b/u.test(line)) {
        violations.push(
          `${relative(process.cwd(), file)}:${index + 1} workflow-level write permission`,
        );
      }
    }
  }
}

if (violations.length > 0) {
  console.error('GitHub Actions security policy violations found.');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exitCode = 1;
}
