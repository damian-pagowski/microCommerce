const { ESLint } = require('eslint');

module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
    rules: {
      // Example rules: Adjust as needed
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
    },
  },
];