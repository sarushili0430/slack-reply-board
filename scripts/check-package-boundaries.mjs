import { spawn } from 'node:child_process';

const result = spawn('dependency-cruiser', ['apps', 'packages'], {
  stdio: 'inherit',
  shell: false,
});

result.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
