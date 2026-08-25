import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'

describe('AppController', () => {
  // Контроллер читает конфиг, но поднимать ради этого ConfigModule и парсить
  // .env не нужно — подменяем ConfigService заглушкой с нужными значениями.
  async function createController(env: Record<string, unknown>) {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          // Настоящий ConfigService.get принимает второй аргумент — значение
          // по умолчанию. Заглушка повторяет эту сигнатуру, иначе тест
          // разошёлся бы с боевым поведением, как только код начнёт её
          // использовать.
          useValue: {
            get: (key: string, defaultValue?: unknown) => env[key] ?? defaultValue,
          },
        },
      ],
    }).compile()

    return module.get<AppController>(AppController)
  }

  describe('health', () => {
    it('возвращает статус ok', async () => {
      const controller = await createController({})

      expect(controller.health()).toEqual({ status: 'ok' })
    })
  })

  describe('dev/config', () => {
    it('в dev отдаёт собственный адрес бэкенда', async () => {
      const controller = await createController({
        NODE_ENV: 'development',
        SWAGGER_ENABLED: true,
        PORT: 3100,
      })

      expect(controller.devConfig()).toEqual({
        swagger: true,
        publicUrl: 'http://localhost:3100',
      })
    })

    it('в production отдаёт пустой publicUrl — бэкенд спрятан за прокси', async () => {
      const controller = await createController({
        NODE_ENV: 'production',
        SWAGGER_ENABLED: false,
        PORT: 3100,
      })

      expect(controller.devConfig()).toEqual({ swagger: false, publicUrl: '' })
    })

    it('считает swagger выключенным, если значение не задано', async () => {
      const controller = await createController({ NODE_ENV: 'development', PORT: 3100 })

      expect(controller.devConfig().swagger).toBe(false)
    })
  })
})
