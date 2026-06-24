import { execFileSync } from 'node:child_process';

const branchPattern =
  /^(?:main|dependabot\/.+|feature\/(?:[a-z][a-z0-9]*-)?[0-9]{3}-[a-z0-9]+(?:-[a-z0-9]+)*|release\/v[0-9]+\.[0-9]+\.[0-9]+|hotfix\/v[0-9]+\.[0-9]+\.[0-9]+)$/u;
const tagPattern = /^v[0-9]+\.[0-9]+\.[0-9]+$/u;

const explicitRef = parseArguments(process.argv.slice(2));
const ref = explicitRef ?? detectCurrentRef();
const valid = ref.kind === 'branch' ? branchPattern.test(ref.name) : tagPattern.test(ref.name);

if (!valid) {
  console.error(`Invalid Git flow ${ref.kind} ref: ${ref.name}`);
  console.error(
    'Allowed branch refs: main, feature/<spec-id>-<short-name>, release/vX.Y.Z, hotfix/vX.Y.Z',
  );
  console.error('Allowed automation branch refs: dependabot/**');
  console.error('Allowed release tag refs: vX.Y.Z');
  process.exit(1);
}

console.log(`Git flow ${ref.kind} ref accepted: ${ref.name}`);

function parseArguments(args) {
  if (args.length === 0) {
    return undefined;
  }

  if (args.length === 2 && args[0] === '--branch') {
    return {
      kind: 'branch',
      name: args[1],
    };
  }

  if (args.length === 2 && args[0] === '--tag') {
    return {
      kind: 'tag',
      name: args[1],
    };
  }

  console.error('Usage: node scripts/check-git-flow-ref.mjs [--branch <name> | --tag <name>]');
  process.exit(2);
}

function detectCurrentRef() {
  if (typeof process.env.GITHUB_HEAD_REF === 'string' && process.env.GITHUB_HEAD_REF.length > 0) {
    return {
      kind: 'branch',
      name: process.env.GITHUB_HEAD_REF,
    };
  }

  if (
    process.env.GITHUB_REF_TYPE === 'tag' &&
    typeof process.env.GITHUB_REF_NAME === 'string' &&
    process.env.GITHUB_REF_NAME.length > 0
  ) {
    return {
      kind: 'tag',
      name: process.env.GITHUB_REF_NAME,
    };
  }

  if (
    process.env.GITHUB_REF_TYPE === 'branch' &&
    typeof process.env.GITHUB_REF_NAME === 'string' &&
    process.env.GITHUB_REF_NAME.length > 0
  ) {
    return {
      kind: 'branch',
      name: process.env.GITHUB_REF_NAME,
    };
  }

  if (typeof process.env.GITHUB_REF === 'string') {
    if (process.env.GITHUB_REF.startsWith('refs/heads/')) {
      return {
        kind: 'branch',
        name: process.env.GITHUB_REF.slice('refs/heads/'.length),
      };
    }

    if (process.env.GITHUB_REF.startsWith('refs/tags/')) {
      return {
        kind: 'tag',
        name: process.env.GITHUB_REF.slice('refs/tags/'.length),
      };
    }
  }

  const localBranch = execFileSync('git', ['branch', '--show-current'], {
    encoding: 'utf8',
  }).trim();

  if (localBranch.length > 0) {
    return {
      kind: 'branch',
      name: localBranch,
    };
  }

  console.error('Unable to determine the current Git ref.');
  process.exit(2);
}
