import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator'
import { UpdateUserDto } from './update-user.dto'

export class PatchUserDto extends OmitType(UpdateUserDto, ['username']) {
  @ApiProperty({ description: '用户名' })
  @MaxLength(50, { message: '最大长度为50' })
  @IsString({ message: '用户名为字符串' })
  username?: string
}
