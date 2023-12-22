import { Module } from '@nestjs/common'
import { UploadService } from './upload.service'
import { UploadController } from './upload.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/user/entities/user.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]) // 导入并注册UserRepository
  ],
  controllers: [UploadController],
  providers: [UploadService]
})
export class UploadModule {}
