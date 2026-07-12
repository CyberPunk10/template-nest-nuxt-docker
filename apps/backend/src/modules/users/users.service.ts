import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './user.entity'

export type SafeUser = Omit<User, 'password'>

function toSafeUser({ password: _password, ...safeUser }: User): SafeUser {
  return safeUser
}

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      id: crypto.randomUUID(),
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  findAll(): SafeUser[] {
    return this.users.map(toSafeUser)
  }

  create(dto: CreateUserDto): SafeUser {
    if (this.users.some(u => u.email === dto.email)) {
      throw new ConflictException('Email already in use')
    }
    const now = new Date()
    const user: User = { id: crypto.randomUUID(), ...dto, createdAt: now, updatedAt: now }
    this.users.push(user)
    return toSafeUser(user)
  }

  findOne(id: string): SafeUser {
    const user = this.users.find(u => u.id === id)
    if (!user) throw new NotFoundException(`User ${id} not found`)
    return user
  }

  findByEmail(email: string): User | undefined {
    return this.users.find(u => u.email === email)
  }

  update(id: string, dto: UpdateUserDto): SafeUser {
    const user = this.users.find(u => u.id === id)
    if (!user) throw new NotFoundException(`User ${id} not found`)
    Object.assign(user, dto, { updatedAt: new Date() })
    return toSafeUser(user)
  }

  remove(id: string): void {
    const index = this.users.findIndex(u => u.id === id)
    if (index === -1) throw new NotFoundException(`User ${id} not found`)
    this.users.splice(index, 1)
  }
}
