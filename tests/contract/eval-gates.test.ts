import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { describe, expect, test } from 'vitest';

const execFileAsync = promisify(execFile);

describe('FR-EVAL-001 AI quality gates are executable', () => {
  test('TEST-EVAL-CONTRACT-001 / AC-EVAL-001-01: eval gates validate datasets and run in quality and CI', async () => {
    const [packageJsonText, ciWorkflowText, evalScriptText] = await Promise.all([
      readFile('package.json', 'utf8'),
      readFile('.github/workflows/ci.yml', 'utf8'),
      readFile('scripts/check-evals.mjs', 'utf8'),
    ]);
    const packageJson = JSON.parse(packageJsonText) as { scripts?: Record<string, string> };

    expect(packageJson.scripts?.['eval:retrieval']).toBe('node scripts/check-evals.mjs retrieval');
    expect(packageJson.scripts?.['eval:classification']).toBe(
      'node scripts/check-evals.mjs classification',
    );
    expect(packageJson.scripts?.['eval:drafting']).toBe('node scripts/check-evals.mjs drafting');
    expect(packageJson.scripts?.['eval:grounding']).toBe('node scripts/check-evals.mjs grounding');
    expect(packageJson.scripts?.quality).toContain('pnpm eval');

    expect(ciWorkflowText).toContain('name: ci / eval-retrieval');
    expect(ciWorkflowText).toContain('name: ci / eval-classification');
    expect(ciWorkflowText).toContain('name: ci / eval-drafting');
    expect(ciWorkflowText).toContain('name: ci / eval-grounding');

    expect(evalScriptText).toContain('validateRetrievalCases');
    expect(evalScriptText).toContain('validateThresholds');
    expect(evalScriptText).not.toContain('placeholder');

    await expect(
      execFileAsync(process.execPath, ['scripts/check-evals.mjs', 'retrieval']),
    ).resolves.toBeDefined();
  });
});
