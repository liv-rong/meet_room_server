import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger
} from '@nestjs/common'
import { SignupDto } from './dto/signup.dto'
import { RedisService } from 'src/redis/redis.service'
import { Role } from 'src/user/entities/role.entity'
import { User } from 'src/user/entities/user.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Permission } from 'src/user/entities/permission.entity'
import { md5 } from 'src/utils'
import { UserService } from 'src/user/user.service'
import { LoginDto } from './dto/login.dto'
import { LoginVo } from './vo/login.vo'

@Injectable()
export class AuthService {
  private logger = new Logger()

  @InjectRepository(User)
  private userRepository: Repository<User>

  @InjectRepository(Role)
  private roleRepository: Repository<Role>

  @InjectRepository(Permission)
  private permissionRepository: Repository<Permission>

  @Inject(RedisService)
  private redisService: RedisService

  async signup(user: SignupDto) {
    const captcha = await this.redisService.get(`captcha_${user.email}`)

    if (!captcha)
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST)

    if (user.captcha !== captcha)
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST)

    const findUser = await this.userRepository.findOneBy({
      username: user.username
    })

    if (findUser) throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST)

    const { username, password, email, nickName } = user
    const newUser = new User()
    newUser.username = username
    newUser.password = md5(password)
    newUser.email = email
    newUser.nickName = nickName

    try {
      await this.userRepository.save(newUser)
      return '注册成功'
    } catch (e) {
      this.logger.error(e, UserService)
      return '注册失败'
    }
  }

  async login(login: LoginDto) {
    console.log(login, 'useruser')
    const user = await this.userRepository.findOne({
      where: {
        username: login.username
      },
      relations: ['roles', 'roles.permissions']
    })

    console.log(user, 'useruseruseruser')

    if (!user) throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST)

    if (user.password !== md5(login.password))
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST)

    const vo = new LoginVo()

    vo.userInfo = {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      headPic: user.headPic,
      createTime: user.createTime.getTime(),
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission)
          }
        })
        return arr
      }, [])
    }

    return vo
  }
  async findUserById(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId
      },
      relations: ['roles', 'roles.permissions']
    })
    return {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission)
          }
        })
        return arr
      }, [])
    }
  }
}
