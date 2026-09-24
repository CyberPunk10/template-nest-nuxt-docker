import baseConfig from '../../eslint.config.base.js'

export default [
  ...baseConfig,
  {
    rules: {
      // NestJS использует пустые конструкторы для DI — разрешаем
      '@typescript-eslint/no-empty-function': 'off',
      // NestJS модули/контроллеры/провайдеры — классы без членов
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
]
