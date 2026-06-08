import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class RegisterDto {
  @ApiProperty({ example: 'Alice' })
  @IsString()
  @MinLength(2)
  name!: string

  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'supersecret' })
  @IsString()
  @MinLength(8)
  password!: string
}
