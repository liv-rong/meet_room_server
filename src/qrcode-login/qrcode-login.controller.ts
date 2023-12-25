import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete
} from '@nestjs/common'
import { QrcodeLoginService } from './qrcode-login.service'
import { CreateQrcodeLoginDto } from './dto/create-qrcode-login.dto'
import { UpdateQrcodeLoginDto } from './dto/update-qrcode-login.dto'
import { randomUUID } from 'crypto'
import * as qrcode from 'qrcode'

@Controller('qrcode')
export class QrcodeLoginController {
  constructor(private readonly qrcodeLoginService: QrcodeLoginService) {}

  @Get('generate')
  async generate() {
    const uuid = randomUUID()
    const dataUrl = await qrcode.toDataURL(
      `http://localhost:3000/pages/confirm.html?id=${uuid}`
    )
    return {
      qrcode_id: uuid,
      img: dataUrl
    }
  }

  @Post()
  create(@Body() createQrcodeLoginDto: CreateQrcodeLoginDto) {
    return this.qrcodeLoginService.create(createQrcodeLoginDto)
  }

  @Get()
  findAll() {
    return this.qrcodeLoginService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.qrcodeLoginService.findOne(+id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQrcodeLoginDto: UpdateQrcodeLoginDto
  ) {
    return this.qrcodeLoginService.update(+id, updateQrcodeLoginDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.qrcodeLoginService.remove(+id)
  }
}
