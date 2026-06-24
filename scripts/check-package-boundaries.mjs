import { spawn } from 'node:child_process';

const result = spawn(
  'dependency-cruiser',
  ['--config', '.dependency-cruiser.cjs', 'apps', 'packages'],
  {
    stdio: 'inherit',
    shell: false,
  },
);

result.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
