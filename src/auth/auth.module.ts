import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/user/entities/user.entity'
import { Auth } from './entities/auth.entity'
import { Permission } from 'src/user/entities/permission.entity'
import { Role } from 'src/user/entities/role.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Auth, Role, Permission]) // 导入并注册UserRepository
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
