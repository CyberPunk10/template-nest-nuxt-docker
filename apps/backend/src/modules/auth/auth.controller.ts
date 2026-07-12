import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { SafeUser } from '../users/users.service'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Регистрация' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409, description: 'Email уже занят' })
  register(@Body() dto: RegisterDto): SafeUser {
    return this.authService.register(dto)
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Вход' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401, description: 'Неверные учётные данные' })
  login(@Body() dto: LoginDto): SafeUser {
    return this.authService.login(dto)
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Выход (заглушка — сессии нет)' })
  logout(): void {}

  @Get('me')
  @ApiOperation({ summary: 'Текущий пользователь' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  me(@Query('userId') userId: string): SafeUser {
    return this.authService.me(userId)
  }
}
