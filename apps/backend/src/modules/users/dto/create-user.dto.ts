import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class CreateUserDto {
  @ApiProperty({ example: 'Alice' })
  @IsString()
  @MinLength(2)
  name!: string

  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail()
  email!: string
}
