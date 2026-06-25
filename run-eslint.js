const { spawnSync } = require('child_process');
const path = require('path');

const [,, dir, ...files] = process.argv;

if (!dir || files.length === 0) {
  process.exit(0);
}

const eslintBin = path.join(__dirname, dir, 'node_modules', 'eslint', 'bin', 'eslint.js');

const result = spawnSync('node', [eslintBin, '--fix', '--max-warnings=0', ...files], {
  cwd: path.resolve(dir),
  stdio: 'inherit'
});

process.exit(result.status === null ? 1 : result.status);
