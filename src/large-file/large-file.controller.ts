import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query
} from '@nestjs/common'
import { LargeFileService } from './large-file.service'
import { CreateLargeFileDto } from './dto/create-large-file.dto'
import { UpdateLargeFileDto } from './dto/update-large-file.dto'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ApiTags } from '@nestjs/swagger'
import * as fs from 'fs'

@ApiTags('大图分布上传')
@Controller('large-file')
export class LargeFileController {
  constructor(private readonly largeFileService: LargeFileService) {}

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      dest: 'uploads'
    })
  )
  uploadFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body
  ) {
    console.log('body', body)
    console.log('files', files)

    const fileName = body.name.match(/(.+)\-\d+$/)[1]
    const chunkDir = 'uploads/chunks_' + fileName

    // 检查切片目录是否存在
    if (!fs.existsSync(chunkDir)) {
      // 如果不存在，创建切片目录
      fs.mkdirSync(chunkDir)
    }

    // 将文件从临时目录移动到切片目录
    console.log(files[0].path, '临时文件夹')
    fs.cpSync(files[0].path, chunkDir + '/' + body.name)

    // 删除临时文件
    fs.rmSync(files[0].path)
  }

  @Get('merge')
  merge(@Query('name') name: string) {
    const chunkDir = 'uploads/chunks_' + name

    // 读取切片目录中的文件列表
    const files = fs.readdirSync(chunkDir)
    console.log(files, '读取的文件')

    // 初始的写入位置
    let startPos = 0

    let count = 0

    // 遍历切片目录中的文件列表
    files.map((file) => {
      // 构造文件的完整路径
      const filePath = chunkDir + '/' + file
      // 创建可读流，从文件中读取数据
      const stream = fs.createReadStream(filePath)
      // 创建可写流，将数据写入最终的文件
      stream
        .pipe(
          fs.createWriteStream('uploads/' + name, {
            start: startPos
          })
        )
        .on('finish', () => {
          count++
          if (count === files.length) {
            console.log(count, 'count')
            // 删除切片目录
            fs.rm(
              chunkDir,
              {
                recursive: true
              },
              () => {}
            )
          }
        })

      // 更新下一个切片的起始位置
      startPos += fs.statSync(filePath).size
    })
  }

  @Get()
  findAll() {
    return this.largeFileService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.largeFileService.findOne(+id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLargeFileDto: UpdateLargeFileDto
  ) {
    return this.largeFileService.update(+id, updateLargeFileDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.largeFileService.remove(+id)
  }
}
