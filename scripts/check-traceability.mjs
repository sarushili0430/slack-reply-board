import { access, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const errors = [];
const idDefinitionPattern = /^#{2,}\s+((?:FR|NFR|AC|ADR|TASK|TEST)-[A-Z0-9]+(?:-[A-Z0-9]+)*)\b/gmu;
const idOccurrencePattern = /\b((?:FR|NFR|AC|ADR|TASK|TEST)-[A-Z0-9]+(?:-[A-Z0-9]+)*)\b/gu;

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

function stripQuotes(value) {
  return value.replace(/^['"]|['"]$/gu, '');
}

function parseInlineList(value) {
  const trimmed = value.trim();

  if (trimmed === '[]') {
    return [];
  }

  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
    return [stripQuotes(trimmed)].filter((entry) => entry.length > 0);
  }

  return trimmed
    .slice(1, -1)
    .split(',')
    .map((entry) => stripQuotes(entry.trim()))
    .filter((entry) => entry.length > 0);
}

function parseTraceability(content) {
  const parsed = {
    requirement: undefined,
    acceptanceCriteria: [],
    tasks: [],
    tests: [],
    implementation: [],
  };
  let listKey = undefined;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();

    if (trimmed.length === 0 || trimmed.startsWith('#')) {
      continue;
    }

    const scalarMatch = trimmed.match(/^([A-Za-z]+):\s*(.*)$/u);

    if (scalarMatch !== null) {
      const [, key, value] = scalarMatch;

      if (key === 'requirement') {
        parsed.requirement = stripQuotes(value);
        listKey = undefined;
        continue;
      }

      if (key in parsed && Array.isArray(parsed[key])) {
        parsed[key].push(...parseInlineList(value));
        listKey = key;
        continue;
      }

      listKey = undefined;
      continue;
    }

    if (listKey !== undefined && trimmed.startsWith('- ')) {
      parsed[listKey].push(stripQuotes(trimmed.slice(2).trim()));
    }
  }

  return parsed;
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const specFiles = (await listFiles('specs')).filter((file) => /\.(?:md|yaml|yml)$/u.test(file));
const testFiles = [
  ...(await listFiles('packages')).filter((file) => /\.(?:test|spec)\.tsx?$/u.test(file)),
  ...(await listFiles('tests')).filter((file) => /\.(?:test|spec)\.tsx?$/u.test(file)),
];

const definedIds = new Map();
const referencedIds = new Map();

for (const file of specFiles) {
  const content = await readFile(file, 'utf8');

  for (const match of content.matchAll(idDefinitionPattern)) {
    definedIds.set(match[1], file);
  }

  for (const match of content.matchAll(idOccurrencePattern)) {
    referencedIds.set(match[1], file);
  }
}

for (const file of testFiles) {
  const content = await readFile(file, 'utf8');

  for (const match of content.matchAll(idOccurrencePattern)) {
    referencedIds.set(match[1], file);
  }
}

const traceabilityFiles = (await listFiles('specs')).filter((file) =>
  file.endsWith('traceability.yaml'),
);
const tracedRequirements = new Set();
const tracedAcceptanceCriteria = new Set();

for (const file of traceabilityFiles) {
  const content = await readFile(file, 'utf8');
  const parsed = parseTraceability(content);

  if (typeof parsed.requirement !== 'string' || parsed.requirement.length === 0) {
    errors.push(`${file}: missing requirement`);
  } else {
    tracedRequirements.add(parsed.requirement);

    if (!definedIds.has(parsed.requirement) || !parsed.requirement.startsWith('FR-')) {
      errors.push(`${file}: requirement ${parsed.requirement} is not a defined FR`);
    }
  }

  if (parsed.acceptanceCriteria.length === 0) {
    errors.push(`${file}: missing acceptanceCriteria`);
  }

  for (const acceptanceCriterion of parsed.acceptanceCriteria) {
    tracedAcceptanceCriteria.add(acceptanceCriterion);

    if (!definedIds.has(acceptanceCriterion) || !acceptanceCriterion.startsWith('AC-')) {
      errors.push(`${file}: acceptance criterion ${acceptanceCriterion} is not defined`);
    }
  }

  if (parsed.tasks.length === 0) {
    errors.push(`${file}: every traced requirement must have at least one TASK`);
  }

  for (const task of parsed.tasks) {
    if (!definedIds.has(task) || !task.startsWith('TASK-')) {
      errors.push(`${file}: task ${task} is not defined`);
    }
  }

  if (parsed.tests.length === 0) {
    errors.push(`${file}: every traced requirement must have at least one TEST`);
  }

  for (const testId of parsed.tests) {
    if (!testId.startsWith('TEST-') || !referencedIds.has(testId)) {
      errors.push(`${file}: test ${testId} is not referenced by any executable test`);
    }
  }

  if (parsed.implementation.length === 0) {
    errors.push(`${file}: implementation must be a non-empty list`);
  }

  for (const implementationPath of parsed.implementation) {
    if (!(await pathExists(implementationPath))) {
      errors.push(`${file}: implementation path does not exist: ${implementationPath}`);
    }
  }
}

for (const id of definedIds.keys()) {
  if (id.startsWith('FR-') && !tracedRequirements.has(id)) {
    errors.push(`${definedIds.get(id)}: ${id} is not traced by any traceability.yaml`);
  }

  if (id.startsWith('AC-') && !tracedAcceptanceCriteria.has(id)) {
    errors.push(`${definedIds.get(id)}: ${id} is not traced by any traceability.yaml`);
  }
}

if (errors.length > 0) {
  console.error('Traceability check failed.');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
}
