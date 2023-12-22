import { Injectable, Logger } from '@nestjs/common'
import { CreateUploadDto } from './dto/create-upload.dto'
import { UpdateUploadDto } from './dto/update-upload.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/user/entities/user.entity'
import { Repository } from 'typeorm'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

@Injectable()
export class UploadService {
  @InjectRepository(User)
  private userRepository: Repository<User>

  private logger = new Logger()

  create(createUploadDto: CreateUploadDto) {
    return 'This action adds a new upload'
  }

  findAll() {
    return `This action returns all upload`
  }

  findOne(id: number) {
    return `This action returns a #${id} upload`
  }

  update(id: number, updateUploadDto: UpdateUploadDto) {
    return `This action updates a #${id} upload`
  }

  remove(id: number) {
    return `This action removes a #${id} upload`
  }

  async uploadFile(path: string, id: number) {
    const foundUser = await this.userRepository.findOneBy({
      id
    })
    foundUser.headPic = path
    try {
      await this.userRepository.save(foundUser)
      return path
    } catch (e) {
      this.logger.error(e, 'UserService')
      return '用户信息修改失败'
    }
  }
}
