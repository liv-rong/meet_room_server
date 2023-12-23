import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  Query,
  DefaultValuePipe,
  HttpStatus,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException
} from '@nestjs/common'
import { UserService } from './user.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { RequireLogin, UserInfo } from 'src/decorator/custom.decorator'
import { UserDetailVo } from './vo/user-info.vo'
import { generateParseIntPipe } from 'src/utils'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'

import { UserListVo } from './vo/user-list.vo'

@ApiTags('用户管理模块')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '初始化数据' })
  @Get('init-data')
  async initData() {
    await this.userService.initData()
    return 'done'
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '用户信息' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
    type: UserDetailVo
  })
  @Get('info')
  @RequireLogin()
  async info(@UserInfo('userId') userId: number) {
    const user = await this.userService.findUserDetailById(userId)
    const vo = new UserDetailVo()
    vo.id = user.id
    vo.email = user.email
    vo.username = user.username
    vo.headPic = user.headPic
    vo.phoneNumber = user.phoneNumber
    vo.nickName = user.nickName
    vo.createTime = user.createTime
    vo.isFrozen = user.isFrozen
    return vo
  }

  //修改个人信息接口
  @ApiOperation({ summary: '修改个人信息' })
  @ApiBearerAuth()
  @ApiBody({
    type: UpdateUserDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/不正确'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '更新成功',
    type: String
  })
  @Post(['update/info'])
  @RequireLogin()
  async update(
    @UserInfo('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return await this.userService.update(userId, updateUserDto)
  }

  @ApiOperation({ summary: '冻结用户或者启用' })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'id',
    description: 'userId',
    type: Number
  })
  @ApiBody({
    description: '是否冻结',
    type: Boolean
  })
  @ApiResponse({
    type: String,
    description: 'success'
  })
  @RequireLogin()
  @Post('isFreeze')
  async freeze(
    @Query('id') userId: number,
    @Body() isEnable: { isEnable: boolean }
  ) {
    await this.userService.freezeUserById(userId, isEnable.isEnable)
    return 'success'
  }

  @ApiOperation({ summary: '用户列表接口' })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'page',
    description: '第几页',
    type: Number
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页多少条',
    type: Number
  })
  @ApiQuery({
    name: 'username',
    description: '用户名',
    type: String
  })
  @ApiQuery({
    name: 'nickName',
    description: '昵称',
    type: String
  })
  @ApiQuery({
    name: 'email',
    description: '邮箱地址',
    type: String
  })
  @ApiResponse({
    type: String,
    description: '用户列表'
  })
  @RequireLogin()
  @Get('list')
  async list(
    @Query('page', new DefaultValuePipe(1), generateParseIntPipe('page'))
    page: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(2),
      generateParseIntPipe('pageSize')
    )
    pageSize: number,
    @Query('username') username: string,
    @Query('nickName') nickName: string,
    @Query('email') email: string
  ) {
    const data = await this.userService.findUsers(
      username,
      nickName,
      email,
      page,
      pageSize
    )
    const vo = new UserListVo()
    vo.users = data.users
    vo.totalCount = data.totalCount
    return vo
  }
}
