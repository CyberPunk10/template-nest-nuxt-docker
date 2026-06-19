import withNuxt from './.nuxt/eslint.config.mjs'

// withNuxt уже включает typescript-eslint и vue-eslint-parser
// Добавляем только наши кастомные правила поверх
export default withNuxt({
  rules: {
    'no-console': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'vue/attribute-hyphenation': 'off',
  },
})
