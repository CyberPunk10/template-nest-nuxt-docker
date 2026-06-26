import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import globals from 'globals'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  stylistic.configs.customize({
    semi: false,
    quotes: 'single',
    indent: 2,
    trailingComma: 'all',
  }),
  {
    rules: {
      '@stylistic/brace-style': ['error', '1tbs'],
      '@stylistic/quote-props': ['error', 'as-needed'],
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['scripts/**/*.mjs', 'scripts/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
)
