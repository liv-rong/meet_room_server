import { ApiProperty } from '@nestjs/swagger'

export class AuthUserDto {
  @ApiProperty()
  id: number
  @ApiProperty()
  username: string
  @ApiProperty()
  isAdmin: boolean
  @ApiProperty()
  roles: string[]
  @ApiProperty()
  permissions: string[]
}
