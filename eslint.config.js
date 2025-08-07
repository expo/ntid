const { defineConfig } = require('eslint/config');
const universeNodeConfig = require('eslint-config-universe/flat/node');
const universeSharedTypescriptAnalysisConfig = require('eslint-config-universe/flat/shared/typescript-analysis');
const universeWebConfig = require('eslint-config-universe/flat/web');

module.exports = defineConfig([
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
    settings: {
      jest: {
        version: 30,
      },
    },
  },
]);
