import { Controller, Get, Inject, Query } from '@nestjs/common'
import { StatisticService } from './statistic.service'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('统计模块')
@Controller('statistic')
export class StatisticController {
  @Inject(StatisticService)
  private statisticService: StatisticService

  @Get('userBookingCount')
  async userBookignCount(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime
  ) {
    return this.statisticService.userBookingCount(startTime, endTime)
  }

  @Get('meetingRoomUsedCount')
  async meetingRoomUsedCount(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime
  ) {
    return this.statisticService.meetingRoomUsedCount(startTime, endTime)
  }
}
