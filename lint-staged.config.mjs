import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  'frontend/**/*.{js,jsx,ts,tsx}': (files) => {
    const relFiles = files
      .map((f) => path.relative(path.join(__dirname, 'frontend'), f));
    return [
      `prettier --write ${files.join(' ')}`,
      `node run-eslint.js frontend ${relFiles.join(' ')}`,
    ];
  },
  'backend/**/*.{js,jsx}': (files) => {
    const relFiles = files
      .map((f) => path.relative(path.join(__dirname, 'backend'), f));
    return [
      `prettier --write ${files.join(' ')}`,
      `node run-eslint.js backend ${relFiles.join(' ')}`,
    ];
  },
  '*.{json,md,yml,yaml,css}': ['prettier --write'],
};
