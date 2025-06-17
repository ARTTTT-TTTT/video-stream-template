module.exports = {
  'client/**/*.{js,ts,jsx,tsx}': ['pnpm format:client', 'pnpm lint:client'],
  'server/**/*.py': ['pnpm format:server', 'pnpm lint:server'],
  '*.{js,json,md}': 'prettier -w --ignore-unknown',
};
