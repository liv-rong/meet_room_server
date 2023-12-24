import { Injectable } from '@nestjs/common';
import { CreateLargeFileDto } from './dto/create-large-file.dto';
import { UpdateLargeFileDto } from './dto/update-large-file.dto';

@Injectable()
export class LargeFileService {
  create(createLargeFileDto: CreateLargeFileDto) {
    return 'This action adds a new largeFile';
  }

  findAll() {
    return `This action returns all largeFile`;
  }

  findOne(id: number) {
    return `This action returns a #${id} largeFile`;
  }

  update(id: number, updateLargeFileDto: UpdateLargeFileDto) {
    return `This action updates a #${id} largeFile`;
  }

  remove(id: number) {
    return `This action removes a #${id} largeFile`;
  }
}
