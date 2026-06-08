import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../prisma/prisma.service'
import { UsersService } from './users.service'

const mockUser = {
  id: 'uuid-1',
  name: 'Alice',
  email: 'alice@example.com',
  passwordHash: 'hash',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const prismaMock = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}

describe('UsersService', () => {
  let service: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prismaMock }],
    }).compile()

    service = module.get<UsersService>(UsersService)
    jest.clearAllMocks()
  })

  it('findAll — возвращает список пользователей', async () => {
    prismaMock.user.findMany.mockResolvedValue([mockUser])
    const result = await service.findAll()
    expect(result).toEqual([mockUser])
    expect(prismaMock.user.findMany).toHaveBeenCalledTimes(1)
  })

  it('findOne — возвращает пользователя по id', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser)
    const result = await service.findOne('uuid-1')
    expect(result).toEqual(mockUser)
  })

  it('findOne — выбрасывает NotFoundException если не найден', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    await expect(service.findOne('uuid-999')).rejects.toThrow(NotFoundException)
  })

  it('update — обновляет пользователя', async () => {
    const updated = { ...mockUser, name: 'Bob' }
    prismaMock.user.findUnique.mockResolvedValue(mockUser)
    prismaMock.user.update.mockResolvedValue(updated)
    const result = await service.update('uuid-1', { name: 'Bob' })
    expect(result.name).toBe('Bob')
  })

  it('update — выбрасывает NotFoundException если не найден', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    await expect(service.update('uuid-999', { name: 'Bob' })).rejects.toThrow(NotFoundException)
  })

  it('remove — удаляет пользователя', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser)
    prismaMock.user.delete.mockResolvedValue(mockUser)
    await expect(service.remove('uuid-1')).resolves.toBeUndefined()
  })

  it('remove — выбрасывает NotFoundException если не найден', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    await expect(service.remove('uuid-999')).rejects.toThrow(NotFoundException)
  })
})
