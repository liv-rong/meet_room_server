import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UserDetailVo {
  @ApiProperty()
  id: number

  @ApiProperty()
  username: string

  @ApiPropertyOptional({ description: '昵称' })
  nickName?: string

  @ApiPropertyOptional({ description: '邮箱' })
  email?: string

  @ApiPropertyOptional({ description: '头像' })
  headPic?: string

  @ApiPropertyOptional({ description: '电话' })
  phoneNumber?: string

  @ApiProperty({ description: '是否冻结' })
  isFrozen: boolean

  @ApiProperty({ description: '创建时间' })
  createTime: Date
}
