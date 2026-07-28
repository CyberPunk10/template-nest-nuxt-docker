import Joi from 'joi'

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').default('production'),
  APP_ENV: Joi.string().valid('development', 'production', 'prod_qa', 'test').default('production'),

  PORT: Joi.number().integer().min(1).max(65535).default(3100),
  CORS_ORIGIN_SCHEME_HOST: Joi.string().uri().required(),
  CORS_ORIGIN_PORT: Joi.number().integer().min(1).max(65535).required(),
})
