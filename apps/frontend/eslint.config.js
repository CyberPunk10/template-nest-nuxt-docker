import withNuxt from './.nuxt/eslint.config.mjs'

// withNuxt уже включает typescript-eslint и vue-eslint-parser
// Добавляем только наши кастомные правила поверх
export default withNuxt({
  rules: {
    '@stylistic/brace-style': ['error', '1tbs'],
    '@stylistic/quote-props': ['error', 'as-needed'],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      },
    ],
    'no-console': 'off',
    'vue/attribute-hyphenation': 'off',
    'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
    'vue/component-api-style': ['error', ['script-setup']],
    'vue/define-macros-order': ['error', { order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots'] }],
    'vue/max-attributes-per-line': ['error', { singleline: { max: 2 }, multiline: { max: 1 } }],
    'vue/singleline-html-element-content-newline': 'off',
  },
})
