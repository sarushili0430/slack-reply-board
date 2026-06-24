import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const idDefinitionPattern = /^#{2,}\s+((?:FR|NFR|AC|ADR|TASK|TEST)-[A-Z0-9]+(?:-[A-Z0-9]+)*)\b/gmu;
const unresolvedPattern = /\[NEEDS CLARIFICATION\]|TODO|FIXME/iu;
const ids = new Map();
const duplicateIds = [];
const unresolvedFiles = [];

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(path)));
      continue;
    }

    files.push(path);
  }

  return files;
}

const files = [
  ...(await listFiles('specs')).filter((file) => /\.(?:md|yaml|yml)$/u.test(file)),
  ...(await listFiles('.specify')).filter((file) => /\.md$/u.test(file)),
  'AGENTS.md',
];

for (const file of files) {
  const content = await readFile(file, 'utf8');

  if (unresolvedPattern.test(content)) {
    unresolvedFiles.push(file);
  }

  const matches = content.matchAll(idDefinitionPattern);
  for (const match of matches) {
    const id = match[1];
    const existing = ids.get(id);

    if (existing !== undefined && existing !== file) {
      duplicateIds.push(`${id}: ${existing}, ${file}`);
    }

    ids.set(id, file);
  }
}

if (unresolvedFiles.length > 0) {
  console.error('Unresolved clarification markers found.');
  for (const file of unresolvedFiles) {
    console.error(`- ${file}`);
  }
}

if (duplicateIds.length > 0) {
  console.error('Duplicate spec IDs found across files.');
  for (const duplicateId of duplicateIds) {
    console.error(`- ${duplicateId}`);
  }
}

if (unresolvedFiles.length > 0 || duplicateIds.length > 0) {
  process.exitCode = 1;
}
