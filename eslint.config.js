const { defineConfig, globalIgnores } = require('eslint/config');
const universeNodeConfig = require('eslint-config-universe/flat/node');
const universeSharedTypescriptAnalysisConfig = require('eslint-config-universe/flat/shared/typescript-analysis');
const universeWebConfig = require('eslint-config-universe/flat/web');

module.exports = defineConfig([
  globalIgnores(['build']),
  universeNodeConfig,
  universeWebConfig,
  universeSharedTypescriptAnalysisConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    rules: {
      'no-void': [
        'warn',
        {
          allowAsStatement: true,
        },
      ],
      '@typescript-eslint/no-confusing-void-expression': 'warn',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],
    },
  },
]);
