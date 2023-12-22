import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  UploadedFiles
} from '@nestjs/common'
import { UploadService } from './upload.service'
import { CreateUploadDto } from './dto/create-upload.dto'
import { UpdateUploadDto } from './dto/update-upload.dto'
import { UserInfo } from 'src/decorator/custom.decorator'
import {
  FileFieldsInterceptor,
  FileInterceptor
} from '@nestjs/platform-express'
import { storage } from 'src/utils'
import * as path from 'path'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'

@ApiTags('上传文件')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiOperation({ summary: '上传头像' })
  @ApiParam({
    type: 'id',
    name: 'id',
    description: '上传头像Id'
  })
  @Post('upload/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads',
      storage: storage,
      fileFilter(req, file, callback) {
        const extname = path.extname(file.originalname)
        if (['.png', '.jpg', '.gif'].includes(extname)) {
          callback(null, true)
        } else {
          callback(new BadRequestException('只能上传图片'), false)
        }
      }
    })
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param() id: number
  ) {
    return await this.uploadService.uploadFile(file?.path, id)
  }

  @ApiOperation({ summary: '上传批量文件' })
  @Post('/batch')
  @UseInterceptors(FileInterceptor('files'))
  uploadFileList(
    @UploadedFiles()
    files: Array<Express.Multer.File>
  ) {
    console.log(files)
  }

  @Post()
  create(@Body() createUploadDto: CreateUploadDto) {
    return this.uploadService.create(createUploadDto)
  }

  @Get()
  findAll() {
    return this.uploadService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.uploadService.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUploadDto: UpdateUploadDto) {
    return this.uploadService.update(+id, updateUploadDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.uploadService.remove(+id)
  }
}
