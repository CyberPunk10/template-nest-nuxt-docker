import { Injectable, UnauthorizedException } from '@nestjs/common'
import { SafeUser, UsersService } from '../users/users.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  register(dto: RegisterDto): Promise<SafeUser> {
    return this.usersService.create(dto)
  }

  async login(dto: LoginDto): Promise<SafeUser> {
    const user = await this.usersService.findByEmail(dto.email)
    if (!user || user.password !== dto.password) throw new UnauthorizedException()
    return this.usersService.findOne(user.id)
  }

  me(userId: string): Promise<SafeUser> {
    return this.usersService.findOne(userId)
  }
}
