import Joi from 'joi'

// Переменные с дефолтом помечаем .empty(''): пустое значение в .env или
// в окружении (`FOO=` — обычный способ «сбросить» переменную).
// Пустая строка означает «не задано» — подставится дефолт.
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').empty('').default('production'),
  APP_ENV: Joi.string().valid('development', 'production', 'prod_qa', 'test').empty('').default('production'),

  // Swagger по умолчанию выключен на production и включён в остальных окружениях,
  // но через переменную его можно включить в проде (для диагностики).
  SWAGGER_ENABLED: Joi.boolean().empty('').default(Joi.ref('NODE_ENV', {
    adjust: env => env !== 'production',
  })),

  PORT: Joi.number().integer().min(1).max(65535).empty('').default(3100),

  // Origin фронтенда целиком, как его пришлёт браузер:
  // http://localhost:3200 - в dev
  // http://localhost      - за прокси
  // https://example.com   - в проде
  CORS_ORIGIN: Joi.string().uri().required(),
})
