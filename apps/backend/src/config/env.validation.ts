import Joi from 'joi'

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').default('production'),
  APP_ENV: Joi.string().valid('development', 'production', 'prod_qa', 'test').default('production'),
  PORT: Joi.number().integer().min(1).max(65535).default(3001),
  CORS_ORIGIN: Joi.string().uri().required(),

  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().integer().min(1).max(65535).default(5432),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),

  THROTTLE_TTL: Joi.number().integer().min(1).default(60_000),
  THROTTLE_LIMIT: Joi.number().integer().min(1).default(100),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string()
    .pattern(/^\d+[smhd]$/)
    .default('15m'),
  REFRESH_TOKEN_SECRET: Joi.string().min(32).required(),
  REFRESH_TOKEN_EXPIRES_DAYS: Joi.number().integer().min(1).default(7),

  BCRYPT_ROUNDS: Joi.number().integer().min(4).max(20).default(12),
})
