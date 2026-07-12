import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { Task } from '../../generated/prisma/client'

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Task[]> {
    return this.prisma.task.findMany()
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } })
    if (!task) throw new NotFoundException(`Task ${id} not found`)
    return task
  }

  create(dto: CreateTaskDto): Promise<Task> {
    return this.prisma.task.create({ data: dto })
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    await this.findOne(id)
    return this.prisma.task.update({ where: { id }, data: dto })
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id)
    await this.prisma.task.delete({ where: { id } })
  }
}
