import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Inject,
  Query,
  UnauthorizedException
} from '@nestjs/common'
import { AuthService } from './auth.service'
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { EmailService } from 'src/email/email.service'
import { RedisService } from 'src/redis/redis.service'
import { JwtService } from '@nestjs/jwt'
import { RefreshTokenVo } from './vo/refresh-token.vo'
import { UpdateUserPasswordDto, LoginDto, SignupDto } from './dto'
import { UserInfo } from './vo'

@ApiTags('权限')
@Controller('auth')
export class AuthController {
  @Inject(EmailService)
  private emailService: EmailService

  @Inject(RedisService)
  private redisService: RedisService

  @Inject(JwtService)
  private jwtService: JwtService

  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '注册' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/验证码不正确/用户已存在',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '注册成功/失败',
    type: String
  })
  @Post('signup')
  async signup(@Body() signupData: SignupDto) {
    return await this.authService.signup(signupData)
  }

  @ApiOperation({ summary: '登录' })
  @Post('/login')
  async login(@Body() loginUser: LoginDto) {
    const vo = await this.authService.login(loginUser)
    vo.userInfo
    vo.accessToken = this.authService.generateAccessToken({
      id: vo.userInfo.id,
      username: vo.userInfo.username,
      roles: vo.userInfo.roles,
      permissions: vo.userInfo.permissions,
      isAdmin: vo.userInfo.isAdmin
    })
    vo.refreshToken = this.authService.generateRefreshToken(vo.userInfo.id)
    return vo
  }

  @ApiOperation({ summary: '获取注册邮箱验证码' })
  @ApiQuery({
    name: 'address',
    type: String,
    description: '邮箱地址',
    required: true,
    example: 'xxx@xx.com'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '发送成功',
    type: String
  })
  @Get('register-captcha')
  async captcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8)

    const a = await this.redisService.set(`captcha_${address}`, code, 5 * 60)
    await this.emailService.sendMail({
      to: address,
      subject: '注册验证码',
      html: `<p>你的注册验证码是 ${code}</p>`
    })
    return '发送成功'
  }

  @ApiOperation({ summary: '刷新token' })
  @ApiQuery({
    name: 'refreshToken',
    type: String,
    description: '刷新 token',
    required: true,
    example: 'refreshToken'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'token 已失效，请重新登录'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: RefreshTokenVo
  })
  @Get('refresh-token')
  async refreshToken(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken)

      const user = await this.authService.findUserById(data.userId)

      const vo = new RefreshTokenVo()

      vo.access_token = this.authService.generateAccessToken({
        id: user.id,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions,
        isAdmin: user.isAdmin
      })
      vo.refresh_token = this.authService.generateRefreshToken(user.id)

      return vo
    } catch (e) {
      throw new UnauthorizedException('token 已失效，请重新登录')
    }
  }

  // 发送邮箱验证码的接口
  @ApiOperation({ summary: '更新密码邮箱验证码的接口' })
  @ApiQuery({
    name: 'address',
    description: '邮箱地址',
    type: String
  })
  @ApiResponse({
    type: String,
    description: '发送成功'
  })
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

  @ApiOperation({ summary: '更新密码' })
  @ApiBody({
    type: UpdateUserPasswordDto
  })
  @ApiResponse({
    type: String,
    description: '验证码已失效/不正确'
  })
  @Post(['update_password', 'admin/update_password'])
  async updatePassword(@Body() passwordDto: UpdateUserPasswordDto) {
    await this.authService.updatePassword(passwordDto)
  }
}
