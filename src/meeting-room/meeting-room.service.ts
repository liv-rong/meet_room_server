import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MeetingRoom } from './entities/meeting-room.entity'
import { Like, Repository } from 'typeorm'
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto'
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto'

@Injectable()
export class MeetingRoomService {
  @InjectRepository(MeetingRoom)
  private repository: Repository<MeetingRoom>
  async find(
    pageNo: number,
    pageSize: number,
    name: string,
    capacity: number,
    equipment: string
  ) {
    if (pageNo < 1) {
      throw new BadRequestException('页码最小为 1')
    }
    const skipCount = (pageNo - 1) * pageSize

    const condition: Record<string, any> = {}

    if (name) {
      condition.name = Like(`%${name}%`)
    }
    if (equipment) {
      condition.equipment = Like(`%${equipment}%`)
    }
    if (capacity) {
      condition.capacity = capacity
    }

    const [meetingRooms, totalCount] = await this.repository.findAndCount({
      skip: skipCount,
      take: pageSize,
      where: condition
    })

    return {
      meetingRooms,
      totalCount
    }
  }
  async create(meetingRoomDto: CreateMeetingRoomDto) {
    const room = await this.repository.findOneBy({
      name: meetingRoomDto.name
    })

    if (room) {
      throw new BadRequestException('会议室名字已存在')
    }

    return await this.repository.save(meetingRoomDto)
  }

  async update(meetingRoomDto: UpdateMeetingRoomDto) {
    const meetingRoom = await this.repository.findOneBy({
      id: meetingRoomDto.id
    })

    if (!meetingRoom) {
      throw new BadRequestException('会议室不存在')
    }

    meetingRoom.capacity = meetingRoomDto.capacity
    meetingRoom.location = meetingRoomDto.location
    meetingRoom.name = meetingRoomDto.name

    if (meetingRoomDto.description) {
      meetingRoom.description = meetingRoomDto.description
    }
    if (meetingRoomDto.equipment) {
      meetingRoom.equipment = meetingRoomDto.equipment
    }

    await this.repository.update(
      {
        id: meetingRoom.id
      },
      meetingRoom
    )
    return 'success'
  }

  async findById(id: number) {
    return this.repository.findOneBy({
      id
    })
  }

  async delete(id: number) {
    await this.repository.delete({
      id
    })
    return 'success'
  }
}
