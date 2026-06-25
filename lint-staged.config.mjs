export default {
  'frontend/**/*.{js,jsx,ts,tsx}': (files) => {
    return [
      `prettier --write ${files.join(' ')}`,
      `npx --prefix frontend eslint --fix --max-warnings=0 ${files.join(' ')}`,
    ];
  },
  'backend/**/*.{js,jsx}': (files) => {
    return [
      `prettier --write ${files.join(' ')}`,
      `npx --prefix backend eslint --fix --max-warnings=0 ${files.join(' ')}`,
    ];
  },
  '*.{json,md,yml,yaml,css}': ['prettier --write'],
};
