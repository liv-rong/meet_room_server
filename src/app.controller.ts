import { Controller, Get, SetMetadata } from '@nestjs/common'
import { AppService } from './app.service'
import { RequireLogin, UserInfo } from './custom.decorator'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('aaa')
  @SetMetadata('require-login', true)
  @SetMetadata('require-permission', ['ddd'])
  aaaa(@UserInfo('username') username: string, @UserInfo() userInfo) {
    console.log(username, 'username')
    console.log(userInfo, 'userInfo')
    return userInfo
  }

  // @RequireLogin()
  //@SetMetadata('require-login', true)
  // @SetMetadata('require-permission', ['ddd'])
  @SetMetadata('require-login', true)
  @Get('bbb')
  bbb(@UserInfo('username') username: string, @UserInfo() userInfo) {
    console.log(username, 'username')
    console.log(userInfo, 'userInfo')
    return 'bbb'
  }
}
