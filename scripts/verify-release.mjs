import { access, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const artifactDirectory = process.argv[2] ?? 'out';
const files = await readdir(artifactDirectory);
const checksum = files.find((file) => file.endsWith('.sha256'));

if (checksum === undefined) {
  console.error(`No SHA-256 checksum found in ${artifactDirectory}`);
  process.exit(1);
}

await access(join(artifactDirectory, checksum));
console.log(`Release artifact checksum present: ${checksum}`);
