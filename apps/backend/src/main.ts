import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'
import { setupApp } from './setup-app'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(cookieParser())
  const config = app.get(ConfigService)

  setupApp(app)

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN'),
    credentials: true,
  })

  if (config.get<boolean>('SWAGGER_ENABLED')) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle('template-nest-nuxt API').setVersion('1.0').build(),
    )
    SwaggerModule.setup('api/docs', app, document)
  }

  await app.listen(config.get<number>('PORT', 3100))
}
void bootstrap()
