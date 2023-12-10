import { Controller, Get, Inject, Logger, SetMetadata } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Inject(WINSTON_LOGGER_TOKEN)
  // private logger

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }
}
