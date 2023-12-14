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

import { EmailService } from 'src/email/email.service'
import { RedisService } from 'src/redis/redis.service'

import { JwtService } from '@nestjs/jwt'
import { RequireLogin, UserInfo } from 'src/custom.decorator'
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
import { FileInterceptor } from '@nestjs/platform-express/multer'
import * as path from 'path'
import { storage } from 'src/my-file-storage'

@ApiTags('用户管理模块')
@Controller('user')
export class UserController {
  @Inject(EmailService)
  private emailService: EmailService

  @Inject(RedisService)
  private redisService: RedisService

  @Inject(JwtService)
  private jwtService: JwtService

  constructor(private readonly userService: UserService) {}

  @Get('init-data')
  async initData() {
    await this.userService.initData()
    return 'done'
  }

  @ApiBearerAuth()
  @ApiOperation({
    description: '用户信息'
  })
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

  //冻结用户或者启用
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
  async freeze(@Query('id') userId: number, @Body() isFreeze: boolean) {
    await this.userService.freezeUserById(userId, isFreeze)
    return 'success'
  }

  //用户列表接口
  @ApiBearerAuth()
  @ApiQuery({
    name: 'pageNo',
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
    console.log('111111')
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

  @ApiOperation({
    description: '上传头像'
  })
  @ApiBody({
    description: '图片'
  })
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads',
      storage: storage,
      limits: {
        fileSize: 1024 * 1024 * 3
      },
      fileFilter(req, file, callback) {
        const extname = path.extname(file.originalname)
        if (['.png', '.jpg', '.gif'].includes(extname)) {
          callback(null, true)
        } else {
          callback(new BadRequestException('只能上传图片'), false)
        }
      }
    })
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('file', file)
    return file?.path
  }
}
