import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from './../src/app.module'

describe('AppController (e2e)', () => {
  let app: INestApplication<App>

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET / отвечает приветствием', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello Nest!')
  })

  it('GET /health отвечает статусом ok', () => {
    return request(app.getHttpServer()).get('/health').expect(200).expect({ status: 'ok' })
  })

  it('GET /dev/config отдаёт настройки для DevPanel', async () => {
    const response = await request(app.getHttpServer()).get('/dev/config').expect(200)

    expect(response.body).toEqual({
      swagger: expect.any(Boolean),
      publicUrl: expect.any(String),
    })
  })

  it('несуществующий маршрут отдаёт 404', () => {
    return request(app.getHttpServer()).get('/no-such-route').expect(404)
  })
})
