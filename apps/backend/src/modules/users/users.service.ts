import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, User } from '../../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

export type SafeUser = Omit<User, 'password'>

export const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<SafeUser[]> {
    return this.prisma.user.findMany({ select: safeUserSelect })
  }

  async create(dto: CreateUserDto): Promise<SafeUser> {
    try {
      return await this.prisma.user.create({ data: dto, select: safeUserSelect })
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Email already in use')
      }
      throw e
    }
  }

  async findOne(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id }, select: safeUserSelect })
    if (!user) throw new NotFoundException(`User ${id} not found`)
    return user
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async update(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    try {
      return await this.prisma.user.update({ where: { id }, data: dto, select: safeUserSelect })
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') throw new NotFoundException(`User ${id} not found`)
        if (e.code === 'P2002') throw new ConflictException('Email already in use')
      }
      throw e
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id } })
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException(`User ${id} not found`)
      }
      throw e
    }
  }
}
