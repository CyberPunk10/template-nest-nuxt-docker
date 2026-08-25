import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { Task } from './task.entity'

@Injectable()
export class TasksService {
  private readonly tasks: Task[] = []

  findAll(): Task[] {
    return this.tasks
  }

  findOne(id: string): Task {
    const task = this.tasks.find(t => t.id === id)
    if (!task) throw new NotFoundException(`Task ${id} not found`)
    return task
  }

  create(dto: CreateTaskDto): Task {
    const now = new Date()
    const task: Task = { id: crypto.randomUUID(), ...dto, createdAt: now, updatedAt: now }
    this.tasks.push(task)
    return task
  }

  update(id: string, dto: UpdateTaskDto): Task {
    const index = this.tasks.findIndex(t => t.id === id)
    if (index === -1) throw new NotFoundException(`Task ${id} not found`)
    // ValidationPipe с transform: true отдаёт экземпляр DTO, где непереданные
    // необязательные поля присутствуют как undefined. Спред такого объекта
    // затёр бы ими существующие значения, поэтому отбираем только заданные.
    const changes = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined))
    this.tasks[index] = { ...this.tasks[index], ...changes, updatedAt: new Date() }
    return this.tasks[index]
  }

  remove(id: string): void {
    const index = this.tasks.findIndex(t => t.id === id)
    if (index === -1) throw new NotFoundException(`Task ${id} not found`)
    this.tasks.splice(index, 1)
  }
}
