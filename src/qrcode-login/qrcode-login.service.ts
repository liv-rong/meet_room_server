import { Injectable } from '@nestjs/common';
import { CreateQrcodeLoginDto } from './dto/create-qrcode-login.dto';
import { UpdateQrcodeLoginDto } from './dto/update-qrcode-login.dto';

@Injectable()
export class QrcodeLoginService {
  create(createQrcodeLoginDto: CreateQrcodeLoginDto) {
    return 'This action adds a new qrcodeLogin';
  }

  findAll() {
    return `This action returns all qrcodeLogin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} qrcodeLogin`;
  }

  update(id: number, updateQrcodeLoginDto: UpdateQrcodeLoginDto) {
    return `This action updates a #${id} qrcodeLogin`;
  }

  remove(id: number) {
    return `This action removes a #${id} qrcodeLogin`;
  }
}
