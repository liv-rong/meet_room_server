import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RegisterUserDto } from './dto/auth.dto'
import { User } from './entities/user.entity'
import * as bcryptjs from 'bcryptjs'

@Injectable()
export class UserService {
  private logger = new Logger()

  @InjectRepository(User)
  private userRepository: Repository<User>

  async register(user: RegisterUserDto) {
    const findUser = await this.user.findOne({
      where: { username: signupData.username }
    })
    if (findUser && findUser.username === signupData.username)
      return '用户已存在'
    // 对密码进行加密处理
    signupData.password = bcryptjs.hashSync(signupData.password, 10)
    await this.user.save(signupData)
    return '注册成功'
  }

  // 登录
  async login(loginData: CreateAuthDto) {
    const findUser = await this.user.findOne({
      where: { username: loginData.username }
    })
    // 没有找到
    if (!findUser) return new BadRequestException('用户不存在')

    // 找到了对比密码
    const compareRes: boolean = bcryptjs.compareSync(
      loginData.password,
      findUser.password
    )
    // 密码不正确
    if (!compareRes) return new BadRequestException('密码不正确')
    const payload = { username: findUser.username }

    return {
      access_token: this.JwtService.sign(payload),
      msg: '登录成功'
    }
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user'
  }

  findAll() {
    return `This action returns all user`
  }

  findOne(id: number) {
    return `This action returns a #${id} user`
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`
  }

  remove(id: number) {
    return `This action removes a #${id} user`
  }
}
