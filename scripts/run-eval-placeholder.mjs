const evalName = process.argv[2];

if (evalName === undefined) {
  console.error('Eval name is required.');
  process.exit(1);
}

console.log(
  `Eval dataset registered for ${evalName}. Threshold execution starts with AI features.`,
);
