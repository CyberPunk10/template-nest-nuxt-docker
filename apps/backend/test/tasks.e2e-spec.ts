import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from './../src/app.module'
import { setupApp } from './../src/setup-app'

describe('TasksController (e2e)', () => {
  let app: INestApplication<App>

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    // Пайпы и фильтр берём из той же функции, что и main.ts — иначе тесты
    // проверяли бы приложение с другой конфигурацией, чем production.
    app = setupApp(moduleFixture.createNestApplication())

    await app.init()
  })

  // Задачи лежат в памяти сервиса, поэтому приложение поднимается заново
  // перед каждым тестом — иначе они протекают между тестами.
  afterEach(async () => {
    await app.close()
  })

  const create = (body: Record<string, unknown>) =>
    request(app.getHttpServer()).post('/tasks').send(body)

  describe('POST /tasks', () => {
    it('создаёт задачу и отдаёт 201', async () => {
      const response = await create({ title: 'Купить кофе' }).expect(201)

      expect(response.body).toMatchObject({ title: 'Купить кофе' })
      expect(response.body.id).toEqual(expect.any(String))
    })

    it('обрезает пробелы по краям title', async () => {
      const response = await create({ title: '  С пробелами  ' }).expect(201)

      expect(response.body.title).toBe('С пробелами')
    })

    it('отклоняет пустой title', () => {
      return create({ title: '' }).expect(400)
    })

    it('отклоняет title из одних пробелов — trim выполняется до проверки', () => {
      return create({ title: '     ' }).expect(400)
    })

    it('отклоняет запрос без title', () => {
      return create({}).expect(400)
    })

    it('отклоняет title длиннее 255 символов', () => {
      return create({ title: 'а'.repeat(256) }).expect(400)
    })

    it('отклоняет description длиннее 2000 символов', () => {
      return create({ title: 'Задача', description: 'д'.repeat(2001) }).expect(400)
    })

    it('отклоняет неизвестные поля — forbidNonWhitelisted', () => {
      return create({ title: 'Задача', hacked: true }).expect(400)
    })

    it('отдаёт ошибку в формате HttpExceptionFilter', async () => {
      const response = await create({ title: '' }).expect(400)

      expect(response.body).toEqual({
        statusCode: 400,
        message: expect.any(Array),
        path: '/tasks',
      })
    })
  })

  describe('GET /tasks', () => {
    it('возвращает пустой список, пока задач нет', () => {
      return request(app.getHttpServer()).get('/tasks').expect(200).expect([])
    })

    it('возвращает созданные задачи', async () => {
      await create({ title: 'Первая' })
      await create({ title: 'Вторая' })

      const response = await request(app.getHttpServer()).get('/tasks').expect(200)

      expect(response.body.map((t: { title: string }) => t.title)).toEqual(['Первая', 'Вторая'])
    })
  })

  describe('PUT /tasks/:id', () => {
    it('обновляет задачу', async () => {
      const { body: task } = await create({ title: 'Было' })

      const response = await request(app.getHttpServer())
        .put(`/tasks/${task.id}`)
        .send({ title: 'Стало' })
        .expect(200)

      expect(response.body.title).toBe('Стало')
    })

    // Регрессия: ValidationPipe с transform: true отдаёт экземпляр DTO,
    // где непереданный title присутствует как undefined. Наивный спред
    // затирал им сохранённое значение — задача оставалась без title.
    it('не затирает поля, которых нет в теле запроса', async () => {
      const { body: task } = await create({ title: 'Было', description: 'Описание' })

      const response = await request(app.getHttpServer())
        .put(`/tasks/${task.id}`)
        .send({ description: 'Новое описание' })
        .expect(200)

      expect(response.body).toMatchObject({ title: 'Было', description: 'Новое описание' })
    })

    it('пустое тело оставляет задачу нетронутой', async () => {
      const { body: task } = await create({ title: 'Без изменений' })

      const response = await request(app.getHttpServer())
        .put(`/tasks/${task.id}`)
        .send({})
        .expect(200)

      expect(response.body.title).toBe('Без изменений')
    })

    it('обрезает пробелы по краям title', async () => {
      const { body: task } = await create({ title: 'Было' })

      const response = await request(app.getHttpServer())
        .put(`/tasks/${task.id}`)
        .send({ title: '  Стало  ' })
        .expect(200)

      expect(response.body.title).toBe('Стало')
    })

    it('отдаёт 404 для несуществующей задачи', () => {
      return request(app.getHttpServer())
        .put('/tasks/3f1e4c9a-0b7d-4e2f-8a11-5c6d7e8f9a0b')
        .send({ title: 'Неважно' })
        .expect(404)
    })

    it('отдаёт 400, если id не UUID — ParseUUIDPipe', () => {
      return request(app.getHttpServer())
        .put('/tasks/не-uuid')
        .send({ title: 'Неважно' })
        .expect(400)
    })
  })

  describe('DELETE /tasks/:id', () => {
    it('удаляет задачу и отдаёт 204', async () => {
      const { body: task } = await create({ title: 'На удаление' })

      await request(app.getHttpServer()).delete(`/tasks/${task.id}`).expect(204)

      await request(app.getHttpServer()).get('/tasks').expect(200).expect([])
    })

    it('отдаёт 404 для несуществующей задачи', () => {
      return request(app.getHttpServer())
        .delete('/tasks/3f1e4c9a-0b7d-4e2f-8a11-5c6d7e8f9a0b')
        .expect(404)
    })

    it('отдаёт 400, если id не UUID — ParseUUIDPipe', () => {
      return request(app.getHttpServer()).delete('/tasks/не-uuid').expect(400)
    })
  })
})
