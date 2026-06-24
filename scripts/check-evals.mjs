import { readFile } from 'node:fs/promises';

import YAML from 'yaml';

const evalName = process.argv[2] ?? 'all';
const evalNames = ['retrieval', 'classification', 'drafting', 'grounding'];
const selectedEvalNames = evalName === 'all' ? evalNames : [evalName];
const errors = [];

if (evalName !== 'all' && !evalNames.includes(evalName)) {
  errors.push(`Unknown eval name: ${evalName}`);
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasNonEmptyString(record, key, location) {
  if (typeof record[key] !== 'string' || record[key].length === 0) {
    errors.push(`${location}: ${key} must be a non-empty string`);
  }
}

function hasStringArray(record, key, location, options = {}) {
  const value = record[key];

  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    errors.push(`${location}: ${key} must be an array of strings`);
    return;
  }

  if (options.nonEmpty === true && value.length === 0) {
    errors.push(`${location}: ${key} must not be empty`);
  }
}

function hasNumber(record, key, location, options = {}) {
  const value = record[key];

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    errors.push(`${location}: ${key} must be a finite number`);
    return;
  }

  if (options.minimum !== undefined && value < options.minimum) {
    errors.push(`${location}: ${key} must be >= ${String(options.minimum)}`);
  }

  if (options.maximum !== undefined && value > options.maximum) {
    errors.push(`${location}: ${key} must be <= ${String(options.maximum)}`);
  }

  if (options.integer === true && !Number.isInteger(value)) {
    errors.push(`${location}: ${key} must be an integer`);
  }
}

async function readYamlRecord(path) {
  const parsed = YAML.parse(await readFile(path, 'utf8'));

  if (!isRecord(parsed)) {
    errors.push(`${path}: expected a YAML mapping`);
    return {};
  }

  return parsed;
}

export async function validateThresholds(evalKind) {
  const path = `evals/${evalKind}/thresholds.yaml`;
  const thresholds = await readYamlRecord(path);

  if (evalKind === 'retrieval') {
    hasNumber(thresholds, 'recallAt10', path, { minimum: 0, maximum: 1 });
    hasNumber(thresholds, 'mrr', path, { minimum: 0, maximum: 1 });
    hasNumber(thresholds, 'forbiddenChunkCount', path, { minimum: 0, integer: true });
    hasNumber(thresholds, 'deletedChunkCount', path, { minimum: 0, integer: true });
    hasNumber(thresholds, 'p95LatencyMs', path, { minimum: 1 });
    return;
  }

  if (evalKind === 'classification') {
    hasNumber(thresholds, 'highRiskAutoDraftFalsePositiveRate', path, {
      minimum: 0,
      maximum: 1,
    });
    hasNumber(thresholds, 'replyRequiredRecall', path, { minimum: 0, maximum: 1 });
    return;
  }

  if (evalKind === 'drafting') {
    hasNumber(thresholds, 'schemaValidityRate', path, { minimum: 0, maximum: 1 });
  }

  if (evalKind === 'grounding') {
    hasNumber(thresholds, 'sourceIdValidityRate', path, { minimum: 0, maximum: 1 });
  }

  hasNumber(thresholds, 'unsupportedClaimsAllowed', path, { minimum: 0, integer: true });
}

export async function validateRetrievalCases() {
  const path = 'evals/retrieval/cases.jsonl';
  const lines = (await readFile(path, 'utf8'))
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const caseIds = new Set();

  if (lines.length === 0) {
    errors.push(`${path}: at least one retrieval case is required`);
  }

  lines.forEach((line, index) => {
    const location = `${path}:${String(index + 1)}`;
    let parsed;

    try {
      parsed = JSON.parse(line);
    } catch {
      errors.push(`${location}: invalid JSON`);
      return;
    }

    if (!isRecord(parsed)) {
      errors.push(`${location}: case must be a JSON object`);
      return;
    }

    hasNonEmptyString(parsed, 'caseId', location);
    hasNonEmptyString(parsed, 'query', location);
    hasStringArray(parsed, 'expectedThreadIds', location, { nonEmpty: true });
    hasStringArray(parsed, 'forbiddenThreadIds', location);

    if (typeof parsed.caseId === 'string') {
      if (caseIds.has(parsed.caseId)) {
        errors.push(`${location}: duplicate caseId ${parsed.caseId}`);
      }

      caseIds.add(parsed.caseId);
    }
  });
}

for (const selectedEvalName of selectedEvalNames) {
  if (selectedEvalName === 'retrieval') {
    await validateRetrievalCases();
  }

  await validateThresholds(selectedEvalName);
}

if (errors.length > 0) {
  console.error('Eval validation failed.');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Eval validation passed: ${selectedEvalNames.join(', ')}`);
