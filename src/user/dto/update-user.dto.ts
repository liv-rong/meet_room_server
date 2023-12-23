import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength
} from 'class-validator'

export class UpdateUserDto {
  @ApiProperty({ description: '用户名' })
  @MaxLength(50, { message: '最大长度为50' })
  @IsString({ message: '用户名为字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string

  @ApiPropertyOptional({ description: '昵称' })
  @MaxLength(50, { message: '最大长度为50' })
  @IsString({ message: '昵称为字符串' })
  @IsOptional()
  nickName?: string

  @ApiPropertyOptional({ description: '邮箱' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '不是合法的邮箱格式' })
  @IsOptional()
  email?: string

  @ApiPropertyOptional({ description: '头像' })
  @MaxLength(50, { message: '最大长度为50' })
  @IsUrl()
  @IsOptional()
  headPic?: string

  @ApiPropertyOptional({ description: '手机号' })
  @MaxLength(50, { message: '最大长度为50' })
  @IsOptional()
  phoneNumber?: string

  @ApiProperty({ description: '是否冻结' })
  @IsBoolean()
  isFrozen: boolean
}
