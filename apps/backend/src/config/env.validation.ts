import Joi from 'joi'

export const envValidationSchema = Joi.object({
  PORT: Joi.number().integer().min(1).max(65535).default(3001),
  CORS_ORIGIN: Joi.string().uri().required(),

  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().integer().min(1).max(65535).default(5432),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
})
