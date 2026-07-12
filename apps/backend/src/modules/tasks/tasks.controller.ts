import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { Task } from './task.entity'
import { TasksService } from './tasks.service'

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: 'Получить все задачи' })
  @ApiResponse({ status: 200 })
  @Get()
  findAll(): Task[] {
    return this.tasksService.findAll()
  }

  @ApiOperation({ summary: 'Создать задачу' })
  @ApiResponse({ status: 201 })
  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateTaskDto): Task {
    return this.tasksService.create(dto)
  }

  @ApiOperation({ summary: 'Обновить задачу' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Задача не найдена' })
  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTaskDto): Task {
    return this.tasksService.update(id, dto)
  }

  @ApiOperation({ summary: 'Удалить задачу' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404, description: 'Задача не найдена' })
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string): void {
    this.tasksService.remove(id)
  }
}
