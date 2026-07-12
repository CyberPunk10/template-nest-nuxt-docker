import Joi from 'joi'

export const envValidationSchema = Joi.object({
  PORT: Joi.number().integer().min(1).max(65535).default(3100),
  CORS_ORIGIN_SCHEME_HOST: Joi.string().uri().required(),
  CORS_ORIGIN_PORT: Joi.number().integer().min(1).max(65535).required(),

  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().integer().min(1).max(65535).default(5432),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
})
