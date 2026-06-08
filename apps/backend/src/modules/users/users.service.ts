import { Injectable, NotFoundException } from '@nestjs/common'
import { User } from '../../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<User[]> {
    return this.prisma.user.findMany()
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException(`User ${id} not found`)
    return user
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findOne(id)
    return this.prisma.user.update({ where: { id }, data: dto })
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id)
    await this.prisma.user.delete({ where: { id } })
  }
}
