import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger
} from '@nestjs/common'

import { User } from './entities/user.entity'
import { RedisService } from 'src/redis/redis.service'
import { md5 } from 'src/utils'
import { InjectRepository } from '@nestjs/typeorm'
import { Like, Repository } from 'typeorm'
import { Role } from './entities/role.entity'
import { Permission } from './entities/permission.entity'

import { UpdateUserPasswordDto } from '../auth/dto/update-user-password.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { CreateUserDto, PatchUserDto } from './dto'

@Injectable()
export class UserService {
  private logger = new Logger()

  @InjectRepository(User)
  private userRepository: Repository<User>

  @InjectRepository(Role)
  private roleRepository: Repository<Role>

  @InjectRepository(Permission)
  private permissionRepository: Repository<Permission>

  @Inject(RedisService)
  private redisService: RedisService

  async initData() {
    const user1 = new User()
    user1.username = 'admin'
    user1.password = md5('123456')
    user1.email = '1512501934@qq.com'
    user1.isAdmin = true
    user1.nickName = 'Upwards'
    user1.phoneNumber = '15836819293'

    const user2 = new User()
    user2.username = 'Ivy'
    user2.password = md5('123456')
    user2.email = 'yy@yy.com'
    user2.nickName = 'Ivy'

    const role1 = new Role()
    role1.name = '管理员'

    const role2 = new Role()
    role2.name = '普通用户'

    const permission1 = new Permission()
    permission1.code = 'ccc'
    permission1.description = '访问 ccc 接口'

    const permission2 = new Permission()
    permission2.code = 'ddd'
    permission2.description = '访问 ddd 接口'

    user1.roles = [role1]
    user2.roles = [role2]

    role1.permissions = [permission1, permission2]
    role2.permissions = [permission1]

    await this.permissionRepository.save([permission1, permission2])
    await this.roleRepository.save([role1, role2])
    await this.userRepository.save([user1, user2])
  }

  async create(createUserDto: CreateUserDto) {
    const findUser = await this.userRepository.findOneBy({
      username: createUserDto.username
    })
    if (findUser) throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST)
    const newUser = new User()
    newUser.username = createUserDto.username
    newUser.password = md5(createUserDto.password)
    return await this.userRepository.save(newUser)
  }

  async findUserDetailById(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId
      }
    })
    return user
  }

  //更新用户信息
  async update(id: number, updateUserDto: UpdateUserDto) {
    const foundUser = await this.userRepository.findOneBy({
      id
    })
    if (!foundUser)
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST)

    const updatedUser = Object.assign(foundUser, updateUserDto)
    try {
      const a = await this.userRepository.save(updatedUser)
      return a
    } catch (e) {
      this.logger.error(e, UserService)
      return '用户信息更新失败'
    }
  }

  //修改用户信息
  async patch(id: number, patchUserDto: PatchUserDto) {
    const foundUser = await this.userRepository.findOneBy({
      id
    })
    if (!foundUser)
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST)

    const patchUser = Object.assign(foundUser, patchUserDto)

    try {
      const a = await this.userRepository.save(patchUser)
      return a
    } catch (e) {
      this.logger.error(e, UserService)
      return '用户信息修改失败'
    }
  }

  async freezeUserById(id: number, isEnable: boolean) {
    const user = await this.userRepository.findOneBy({
      id
    })
    user.isFrozen = isEnable
    console.log(user, 'user')
    const a = await this.userRepository.save(user)
    console.log(a, 'a')
  }

  async findUsers(
    username: string,
    nickName: string,
    email: string,
    page: number,
    pageSize: number
  ) {
    const skipCount = (page - 1) * pageSize

    const condition: Record<string, any> = {}

    if (username) {
      condition.username = Like(`%${username}%`)
    }
    if (nickName) {
      condition.nickName = Like(`%${nickName}%`)
    }
    if (email) {
      condition.email = Like(`%${email}%`)
    }

    const [users, totalCount] = await this.userRepository.findAndCount({
      select: [
        'id',
        'username',
        'nickName',
        'email',
        'phoneNumber',
        'isFrozen',
        'headPic',
        'createTime'
      ],
      skip: skipCount,
      take: pageSize,
      where: condition
    })

    return {
      users,
      totalCount
    }
  }

  async remove(id: number) {
    // const user = await this.userRepository.findOneBy({ id })
    // if(user){
    // }
    // await this.userRepository
    //   .createQueryBuilder('users')
    //   .delete()
    //   .from(User)
    //   .where('id = :id', { id })
    //   .execute()
  }
}
