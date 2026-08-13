import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString } from 'class-validator'
import { MaxByteLength } from './max-byte-length.validator'

export class LoginDto {
  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'supersecret' })
  @IsString()
  // bcrypt хэширует только первые 72 байта UTF-8 — см. register.dto.ts
  @MaxByteLength(72)
  password!: string
}
