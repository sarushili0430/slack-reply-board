import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import YAML from 'yaml';

const errors = [];
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

const traceabilityFiles = (await listFiles('specs')).filter((file) =>
  file.endsWith('traceability.yaml'),
);

for (const file of traceabilityFiles) {
  const content = await readFile(file, 'utf8');
  const parsed = YAML.parse(content);

  if (typeof parsed?.requirement !== 'string') {
    errors.push(`${file}: missing requirement`);
  }

  if (!Array.isArray(parsed?.acceptanceCriteria) || parsed.acceptanceCriteria.length === 0) {
    errors.push(`${file}: missing acceptanceCriteria`);
  }

  if (!Array.isArray(parsed?.tests) || parsed.tests.length === 0) {
    errors.push(`${file}: every traced requirement must have at least one TEST`);
  }

  if (!Array.isArray(parsed?.implementation)) {
    errors.push(`${file}: implementation must be a list`);
  }
}

if (errors.length > 0) {
  console.error('Traceability check failed.');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
}
