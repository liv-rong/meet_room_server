import { Controller, DefaultValuePipe, Get, Param, Query } from '@nestjs/common'
import { BookingService } from './booking.service'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { generateParseIntPipe } from 'src/utils'

@ApiTags('预定管理模块')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @ApiOperation({ summary: '预定列表' })
  @Get('list')
  async list(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageNo: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(10),
      generateParseIntPipe('pageSize')
    )
    pageSize: number,
    @Query('username') username: string,
    @Query('meetingRoomName') meetingRoomName: string,
    @Query('meetingRoomPosition') meetingRoomPosition: string,
    @Query('bookingTimeRangeStart') bookingTimeRangeStart: number,
    @Query('bookingTimeRangeEnd') bookingTimeRangeEnd: number
  ) {
    return this.bookingService.find(
      pageNo,
      pageSize,
      username,
      meetingRoomName,
      meetingRoomPosition,
      bookingTimeRangeStart,
      bookingTimeRangeEnd
    )
  }

  @ApiOperation({ summary: '根据ID得到预定信息' })
  @Get('apply/:id')
  async apply(@Param('id') id: number) {
    return this.bookingService.apply(id)
  }

  @ApiOperation({ summary: '审批驳回' })
  @Get('reject/:id')
  async reject(@Param('id') id: number) {
    return this.bookingService.reject(id)
  }

  @ApiOperation({ summary: '已解除' })
  @Get('unbind/:id')
  async unbind(@Param('id') id: number) {
    return this.bookingService.unbind(id)
  }

  @ApiOperation({ summary: '催促审批' })
  @Get('urge/:id')
  async urge(@Param('id') id: number) {
    return this.bookingService.urge(id)
  }

  @Get('init')
  async init() {
    return this.bookingService.initData()
  }
}
