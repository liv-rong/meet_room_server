import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query
} from '@nestjs/common'
import { MeetingRoomService } from './meeting-room.service'
import { generateParseIntPipe } from 'src/utils'
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto'
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto'
import { RequireLogin } from 'src/decorator/custom.decorator'

@ApiTags('会议室管理模块')
@Controller('meeting-room')
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) {}

  @ApiBearerAuth()
  @ApiQuery({
    name: 'pageNo',
    description: '第几页',
    type: Number
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页多少条',
    type: Number
  })
  @ApiQuery({
    name: 'name',
    description: '会议室名字',
    type: String
  })
  @ApiQuery({
    name: 'capacity',
    description: '会议室容量',
    type: String
  })
  @ApiQuery({
    name: 'equipment',
    description: '会议室设备',
    type: String
  })
  @ApiResponse({
    type: String,
    description: '会议室列表'
  })
  @RequireLogin()
  @Get('list')
  async list(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageNo: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(2),
      generateParseIntPipe('pageSize')
    )
    pageSize: number,
    @Query('name') name: string,
    @Query('capacity') capacity: number,
    @Query('equipment') equipment: string
  ) {
    return await this.meetingRoomService.find(
      pageNo,
      pageSize,
      name,
      capacity,
      equipment
    )
  }

  @ApiResponse({
    description: '创建会议室失败'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '创建会议室成功'
  })
  @Post('create')
  async create(@Body() meetingRoomDto: CreateMeetingRoomDto) {
    return await this.meetingRoomService.create(meetingRoomDto)
  }

  @ApiBody({
    type: UpdateMeetingRoomDto
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '更新会议室成功'
  })
  @Put('update')
  async update(@Body() meetingRoomDto: UpdateMeetingRoomDto) {
    return await this.meetingRoomService.update(meetingRoomDto)
  }

  @ApiParam({
    type: 'id',
    name: 'id',
    description: '会议室ID'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '查询到会议室信息'
  })
  @Get(':id')
  async find(@Param('id') id: number) {
    return await this.meetingRoomService.findById(id)
  }

  @ApiParam({
    type: 'id',
    name: 'id',
    description: '会议室ID'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '删除会议室信息'
  })
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.meetingRoomService.delete(id)
  }
}
