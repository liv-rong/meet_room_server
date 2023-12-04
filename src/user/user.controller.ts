import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  Query,
  UnauthorizedException,
  ParseIntPipe,
  BadRequestException,
  DefaultValuePipe
} from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { RegisterUserDto } from './dto/auth.dto'
import { EmailService } from 'src/email/email.service'
import { RedisService } from 'src/redis/redis.service'
import { LoginUserDto } from './dto/login-user.dto'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { RequireLogin, UserInfo } from 'src/custom.decorator'
import { UserDetailVo } from './vo/user-info.vo'
import { UpdateUserPasswordDto } from './dto/update-user-password.dto'
import { generateParseIntPipe } from 'src/utils'

@Controller('user')
export class UserController {
  @Inject(EmailService)
  private emailService: EmailService

  @Inject(RedisService)
  private redisService: RedisService

  @Inject(JwtService)
  private jwtService: JwtService

  @Inject(ConfigService)
  private configService: ConfigService

  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser)
  }

  @Get('register-captcha')
  async captcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8)

    await this.redisService.set(`captcha_${address}`, code, 5 * 60)

    await this.emailService.sendMail({
      to: address,
      subject: '注册验证码',
      html: `<p>你的注册验证码是 ${code}</p>`
    })
    return '发送成功'
  }

  @Get('init-data')
  async initData() {
    await this.userService.initData()
    return 'done'
  }

  @Post('/login')
  async userLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, false)
    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m'
      }
    )

    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expres_time') || '7d'
      }
    )
    return vo
  }

  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, true)
    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m'
      }
    )

    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expres_time') || '7d'
      }
    )
    return vo
  }

  @Get('admin/refresh')
  async adminRefresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken)

      const user = await this.userService.findUserById(data.userId, true)

      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          roles: user.roles,
          permissions: user.permissions
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m'
        }
      )

      const refresh_token = this.jwtService.sign(
        {
          userId: user.id
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expres_time') || '7d'
        }
      )

      return {
        access_token,
        refresh_token
      }
    } catch (e) {
      throw new UnauthorizedException('token 已失效，请重新登录')
    }
  }

  @Get('refresh')
  async userRefresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken)

      const user = await this.userService.findUserById(data.userId, false)

      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          roles: user.roles,
          permissions: user.permissions
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m'
        }
      )

      const refresh_token = this.jwtService.sign(
        {
          userId: user.id
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expres_time') || '7d'
        }
      )

      return {
        access_token,
        refresh_token
      }
    } catch (e) {
      throw new UnauthorizedException('token 已失效，请重新登录')
    }
  }

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

  // 更新密码的接口
  @Post(['update_password', 'admin/update_password'])
  @RequireLogin()
  async updatePassword(
    @UserInfo('userId') userId: number,
    @Body() passwordDto: UpdateUserPasswordDto
  ) {
    console.log(passwordDto)
    await this.userService.updatePassword(userId, passwordDto)
  }

  // 发送邮箱验证码的接口
  @Get('update_password/captcha')
  async updatePasswordCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8)

    await this.redisService.set(
      `update_password_captcha_${address}`,
      code,
      10 * 60 * 60
    )

    await this.emailService.sendMail({
      to: address,
      subject: '更改密码验证码',
      html: `<p>你的更改密码验证码是 ${code}</p>`
    })
    return '发送成功'
  }

  //修改个人信息接口
  @Post(['update', 'admin/update'])
  @RequireLogin()
  async update(
    @UserInfo('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return await this.userService.update(userId, updateUserDto)
  }

  //更新验证码
  @Get('update/captcha')
  async updateCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8)

    await this.redisService.set(
      `update_user_captcha_${address}`,
      code,
      10 * 60 * 60
    )

    await this.emailService.sendMail({
      to: address,
      subject: '更改用户信息验证码',
      html: `<p>你的验证码是 ${code}</p>`
    })
    return '发送成功'
  }

  //冻结用户
  @Get('freeze')
  async freeze(@Query('id') userId: number) {
    await this.userService.freezeUserById(userId)
    return 'success'
  }

  //用户列表接口
  @Get('list')
  async list(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageNo: number,

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
    return await this.userService.findUsers(
      username,
      nickName,
      email,
      pageNo,
      pageSize
    )
  }
}
