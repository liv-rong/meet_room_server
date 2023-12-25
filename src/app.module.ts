import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from './user/user.module'
import { User } from './user/entities/user.entity'
import { Role } from './user/entities/role.entity'
import { Permission } from './user/entities/permission.entity'
import { RedisModule } from './redis/redis.module'
import { EmailModule } from './email/email.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { APP_GUARD } from '@nestjs/core'
import { LoginGuard } from './guard/login.guard'
import { PermissionGuard } from './guard/permission.guard'
import { AuthModule } from './auth/auth.module'
import { MeetingRoomModule } from './meeting-room/meeting-room.module'
import { MeetingRoom } from './meeting-room/entities/meeting-room.entity'
import { BookingModule } from './booking/booking.module'
import { Booking } from './booking/entities/booking.entity'
import { StatisticModule } from './statistic/statistic.module'
import { UploadModule } from './upload/upload.module'
import { LargeFileModule } from './large-file/large-file.module'
import { QrcodeLoginModule } from './qrcode-login/qrcode-login.module'

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get('jwt_secret'),
          signOptions: {
            expiresIn: '30m'
          }
        }
      },
      inject: [ConfigService]
    }),
    TypeOrmModule.forRootAsync({
      useFactory(configService: ConfigService) {
        return {
          type: 'mysql',
          host: configService.get('mysql_server_host'),
          port: configService.get('mysql_server_port'),
          username: configService.get('mysql_server_username'),
          password: configService.get('mysql_server_password'),
          database: configService.get('mysql_server_database'),
          synchronize: true,
          logging: true,
          entities: [User, Role, Permission, MeetingRoom, Booking],
          poolSize: 10,
          connectorPackage: 'mysql2',
          extra: {
            authPlugin: 'sha256_password'
          }
        }
      },
      inject: [ConfigService]
    }),
    UserModule,
    RedisModule,
    EmailModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [],
      cache: true, // 开启缓存，提高性能
      expandVariables: true // 允许变量扩展
    }),
    AuthModule,
    MeetingRoomModule,
    BookingModule,
    StatisticModule,
    UploadModule,
    LargeFileModule,
    QrcodeLoginModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: LoginGuard
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard
    }
  ]
})
export class AppModule {}
