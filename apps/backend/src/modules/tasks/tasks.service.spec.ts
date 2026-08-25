import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { plainToInstance } from 'class-transformer'
import { UpdateTaskDto } from './dto/update-task.dto'
import { TasksService } from './tasks.service'

describe('TasksService', () => {
  let service: TasksService

  // Хранилище in-memory живёт в самом сервисе, поэтому для каждого теста
  // нужен свежий экземпляр — иначе задачи протекают между тестами.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService],
    }).compile()

    service = module.get<TasksService>(TasksService)
  })

  describe('create', () => {
    it('заполняет id и временные метки', () => {
      const task = service.create({ title: 'Купить кофе' })

      expect(task.title).toBe('Купить кофе')
      expect(task.id).toMatch(/^[0-9a-f-]{36}$/)
      expect(task.createdAt).toBeInstanceOf(Date)
      expect(task.updatedAt).toEqual(task.createdAt)
    })

    it('выдаёт разные id разным задачам', () => {
      const first = service.create({ title: 'Первая' })
      const second = service.create({ title: 'Вторая' })

      expect(first.id).not.toBe(second.id)
    })
  })

  describe('findAll', () => {
    it('возвращает пустой список, пока задач нет', () => {
      expect(service.findAll()).toEqual([])
    })

    it('возвращает задачи в порядке добавления', () => {
      service.create({ title: 'Первая' })
      service.create({ title: 'Вторая' })

      expect(service.findAll().map(t => t.title)).toEqual(['Первая', 'Вторая'])
    })
  })

  describe('findOne', () => {
    it('находит задачу по id', () => {
      const created = service.create({ title: 'Найди меня' })

      expect(service.findOne(created.id)).toEqual(created)
    })

    it('бросает NotFoundException для неизвестного id', () => {
      expect(() => service.findOne('нет-такой')).toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('меняет только переданные поля', () => {
      const created = service.create({ title: 'Было', description: 'Описание' })

      const updated = service.update(created.id, { title: 'Стало' })

      expect(updated.title).toBe('Стало')
      expect(updated.description).toBe('Описание')
    })

    // В бою сервис получает не литерал, а экземпляр DTO от ValidationPipe
    // с transform: true. У такого объекта непереданные необязательные поля
    // присутствуют как undefined — на литерале эта разница не видна,
    // поэтому DTO строим ровно так же, как это делает пайп.
    it('не затирает поля, отсутствующие в DTO от ValidationPipe', () => {
      const created = service.create({ title: 'Было', description: 'Описание' })
      const dto = plainToInstance(UpdateTaskDto, { description: 'Новое описание' })

      const updated = service.update(created.id, dto)

      expect(updated.title).toBe('Было')
      expect(updated.description).toBe('Новое описание')
    })

    it('пустой DTO оставляет поля нетронутыми', () => {
      const created = service.create({ title: 'Было', description: 'Описание' })

      const updated = service.update(created.id, plainToInstance(UpdateTaskDto, {}))

      expect(updated).toMatchObject({ title: 'Было', description: 'Описание' })
    })

    it('сдвигает updatedAt, не трогая createdAt', () => {
      const created = service.create({ title: 'Задача' })
      // Метки ставятся через new Date() — без подмены времени два вызова
      // подряд попадут в одну миллисекунду, и сдвиг будет незаметен.
      jest.useFakeTimers().setSystemTime(created.createdAt.getTime() + 1000)

      const updated = service.update(created.id, { title: 'Изменено' })

      expect(updated.createdAt).toEqual(created.createdAt)
      expect(updated.updatedAt.getTime()).toBeGreaterThan(created.createdAt.getTime())
      jest.useRealTimers()
    })

    it('бросает NotFoundException для неизвестного id', () => {
      expect(() => service.update('нет-такой', { title: 'x' })).toThrow(NotFoundException)
    })
  })

  describe('remove', () => {
    it('удаляет задачу из списка', () => {
      const created = service.create({ title: 'На удаление' })

      service.remove(created.id)

      expect(service.findAll()).toEqual([])
    })

    it('не задевает соседние задачи', () => {
      const first = service.create({ title: 'Остаётся' })
      const second = service.create({ title: 'Удаляется' })

      service.remove(second.id)

      expect(service.findAll()).toEqual([first])
    })

    it('бросает NotFoundException для неизвестного id', () => {
      expect(() => service.remove('нет-такой')).toThrow(NotFoundException)
    })
  })
})
