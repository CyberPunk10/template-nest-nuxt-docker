import withNuxt from './.nuxt/eslint.config.mjs'

// withNuxt уже включает typescript-eslint и vue-eslint-parser
// Добавляем только наши кастомные правила поверх
export default withNuxt({
  rules: {
    '@stylistic/brace-style': ['error', '1tbs'],
    '@stylistic/quote-props': ['error', 'as-needed'],
    'no-console': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'vue/attribute-hyphenation': 'off',
    'vue/max-attributes-per-line': ['error', { singleline: { max: 3 }, multiline: { max: 1 } }],
    'vue/singleline-html-element-content-newline': 'off',
  },
})
